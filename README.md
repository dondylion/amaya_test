# Луми · игровой paywall

Nuxt 4 + TypeScript. Выбор тарифа, тестовая покупка и восстановление. Реальные деньги не списываются.

## Запуск

Node.js 24.x:

```sh
npm ci
npm run dev
```

Адрес: http://localhost:3000. Локальная БД SQLite создаётся автоматически в `.data/lumi.sqlite`.

Для Neon: скопировать `.env.example` в `.env`, заполнить `NUXT_DATABASE_URL` и выполнить `npm run db:migrate`. Восстановление работает в том же браузере при сохранённой cookie.

## Команды

- `npm run build && npm start` — production-сборка и запуск.
- `npm run lint`, `npm run typecheck` — проверка кода.
- `npx playwright install chromium`, затем `npm test` — тесты.
- `npm run build:vercel` — сборка для Vercel. [Деплой](docs/DEPLOY.md).

## Структура

- `app/` — интерфейс; `app/assets/css/tokens.css` — параметры оформления.
- `shared/content/ru.ts` — тексты; `shared/constants/` — общие константы.
- `server/api/` — тарифы, покупка, восстановление.
- `server/constants/` — настройки сервера и тарифов.
- `server/utils/database.ts` — работа с БД; `database/` — миграция Neon.
- `tests/` — браузерные и API-тесты.

[Макет Figma](https://www.figma.com/design/RC9hRaoqDardwXCsJq2MQC/?node-id=11-2).
