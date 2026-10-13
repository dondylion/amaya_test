# Публикация Луми

## Vercel + Neon

1. Создать проект PostgreSQL в Neon, скопировать строку подключения из панели **Connect**.
2. Скопировать `.env.example` в `.env`. Записать строку в `NUXT_DATABASE_URL`. Не добавлять `.env` в Git.
3. Выполнить `npm run db:migrate`. Команда создаёт таблицу и индекс, повторный запуск безопасен. SQL также доступен в `database/001-purchases.sql` для Neon SQL Editor.
4. Создать пустой GitHub/GitLab-репозиторий и отправить текущий проект. При первом подключении:

   ```sh
   git remote add origin <URL-вашего-репозитория>
   git push -u origin main
   ```

5. Импортировать репозиторий в Vercel. Framework — **Nuxt**, Node.js — **24.x**. `vercel.json` задаёт `npm ci` и `npm run build:vercel`; сборка включает Nitro server routes.
6. Добавить `NUXT_DATABASE_URL` в переменные Vercel для Production и Preview. Для preview желательно использовать отдельную Neon branch. Не добавлять префикс `NUXT_PUBLIC_`.
7. Запустить Deploy. Если переменные добавлены после первой публикации, выполнить Redeploy.
8. На публичном URL проверить оба тарифа, покупку, перезагрузку страницы и восстановление. В Neon SQL Editor выполнить:

   ```sql
   SELECT offer_id, amount, created_at, expires_at
   FROM purchases ORDER BY created_at DESC LIMIT 10;
   ```

9. Добавить публичный URL и ссылку репозитория в README. Настроить доступ к Figma на просмотр.

На Vercel отсутствие `NUXT_DATABASE_URL` приводит к понятной ошибке покупки; временный диск не используется как замена постоянной БД. Применение миграции выделено в отдельную команду, а не выполняется при каждом запросе.

Если репозиторий уже опубликован, workflow `.github/workflows/check.yml` запускает линтер, TypeScript, сборку и Playwright на каждый push/PR.

## Node-хостинг с постоянным диском

Можно использовать сервер с Node.js 24 и persistent volume: `npm ci`, `npm run build`, `npm start`. Указать `NUXT_SQLITE_PATH` как абсолютный путь на постоянном диске либо подключить Neon. `npm start` читает локальный `.env`, если он существует. При нескольких экземплярах приложения используйте Neon вместо отдельных SQLite-файлов.

## Особенности тестовой операции

- `POST /api/purchase` принимает только `offerId` и UUID `requestId`; цену определяет сервер.
- Уникальная пара `(device_id, request_id)` защищает от дубликатов при повторе запроса.
- При одинаковом requestId и другом тарифе сервер возвращает 409.
- `POST /api/restore` возвращает активную покупку с наиболее поздним сроком действия для текущего устройства.
- Cookie `lumi_device` — условная идентификация для тестового задания, не полноценная авторизация.
- Время сохраняется в UTC, срок доступа — календарные месяцы с корректной обработкой конца месяца.

Официальная документация: [Nuxt на Vercel](https://vercel.com/docs/frameworks/full-stack/nuxt), [Neon serverless driver](https://neon.com/docs/serverless/serverless-driver).
