#!/usr/bin/env python3
"""Тест telegram_monitor.py — перевірка секретів та базової логіки."""

import os
import sys
import httpx

# Додаємо шлях для імпорту telegram_monitor
sys.path.insert(0, os.path.dirname(__file__))
from telegram_monitor import detect_language, detect_agent, find_trigger, AGENT_CTA, get_recent_responses_from_db

def test_env():
    print('=== Перевірка змінних середовища ===')
    required = ['TELEGRAM_BOT_TOKEN', 'ANTHROPIC_API_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    ok = True
    for key in required:
        val = os.environ.get(key, '')
        if not val and key == 'SUPABASE_URL':
            val = os.environ.get('NEXT_PUBLIC_SUPABASE_URL', '')
        if val:
            masked = val[:4] + '****' + val[-4:] if len(val) > 8 else '****'
            print(f'  ✅ {key} = {masked}')
        else:
            print(f'  ❌ {key} = <not set>')
            ok = False
    return ok


def test_logic():
    print('\n=== Тест логіки (detect_language, detect_agent, find_trigger) ===')
    cases = [
        ('хочу дізнатись свій знак зодіаку', 'uk', 'LUNA'),
        ('порадьте хорошого астролога', 'uk', 'LUNA'),
        ('расклад таро на отношения', 'ru', 'ARCAS'),
        ('what does my number mean in numerology', 'en', 'NUMI'),
        ('was ist mein Sternzeichen heute', 'de', 'LUNA'),
        ('хочу консультацію психолога', 'uk', 'UMBRA'),
    ]
    ok = True
    for text, expected_lang, expected_agent in cases:
        lang, trigger = find_trigger(text)
        if not lang:
            lang = detect_language(text)
        agent = detect_agent(text)
        status = '✅' if (lang == expected_lang and agent == expected_agent) else '❌'
        if lang != expected_lang or agent != expected_agent:
            ok = False
        print(f'  {status} "{text[:40]}..." → lang={lang}, agent={agent} (expected {expected_lang}, {expected_agent})')
    return ok


def test_telegram_api():
    print('\n=== Перевірка Telegram API (getMe) ===')
    token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
    if not token:
        print('  ⏭️ Пропущено (немає TELEGRAM_BOT_TOKEN)')
        return None
    try:
        r = httpx.get(f'https://api.telegram.org/bot{token}/getMe', timeout=15)
        data = r.json()
        if data.get('ok'):
            bot = data['result']
            print(f"  ✅ Бот OK: @{bot['username']} (id={bot['id']})")
            return True
        else:
            print(f'  ❌ Telegram API error: {data}')
            return False
    except Exception as e:
        print(f'  ❌ Помилка запиту: {e}')
        return False


def test_supabase():
    print('\n=== Перевірка Supabase (OutreachResponse) ===')
    url = os.environ.get('SUPABASE_URL', '').rstrip('/') or os.environ.get('NEXT_PUBLIC_SUPABASE_URL', '').rstrip('/')
    key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')
    if not url or not key:
        print('  ⏭️ Пропущено (немає SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY)')
        return None
    try:
        rows = get_recent_responses_from_db(url, key, hours=24)
        print(f'  ✅ Supabase OK. Отримано {len(rows)} записів outreach_responses за 24год')
        return True
    except Exception as e:
        print(f'  ❌ Помилка Supabase: {e}')
        return False


def test_anthropic():
    print('\n=== Перевірка Anthropic API ===')
    api_key = os.environ.get('ANTHROPIC_API_KEY', '')
    if not api_key:
        print('  ⏭️ Пропущено (немає ANTHROPIC_API_KEY)')
        return None
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)
        msg = client.messages.create(
            model='claude-sonnet-4-6',
            max_tokens=50,
            messages=[{'role': 'user', 'content': 'Say "API test OK"'}],
        )
        text = msg.content[0].text.strip()
        print(f'  ✅ Anthropic OK: "{text[:60]}"')
        return True
    except Exception as e:
        print(f'  ❌ Помилка Anthropic: {e}')
        return False


def main():
    results = {
        'env': test_env(),
        'logic': test_logic(),
        'telegram': test_telegram_api(),
        'supabase': test_supabase(),
        'anthropic': test_anthropic(),
    }
    print('\n=== Підсумок ===')
    for name, ok in results.items():
        if ok is True:
            print(f'  ✅ {name}')
        elif ok is False:
            print(f'  ❌ {name}')
        else:
            print(f'  ⏭️ {name} (пропущено)')

    all_ok = all(v is True for v in results.values() if v is not None)
    sys.exit(0 if all_ok else 1)


if __name__ == '__main__':
    main()
