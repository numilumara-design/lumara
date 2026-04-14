# META_HANDOFF — Оновлено 2026-04-14

> **Для Claude Code:** При виконанні будь-яких завдань — використовуй спеціалізованих агентів:
> - Написання/зміна коду → `subagent_type: coder` або `sparc-coder`
> - Перевірка коду → `subagent_type: reviewer` або `code-analyzer`
> - Браузерні дії → `subagent_type: general-purpose` з Playwright (але Meta блокує автоматизацію!)
> - Дослідження → `subagent_type: researcher`

---

## ✅ Що працює повністю

### Facebook публікація
- Всі 5 агентів мають never-expiring Page Access Tokens через lumara-bot
- **2026-04-14:** Всі 5 токени перегенеровано через новий lumara-bot System User Token (never-expiring)
- Токени: `{NAME}_PAGE_ACCESS_TOKEN` + `{NAME}_PAGE_ID` в GitHub Secrets
- Workflows: daily-luna (06:00 UTC), daily-arcas (09:00 UTC), daily-numi (05:00 UTC), daily-umbra (17:00 UTC)

### Instagram публікація
- Meta app: **LUMARA Media Publisher** (App ID: `1999886223962354`)
- `IG_ACCESS_TOKEN` — 60-денний User Access Token (до ~2026-06-12) — **оновлено 2026-04-13**
- **2026-04-13:** Токен був інвалідований Meta між 08:05 і 17:58. Відновлено через Graph API Explorer (re-OAuth Volodymyr Shemchuk → `refresh-ig-token.yml`)
- Автооновлення: workflow `refresh-ig-token.yml` — запускається 1-го числа кожного місяця ✅
- Потрібен `IG_APP_SECRET` та `GH_PAT` в GitHub Secrets ✅

### Telegram
- LUNA → свій канал (`TELEGRAM_CHANNEL_ID`) ✅
- ARCAS → свій канал (`ARCAS_TELEGRAM_CHANNEL_ID`) ✅ секрет додано
- NUMI → свій канал (`NUMI_TELEGRAM_CHANNEL_ID`) ✅ секрет додано
- UMBRA → свій канал (`UMBRA_TELEGRAM_CHANNEL_ID`) ✅ секрет додано
- **Правило:** кожен маг публікує тільки у свій Telegram канал. В Telegram LUMARA Academy не публікує ніхто.
- **В Instagram:** всі маги публікують у свій + LUMARA Academy акаунт.

### Node.js 24
- `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` у всіх workflows ✅

---

## ⚠️ В процесі / Потребує дій

### ARCAS Instagram — ✅ ВИРІШЕНО (2026-04-14)
- Новий акаунт `arcaslumara` підключено до ARCAS Facebook Page
- `ARCAS_IG_USER_ID` = `17841434808418165` (arcaslumara) — оновлено в GitHub Secrets
- ARCAS Facebook ✅ + Instagram ✅ + Telegram ✅ — всі платформи працюють
- Підтверджено workflow run 24385779010 (2026-04-14)

### Threads — частково налаштовано
- Новий Meta app: **LUMARA Threads** (Meta App ID: `1688533872139569`, Threads App ID: `2068043707076522`)
- Redirect URL: `https://github.com/schemchuk/lumara` ✅ збережено
- Permissions: `threads_basic` + `threads_content_publish` ✅
- **НЕ зроблено:** OAuth токени для кожного агента
- **Проблема:** для OAuth потрібен доступ до Threads акаунтів агентів (логін/пароль)
- **Наступний крок:** для кожного агента — відкрити OAuth URL → авторизуватись → отримати code → обміняти на токен
- OAuth URL: `https://threads.net/oauth/authorize?client_id=2068043707076522&redirect_uri=https://github.com/schemchuk/lumara&scope=threads_basic,threads_content_publish&response_type=code`

### Instagram Pages — перевірка через API
- При запиті `GET /me/accounts` через Graph API Explorer токен Volodymyr Shemchuk повертає `{}`
- **Причина:** Pages адмініструє акаунт **Lumara Bot**, не особистий Volodymyr Shemchuk
- **Наступний крок:** в Graph API Explorer переключитись на акаунт Lumara Bot → Generate Access Token → перевірити підключені акаунти

---

## ❌ Відкладено

### System User для Instagram (перманентний токен)
- Поточний `IG_ACCESS_TOKEN` живе 60 днів (автооновлення є)
- Для permanent: додати LUMARA Media Publisher до Business Manager → System User
- Business Manager ID: `991789959940552`

---

## Ключові IDs

| Ресурс | ID |
|--------|-----|
| Meta App (Facebook/Lumara Bot) | `959923643254072` |
| Meta App (Instagram/LUMARA Media Publisher) | `1999886223962354` |
| Meta App (Threads/LUMARA Threads) | `1688533872139569` |
| Threads App ID | `2068043707076522` |
| Business Manager (ЛУМАРА) | `991789959940552` |
| System User (lumara-bot) | `61572041038347` |
| LUMARA Page | `1109487505571319` |
| LUNA Page | `1095963640263286` |
| ARCAS Page | `1059568480573429` |
| UMBRA Page | `1115612691630367` |
| NUMI Page | `1064105853456868` |
| lumara_fyi IG | `17841441195331231` |
| umbra.lumara IG | `17841432673699797` |
| arcaslumara IG | `17841434808418165` ✅ новий, підключено 2026-04-14 |

---

## GitHub Secrets — поточний стан

| Secret | Статус | Примітка |
|--------|--------|---------|
| `{NAME}_PAGE_ACCESS_TOKEN` | ✅ всі 5 | never-expiring; **перегенеровано 2026-04-14** через новий lumara-bot System User Token |
| `{NAME}_PAGE_ID` | ✅ всі 5 | |
| `{NAME}_IG_USER_ID` | ✅ всі 5 | ARCAS=17841434808418165 (arcaslumara) оновлено 2026-04-14 |
| `IG_ACCESS_TOKEN` | ✅ | до ~12.06.2026, автооновлення є |
| `IG_APP_SECRET` | ✅ | для автооновлення |
| `IG_APP_ID` | hardcoded `1999886223962354` | |
| `GH_PAT` | ✅ | classic PAT, repo scope |
| `ANTHROPIC_API_KEY` | ✅ | |
| `OPENAI_API_KEY` | ✅ | |
| `TELEGRAM_BOT_TOKEN` | ✅ | |
| `TELEGRAM_CHANNEL_ID` | ✅ | тільки LUNA |
| `ARCAS_TELEGRAM_CHANNEL_ID` | ✅ додано | |
| `NUMI_TELEGRAM_CHANNEL_ID` | ✅ додано | |
| `UMBRA_TELEGRAM_CHANNEL_ID` | ✅ додано | |
| `THREADS_APP_SECRET` | ❌ потрібно додати | |
| `THREADS_APP_ID` | ❌ потрібно додати | значення: `1688533872139569` |
| `{NAME}_THREADS_TOKEN` | ❌ не отримано | потрібен OAuth |
| `{NAME}_THREADS_USER_ID` | ❌ не отримано | |

---

## Пріоритети наступної сесії

1. **Threads OAuth** — отримати логіни/паролі агентів → зробити OAuth для кожного
2. **Перевірити LUNA, NUMI, UMBRA** — переконатись що всі публікують нормально після оновлення Page Access Tokens
