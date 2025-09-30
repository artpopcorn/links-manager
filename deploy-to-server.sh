#!/bin/bash

# Скрипт для развертывания links-manager на VDS
# Использование: ./deploy-to-server.sh

set -e  # Остановить при ошибке

echo "🚀 Развертывание links-manager на сервере"
echo "========================================="

# Проверка наличия необходимых файлов
if [ ! -f "init.sql" ]; then
    echo "❌ Файл init.sql не найден!"
    echo "Запустите: npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > init.sql"
    exit 1
fi

if [ ! -f "data_backup.sql" ]; then
    echo "⚠️  Файл data_backup.sql не найден. Данные не будут перенесены."
    read -p "Продолжить без переноса данных? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Запрос данных сервера
read -p "🌐 Введите адрес сервера (например: user@links.saidd.ru): " SERVER
read -p "📁 Введите путь к проекту на сервере: " PROJECT_PATH

echo ""
echo "📦 Копирование файлов на сервер..."

# Копирование SQL файлов
scp init.sql $SERVER:$PROJECT_PATH/
if [ -f "data_backup.sql" ]; then
    scp data_backup.sql $SERVER:$PROJECT_PATH/
fi

# Копирование примера .env
scp env.production.example $SERVER:$PROJECT_PATH/

echo ""
echo "✅ Файлы скопированы!"
echo ""
echo "📝 Следующие шаги на сервере:"
echo ""
echo "1. Подключитесь к серверу:"
echo "   ssh $SERVER"
echo ""
echo "2. Перейдите в директорию проекта:"
echo "   cd $PROJECT_PATH"
echo ""
echo "3. Создайте .env файл:"
echo "   cp env.production.example .env"
echo "   nano .env  # Отредактируйте и сохраните"
echo ""
echo "4. Создайте базу данных:"
echo "   sudo -u postgres psql"
echo "   CREATE DATABASE links_manager;"
echo "   CREATE USER links_user WITH ENCRYPTED PASSWORD 'ваш_пароль';"
echo "   GRANT ALL PRIVILEGES ON DATABASE links_manager TO links_user;"
echo "   \\q"
echo ""
echo "5. Примените схему базы данных:"
echo "   psql -U links_user -d links_manager -f init.sql"
echo ""
if [ -f "data_backup.sql" ]; then
echo "6. Восстановите данные:"
echo "   psql -U links_user -d links_manager -f data_backup.sql"
echo ""
echo "7. Создайте админ-пользователя:"
else
echo "6. Создайте админ-пользователя:"
fi
echo "   node scripts/create-admin.js"
echo ""
echo "8. Установите зависимости и запустите:"
echo "   npm install"
echo "   npx prisma generate"
echo "   npm run build"
echo "   npm start"
echo ""
echo "📖 Подробная инструкция в файле DEPLOYMENT.md"
