#!/bin/bash

echo "🔄 Экспорт и импорт данных БД"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Экспорт локальных данных
echo "📥 Экспортируем данные из локальной БД..."
docker exec links-manager-db pg_dump -U links_user -d links_manager \
  -t parent_categories -t child_categories -t links \
  --data-only --column-inserts > data_export.sql

if [ $? -eq 0 ]; then
  echo "✅ Данные экспортированы в data_export.sql"
else
  echo "❌ Ошибка экспорта"
  exit 1
fi

# 2. Копируем на сервер
echo "📤 Загружаем данные на сервер..."
scp data_export.sql root@109.205.58.19:/var/www/links-manager/

if [ $? -eq 0 ]; then
  echo "✅ Файл загружен на сервер"
else
  echo "❌ Ошибка загрузки"
  exit 1
fi

# 3. Импортируем на сервере
echo "📥 Импортируем данные в БД на сервере..."
ssh root@109.205.58.19 "cd /var/www/links-manager && \
  PGPASSWORD='rqCXhE4Os3z97CNXU4pY' psql -U links_user -h localhost -d links_manager -f data_export.sql && \
  echo '✅ Данные импортированы!'"

# 4. Перезапускаем приложение
echo "🔄 Перезапускаем приложение..."
ssh root@109.205.58.19 "pm2 restart links-manager"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Перенос данных завершен!"
echo "🌐 Проверьте: https://links.saidd.ru"

