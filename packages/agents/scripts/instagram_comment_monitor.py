#!/usr/bin/env python3
"""
Моніторинг коментарів Instagram — автовідповіді від магів
LUMARA Academy · Запускається кожну годину (cron)

Обов'язкові змінні середовища:
  ANTHROPIC_API_KEY        — ключ Anthropic API
  SUPABASE_URL             — URL Supabase проєкту
  SUPABASE_SERVICE_ROLE_KEY— Service Role Key для запису в БД
  IG_ACCESS_TOKEN          — User Access Token з instagram_basic + instagram_manage_comments

Акаунти для моніторингу (хоча б один):
  LUNA_IG_USER_ID, ARCAS_IG_USER_ID, NUMI_IG_USER_ID, UMBRA_IG_USER_ID

Опційні:
  INSTAGRAM_MAX_PER_DAY         — макс. відповідей на день від акаунту (default 20)
  INSTAGRAM_MAX_THREAD_EXCHANGES— макс. обмінів в гілці до редіректу (default 5)
"""

import os
import sys
import time
import random
import re
import httpx
import anthropic
from datetime import datetime, timezone, timedelta
from typing import Optional

GRAPH_API = 'https://graph.facebook.com/v19.0'
MAX_THREAD_EXCHANGES = 5
THREAD_HISTORY_TTL_DAYS = 7

# ── Конфігурація агентів ───────────────────────────────────────────────────────

AGENTS = ['LUNA', 'ARCAS', 'NUMI', 'UMBRA']

AGENT_SYSTEM_PROMPT = {
    'LUNA': """Ти — LUNA, астрологічний провідник LUMARA Academy.
Відповідай коротко (1-3 речення), тепло і містично.
Дай персональну астрологічну думку — без загальних фраз.
Мова відповіді = мова коментаря користувача.""",
    'ARCAS': """Ти — ARCAS, провідник Таро LUMARA Academy.
Відповідай коротко (1-3 речення), прямо і глибоко.
Дай персональну думку через призму карт — без загальних фраз.
Мова відповіді = мова коментаря користувача.""",
    'NUMI': """Ти — NUMI, нумеролог LUMARA Academy.
Відповідай коротко (1-3 речення), точно і спокійно.
Дай персональну нумерологічну думку — без загальних фраз.
Мова відповіді = мова коментаря користувача.""",
    'UMBRA': """Ти — UMBRA, езо-психолог LUMARA Academy.
Відповідай коротко (1-3 речення), глибоко і без містики.
Дай персональну психологічну думку — без загальних фраз.
Мова відповіді = мова коментаря користувача.""",
}

CTA_BY_LANG = {
    'uk': 'Хочеш більше — посилання в біо 👆',
    'ru': 'Хочешь больше — ссылка в био 👆',
    'en': 'Want more — link in bio 👆',
    'de': 'Mehr dazu — Link in Bio 👆',
}
DEFAULT_CTA = 'Want more — link in bio 👆'

# Повідомлення-редірект після MAX_THREAD_EXCHANGES обмінів
REDIRECT_MESSAGES = {
    'uk': 'Наша розмова стає дуже глибокою — це добрий знак! Продовжимо в Telegram, там зможу дати повну відповідь 🔮 Посилання в біо 👆',
    'ru': 'Наш разговор становится очень глубоким — хороший знак! Продолжим в Telegram, там смогу дать полный ответ 🔮 Ссылка в био 👆',
    'en': "Our conversation is getting really deep — great sign! Let's continue in Telegram where I can give you a full reading 🔮 Link in bio 👆",
    'de': 'Unser Gespräch wird sehr tiefgründig — gutes Zeichen! Lass uns in Telegram weitermachen 🔮 Link in Bio 👆',
}

# ── Утиліти ────────────────────────────────────────────────────────────────────

def log(msg: str):
    ts = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
    print(f'[{ts}] {msg}', flush=True)


