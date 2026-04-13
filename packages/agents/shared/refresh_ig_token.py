#!/usr/bin/env python3
"""
refresh_ig_token.py — Автоматичне оновлення IG_ACCESS_TOKEN

Обмінює поточний Long-Lived User Access Token на новий (60 днів).
Запускається через GitHub Actions кожен місяць (1-го числа).

Вимагає змінні середовища:
  IG_ACCESS_TOKEN   — поточний токен (з GitHub Secrets)
  IG_APP_SECRET     — App Secret LUMARA Media Publisher
  IG_APP_ID         — App ID (за замовчуванням: 1999886223962354)

Виводить нові дані для перехоплення workflow:
  NEW_TOKEN=<значення>
  EXPIRES_IN=<секунди>
"""

import os
import sys
import httpx
from datetime import datetime, timedelta


def get_token_info(token: str) -> dict:
    """Отримує інформацію про поточний токен (дату закінчення)."""
    try:
        r = httpx.get(
            'https://graph.facebook.com/debug_token',
            params={
                'input_token': token,
                'access_token': token,
            },
            timeout=30,
        )
        if r.is_success:
            return r.json().get('data', {})
    except Exception:
        pass
    return {}


def exchange_token(token: str, app_id: str, app_secret: str) -> dict:
    """Обмінює токен на новий Long-Lived Token."""
    r = httpx.get(
        'https://graph.facebook.com/oauth/access_token',
        params={
            'grant_type': 'fb_exchange_token',
            'client_id': app_id,
            'client_secret': app_secret,
            'fb_exchange_token': token,
        },
        timeout=30,
    )
    r.raise_for_status()
    return r.json()


def main():
    # Зчитуємо змінні середовища
    token = os.environ.get('IG_ACCESS_TOKEN', '').strip()
    app_secret = os.environ.get('IG_APP_SECRET', '').strip()
    app_id = os.environ.get('IG_APP_ID', '1999886223962354').strip()

    if not token:
        print('❌ IG_ACCESS_TOKEN не вказано', file=sys.stderr)
        sys.exit(1)
    if not app_secret:
        print('❌ IG_APP_SECRET не вказано', file=sys.stderr)
        sys.exit(1)

    # Перевіряємо поточний токен
    print('🔍 Перевірка поточного токена...')
    info = get_token_info(token)
    if info:
        exp_ts = info.get('expires_at', 0)
        if exp_ts:
            exp_date = datetime.fromtimestamp(exp_ts)
            days_left = (exp_date - datetime.now()).days
            print(f'  Поточний токен діє до: {exp_date.strftime("%Y-%m-%d")} ({days_left} днів)')
        is_valid = info.get('is_valid', False)
        print(f'  Токен валідний: {is_valid}')
        if not is_valid:
            print('  ⚠️  Токен вже протух! Потрібна ручна реавторизація через Graph API Explorer.')
            sys.exit(2)
    else:
        print('  ⚠️  Не вдалось перевірити токен через debug_token')

    # Обмінюємо на новий Long-Lived Token
    print()
    print('🔄 Обмін на новий Long-Lived Token...')
    try:
        data = exchange_token(token, app_id, app_secret)
    except httpx.HTTPStatusError as e:
        print(f'❌ Помилка Graph API: {e.response.status_code} {e.response.text[:300]}', file=sys.stderr)
        sys.exit(1)

    new_token = data.get('access_token', '')
    expires_in = data.get('expires_in', 0)

    if not new_token:
        print(f'❌ Неочікувана відповідь: {data}', file=sys.stderr)
        sys.exit(1)

    expires_date = datetime.now() + timedelta(seconds=expires_in)
    print(f'  ✅ Новий токен отримано!')
    print(f'  Дійсний до: {expires_date.strftime("%Y-%m-%d")} ({expires_in // 86400} днів)')
    print()

    # Виводимо для перехоплення workflow
    print(f'NEW_TOKEN={new_token}')
    print(f'EXPIRES_IN={expires_in}')
    print(f'EXPIRES_DATE={expires_date.strftime("%Y-%m-%d")}')


if __name__ == '__main__':
    main()
