#!/usr/bin/env python3
"""Тест instagram_comment_monitor.py — перевірка секретів та базової логіки."""

import os
import sys
import httpx

sys.path.insert(0, os.path.dirname(__file__))
from instagram_comment_monitor import detect_language, InstagramMonitor, get_recent_responses_from_db

def test_env():
    print('=== Перевірка змінних середовища ===')
    required = ['ANTHROPIC_API_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'IG_ACCESS_TOKEN']
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
    print('\n=== Тест логіки (detect_language) ===')
    cases = [
        ('Дуже цікавий пост! Хочу більше', 'uk'),
        ('Очень интересно, спасибо', 'ru'),
        ('This is amazing thank you', 'en'),
        ('Das ist wirklich toll', 'de'),
    ]
    ok = True
    for text, expected in cases:
        lang = detect_language(text)
        status = '✅' if lang == expected else '❌'
        if lang != expected:
            ok = False
        print(f'  {status} "{text[:40]}..." → {lang} (expected {expected})')
    return ok


def test_meta_api():
    print('\n=== Перевірка Meta Graph API (debug token) ===')
    token = os.environ.get('IG_ACCESS_TOKEN', '')
    if not token:
        print('  ⏭️ Пропущено (немає IG_ACCESS_TOKEN)')
        return None
    try:
        r = httpx.get(
            'https://graph.facebook.com/v19.0/debug_token',
            params={'input_token': token, 'access_token': token},
            timeout=15,
        )
        data = r.json()
        if data.get('data', {}).get('is_valid'):
            d = data['data']
            print(f"  ✅ Token valid. App={d.get('app_id')}, expires={d.get('expires_at')}")
            return True
        else:
            err = data.get('data', {}).get('error', data)
            print(f'  ❌ Token invalid: {err}')
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
        rows = get_recent_responses_from_db(url, key, 'INSTAGRAM_COMMENT', hours=24)
        print(f'  ✅ Supabase OK. Отримано {len(rows)} записів за 24год')
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
            messages=[{'role': 'user', 'content': 'Say "Instagram monitor test OK"'}],
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
        'meta_api': test_meta_api(),
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