def get_monitor_state(supabase_url: str, supabase_key: str, platform: str) -> dict:
    try:
        r = httpx.get(
            f'{supabase_url}/rest/v1/monitor_states?platform=eq.{platform}&select=state',
            headers={'apikey': supabase_key, 'Authorization': f'Bearer {supabase_key}'},
            timeout=30,
        )
        r.raise_for_status()
        data = r.json()
        if data:
            return data[0].get('state', {})
    except Exception as e:
        log(f'⚠️ Помилка читання state з БД: {e}')
    return {}


def set_monitor_state(supabase_url: str, supabase_key: str, platform: str, state: dict):
    try:
        r = httpx.post(
            f'{supabase_url}/rest/v1/monitor_states',
            headers={
                'apikey': supabase_key,
                'Authorization': f'Bearer {supabase_key}',
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates,return=minimal',
            },
            json={'platform': platform, 'state': state},
            timeout=30,
        )
        r.raise_for_status()
    except Exception as e:
        log(f'⚠️ Помилка збереження state в БД: {e}')


def detect_language(text: str) -> str:
    t = text.lower()
    if re.search(r'[іїєґ]', t):
        return 'uk'
    if re.search(r'[ыъёэ]', t):
        return 'ru'
    if re.search(r'[äöüß]', t):
        return 'de'
    ru_words = ['очень', 'спасибо', 'интересно', 'привет', 'хорошо', 'классно', 'здорово', 'подскажите']
    de_words = ['das', 'ist', 'wirklich', 'toll', 'danke', 'gut', 'schön', 'mehr', 'liebe']
    en_words = ['the', 'and', 'you', 'what', 'my', 'for', 'is', 'are', 'love', 'thank', 'amazing', 'great', 'nice']
    uk_words = ['дуже', 'дякую', 'цікаво', 'привіт', 'гарно', 'класно', 'чудово', 'підкажіть']
    scores = {
        'ru': sum(1 for w in ru_words if w in t),
        'de': sum(1 for w in de_words if w in t),
        'en': sum(1 for w in en_words if w in t),
        'uk': sum(1 for w in uk_words if w in t),
    }
    best = max(scores, key=scores.get)
    if scores[best] > 0:
        return best
    if re.search(r'[а-я]', t):
        return 'uk'
    return 'en'


def generate_first_response(agent_type: str, comment_text: str, language: str, commenter_name: str) -> str:
    """Перша відповідь на коментар (без CTA — додається окремо)."""
    client = anthropic.Anthropic(api_key=os.environ['ANTHROPIC_API_KEY'])
    system = AGENT_SYSTEM_PROMPT[agent_type]
    prompt = (
        f'@{commenter_name} залишив коментар: """{comment_text}"""\n\n'
        f"Напиши коротку (1-3 речення) персональну відповідь мовою '{language}'. "
        f"Без хештегів. Без CTA."
    )
    try:
        msg = client.messages.create(
            model='claude-sonnet-4-6',
            max_tokens=250,
            system=system,
            messages=[{'role': 'user', 'content': prompt}],
        )
        return msg.content[0].text.strip()
    except Exception as e:
        log(f'  ⚠️ Помилка Claude: {e}')
        return ''


def generate_thread_response(
    agent_type: str,
    thread_messages: list,
    new_reply_text: str,
    language: str,
    commenter_name: str,
) -> str:
    """Відповідь у гілці з повним контекстом розмови. Без CTA."""
    client = anthropic.Anthropic(api_key=os.environ['ANTHROPIC_API_KEY'])
    system = AGENT_SYSTEM_PROMPT[agent_type]

    # Конвертуємо збережену гілку у формат Claude messages
    messages = []
    for m in thread_messages:
        if m['role'] == 'user':
            messages.append({'role': 'user', 'content': f"@{m.get('username', 'user')}: {m['text']}"})
        else:
            messages.append({'role': 'assistant', 'content': m['text']})

    # Додаємо нову відповідь користувача
    messages.append({
        'role': 'user',
        'content': (
            f'@{commenter_name}: {new_reply_text}\n\n'
            f"Відповідай мовою '{language}'. 1-3 речення. Без хештегів. Без CTA."
        ),
    })

    try:
        msg = client.messages.create(
            model='claude-sonnet-4-6',
            max_tokens=250,
            system=system,
            messages=messages,
        )
        return msg.content[0].text.strip()
    except Exception as e:
        log(f'  ⚠️ Помилка Claude (thread): {e}')
        return ''


def get_recent_responses_from_db(supabase_url: str, supabase_key: str, platform: str, hours: int = 24) -> list:
    since = (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()
    try:
        r = httpx.get(
            f'{supabase_url}/rest/v1/outreach_responses',
            headers={'apikey': supabase_key, 'Authorization': f'Bearer {supabase_key}'},
            params={'platform': f'eq.{platform}', 'created_at': f'gte.{since}', 'select': '*'},
            timeout=30,
        )
        r.raise_for_status()
        return r.json()
    except Exception as e:
        log(f'⚠️ Помилка читання з БД: {e}')
        return []


def save_response_to_db(
    supabase_url: str,
    supabase_key: str,
    agent_type: str,
    language: str,
    external_post_id: Optional[str],
    external_thread_id: Optional[str],
    response_text: str,
    user_handle: Optional[str],
):
    payload = {
        'platform': 'INSTAGRAM_COMMENT',
        'agent_type': agent_type,
        'language': language.upper(),
        'external_post_id': external_post_id,
        'external_thread_id': external_thread_id,
        'response_text': response_text,
        'user_handle': user_handle,
    }
    try:
        r = httpx.post(
            f'{supabase_url}/rest/v1/outreach_responses',
            headers={
                'apikey': supabase_key,
                'Authorization': f'Bearer {supabase_key}',
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal',
            },
            json=payload,
            timeout=30,
        )
        r.raise_for_status()
        log('  💾 Збережено в БД')
    except Exception as e:
        log(f'  ⚠️ Помилка збереження в БД: {e}')


# ── Meta Graph API ─────────────────────────────────────────────────────────────

class InstagramMonitor:
    def __init__(self, access_token: str):
        self.token = access_token

    def _get(self, path: str, params: Optional[dict] = None) -> dict:
        p = {'access_token': self.token}
        if params:
            p.update(params)
        r = httpx.get(f'{GRAPH_API}{path}', params=p, timeout=30)
        r.raise_for_status()
        data = r.json()
        if 'error' in data:
            raise RuntimeError(f'Meta API error: {data["error"]}')
        return data

    def _post(self, path: str, params: Optional[dict] = None) -> dict:
        p = {'access_token': self.token}
        if params:
            p.update(params)
        r = httpx.post(f'{GRAPH_API}{path}', params=p, timeout=30)
        r.raise_for_status()
        data = r.json()
        if 'error' in data:
            raise RuntimeError(f'Meta API error: {data["error"]}')
        return data

    def get_media(self, ig_user_id: str, limit: int = 25) -> list:
        data = self._get(f'/{ig_user_id}/media', {'fields': 'id,caption,permalink', 'limit': limit})
        return data.get('data', [])

    def get_comments(self, media_id: str, limit: int = 50) -> list:
        data = self._get(f'/{media_id}/comments', {'fields': 'id,text,username,timestamp', 'limit': limit})
        return data.get('data', [])

    def get_replies(self, comment_id: str, limit: int = 50) -> list:
        """Отримує replies до коментаря (плоска структура Instagram)."""
        try:
            data = self._get(
                f'/{comment_id}/replies',
                {'fields': 'id,text,username,timestamp', 'limit': limit},
            )
            return data.get('data', [])
        except Exception as e:
            log(f'    ⚠️ Помилка отримання replies для {comment_id}: {e}')
            return []

    def reply_to_comment(self, comment_id: str, message: str) -> Optional[str]:
        """Публікує reply, повертає ID нової відповіді."""
        data = self._post(f'/{comment_id}/replies', {'message': message[:2200]})
        return data.get('id')


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    required = ['ANTHROPIC_API_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'IG_ACCESS_TOKEN']
    missing = [v for v in required if not os.environ.get(v)]
    if missing:
        log(f'❌ Відсутні змінні середовища: {", ".join(missing)}')
        sys.exit(1)

    supabase_url = (os.environ.get('SUPABASE_URL') or os.environ.get('NEXT_PUBLIC_SUPABASE_URL', '')).rstrip('/')
    supabase_key = os.environ['SUPABASE_SERVICE_ROLE_KEY']
    access_token = os.environ['IG_ACCESS_TOKEN']
    max_per_day = int(os.environ.get('INSTAGRAM_MAX_PER_DAY', '20'))
    max_exchanges = int(os.environ.get('INSTAGRAM_MAX_THREAD_EXCHANGES', str(MAX_THREAD_EXCHANGES)))

    accounts = []
    for agent in AGENTS:
        ig_id = os.environ.get(f'{agent}_IG_USER_ID', '').strip()
        if ig_id:
            accounts.append({'agent': agent, 'ig_user_id': ig_id})

    if not accounts:
        log('⚠️ Не налаштовано жодного IG_USER_ID для моніторингу')
        sys.exit(0)

    monitor = InstagramMonitor(access_token)
    state = get_monitor_state(supabase_url, supabase_key, 'INSTAGRAM')

    processed_ids: set = set(state.get('processed_comment_ids', []))
    # IDs коментарів, які опублікував сам маг (щоб не відповідати на себе)
    our_reply_ids: set = set(state.get('our_reply_ids', []))
    last_response_at: dict = state.get('last_response_at', {})
    # Структура: { root_comment_id: { exchange_count, lang, messages, redirected, last_activity } }
    thread_histories: dict = state.get('thread_histories', {})

    # Очищення застарілих гілок
    cutoff = datetime.now(timezone.utc) - timedelta(days=THREAD_HISTORY_TTL_DAYS)
    thread_histories = {
        k: v for k, v in thread_histories.items()
        if datetime.fromisoformat(v.get('last_activity', '2000-01-01T00:00:00+00:00').replace('Z', '+00:00')) > cutoff
    }

    recent_responses = get_recent_responses_from_db(supabase_url, supabase_key, 'INSTAGRAM_COMMENT', hours=24)
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    total_processed = 0

    for acc in accounts:
        agent = acc['agent']
        ig_user_id = acc['ig_user_id']
        log(f'\n📸 [{agent}] Моніторинг Instagram акаунту {ig_user_id}...')

        agent_today_count = sum(
            1 for r in recent_responses
            if r.get('agent_type') == agent
            and datetime.fromisoformat(r['created_at'].replace('Z', '+00:00')) >= today_start
        )
        if agent_today_count >= max_per_day:
            log(f'  ⏸️ Денний ліміт {max_per_day} для {agent} досягнуто')
            continue

        now_ts = time.time()
        last_at = last_response_at.get(agent, 0)
        min_gap = 300  # 5 хвилин між відповідями одного агента
        if now_ts - last_at < min_gap:
            log(f'  ⏸️ Пауза {int((min_gap - (now_ts - last_at)) / 60)}хв для {agent}')
            continue

        try:
            posts = monitor.get_media(ig_user_id, limit=10)
        except Exception as e:
            err = str(e)
            if '400' in err:
                log(f'  ❌ Помилка отримання постів: 400 Bad Request — перевір IG_USER_ID та права токена')
            else:
                log(f'  ❌ Помилка отримання постів: {e}')
            continue

        log(f'  📄 Знайдено {len(posts)} постів')

        for post in posts:
            if agent_today_count >= max_per_day:
                break

            media_id = post['id']
            try:
                comments = monitor.get_comments(media_id, limit=50)
            except Exception as e:
                log(f'    ❌ Помилка коментарів поста {media_id}: {e}')
                continue

            for comment in comments:
                if agent_today_count >= max_per_day:
                    break

                comment_id = comment['id']
                text = comment.get('text', '')
                username = comment.get('username', '')

                # Пропускаємо власні публікації мага
                if comment_id in our_reply_ids:
                    continue

                if not text or not username:
                    processed_ids.add(comment_id)
                    continue

                # ── НОВИЙ коментар: перша відповідь ───────────────────────────
                if comment_id not in processed_ids:
                    log(f'  💬 Новий коментар від @{username}: {text[:60]}')
                    lang = detect_language(text)
                    reply_body = generate_first_response(agent, text, lang, username)
                    if not reply_body:
                        processed_ids.add(comment_id)
                        continue

                    cta = CTA_BY_LANG.get(lang, DEFAULT_CTA)
                    full_reply = f'@{username}, {reply_body}\n\n{cta}'

                    try:
                        delay = random.randint(5, 15)
                        log(f'    ⏳ Затримка {delay}с...')
                        time.sleep(delay)

                        new_id = monitor.reply_to_comment(comment_id, full_reply)
                        log(f'    ✅ Перша відповідь відправлена')
                        total_processed += 1

                        processed_ids.add(comment_id)
                        if new_id:
                            our_reply_ids.add(new_id)
                        last_response_at[agent] = time.time()

                        # Ініціалізуємо гілку
                        thread_histories[comment_id] = {
                            'exchange_count': 1,
                            'lang': lang,
                            'messages': [
                                {'role': 'user', 'text': text, 'username': username, 'comment_id': comment_id},
                                {'role': 'agent', 'text': full_reply, 'comment_id': new_id},
                            ],
                            'redirected': False,
                            'last_activity': datetime.now(timezone.utc).isoformat(),
                        }

                        save_response_to_db(
                            supabase_url, supabase_key,
                            agent_type=agent, language=lang,
                            external_post_id=media_id, external_thread_id=comment_id,
                            response_text=full_reply, user_handle=username,
                        )
                        recent_responses.append({
                            'agent_type': agent,
                            'created_at': datetime.now(timezone.utc).isoformat(),
                        })
                        agent_today_count += 1

                    except Exception as e:
                        err_str = str(e)
                        if 'instagram_manage_comments' in err_str.lower() or '(#10)' in err_str:
                            log(f'    ❌ Немає дозволу instagram_manage_comments. Перевір права токена.')
                        else:
                            log(f'    ❌ Помилка відповіді: {e}')
                        processed_ids.add(comment_id)

                # ── ІСНУЮЧИЙ коментар: перевіряємо replies в гілці ────────────
                elif comment_id in thread_histories:
                    thread = thread_histories[comment_id]

                    if thread.get('redirected'):
                        continue  # Гілку вже закрито редіректом

                    replies = monitor.get_replies(comment_id)
                    if not replies:
                        continue

                    log(f'  🔍 Гілка @{username} ({thread["exchange_count"]} обмінів): перевіряю {len(replies)} replies')

                    for reply in replies:
                        if agent_today_count >= max_per_day:
                            break

                        reply_id = reply['id']
                        reply_text = reply.get('text', '')
                        reply_username = reply.get('username', '')

                        # Пропускаємо власні та вже оброблені
                        if reply_id in our_reply_ids or reply_id in processed_ids:
                            continue
                        if not reply_text or not reply_username:
                            processed_ids.add(reply_id)
                            continue

                        processed_ids.add(reply_id)
                        lang = thread.get('lang', detect_language(reply_text))
                        exchange_count = thread.get('exchange_count', 1)

                        log(f'    💬 Нова відповідь від @{reply_username} (обмін {exchange_count + 1}): {reply_text[:60]}')

                        # ── Ліміт досягнуто — редірект ────────────────────────
                        if exchange_count >= max_exchanges:
                            redirect_text = REDIRECT_MESSAGES.get(lang, REDIRECT_MESSAGES['en'])
                            full_redirect = f'@{reply_username}, {redirect_text}'
                            try:
                                time.sleep(random.randint(5, 15))
                                new_id = monitor.reply_to_comment(comment_id, full_redirect)
                                if new_id:
                                    our_reply_ids.add(new_id)
                                thread['redirected'] = True
                                thread['last_activity'] = datetime.now(timezone.utc).isoformat()
                                log(f'    🔄 Редірект відправлено (досягнуто {max_exchanges} обмінів)')

                                save_response_to_db(
                                    supabase_url, supabase_key,
                                    agent_type=agent, language=lang,
                                    external_post_id=media_id, external_thread_id=comment_id,
                                    response_text=full_redirect, user_handle=reply_username,
                                )
                                agent_today_count += 1
                                last_response_at[agent] = time.time()
                            except Exception as e:
                                log(f'    ❌ Помилка редіректу: {e}')

                        # ── Продовжуємо діалог ─────────────────────────────────
                        else:
                            response_body = generate_thread_response(
                                agent, thread['messages'], reply_text, lang, reply_username,
                            )
                            if not response_body:
                                continue

                            full_reply = f'@{reply_username}, {response_body}'
                            try:
                                delay = random.randint(5, 15)
                                log(f'    ⏳ Затримка {delay}с...')
                                time.sleep(delay)

                                new_id = monitor.reply_to_comment(comment_id, full_reply)
                                log(f'    ✅ Відповідь у гілці відправлена (обмін {exchange_count + 1})')
                                total_processed += 1

                                if new_id:
                                    our_reply_ids.add(new_id)
                                last_response_at[agent] = time.time()

                                # Оновлюємо гілку
                                thread['messages'].append({
                                    'role': 'user', 'text': reply_text,
                                    'username': reply_username, 'comment_id': reply_id,
                                })
                                thread['messages'].append({
                                    'role': 'agent', 'text': full_reply, 'comment_id': new_id,
                                })
                                thread['exchange_count'] = exchange_count + 1
                                thread['last_activity'] = datetime.now(timezone.utc).isoformat()

                                save_response_to_db(
                                    supabase_url, supabase_key,
                                    agent_type=agent, language=lang,
                                    external_post_id=media_id, external_thread_id=comment_id,
                                    response_text=full_reply, user_handle=reply_username,
                                )
                                recent_responses.append({
                                    'agent_type': agent,
                                    'created_at': datetime.now(timezone.utc).isoformat(),
                                })
                                agent_today_count += 1

                            except Exception as e:
                                err_str = str(e)
                                if 'instagram_manage_comments' in err_str.lower() or '(#10)' in err_str:
                                    log(f'    ❌ Немає дозволу instagram_manage_comments.')
                                else:
                                    log(f'    ❌ Помилка відповіді в гілці: {e}')

    # Обрізаємо великі колекції
    processed_ids = set(list(processed_ids)[-5000:])
    our_reply_ids = set(list(our_reply_ids)[-2000:])
    # Зберігаємо не більше 1000 гілок (найновіші за last_activity)
    if len(thread_histories) > 1000:
        sorted_threads = sorted(
            thread_histories.items(),
            key=lambda x: x[1].get('last_activity', ''),
            reverse=True,
        )
        thread_histories = dict(sorted_threads[:1000])

    new_state = {
        'processed_comment_ids': list(processed_ids),
        'our_reply_ids': list(our_reply_ids),
        'last_response_at': last_response_at,
        'thread_histories': thread_histories,
    }
    set_monitor_state(supabase_url, supabase_key, 'INSTAGRAM', new_state)
    log(f'\n✅ Готово. Всього відповідей: {total_processed}')


if __name__ == '__main__':
    main()
