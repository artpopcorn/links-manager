#!/bin/bash

# Скрипт для копирования data_backup.sql на сервер
# Использование: ./COPY-TO-SERVER.sh user@links.saidd.ru /path/to/project

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "❌ Использование: $0 user@server /path/to/project"
    echo "Пример: $0 root@links.saidd.ru /var/www/links-manager"
    exit 1
fi

SERVER=$1
PROJECT_PATH=$2

echo "📦 Копирование data_backup.sql на сервер..."
echo "Сервер: $SERVER"
echo "Путь: $PROJECT_PATH"
echo ""

if [ ! -f "data_backup.sql" ]; then
    echo "❌ Файл data_backup.sql не найден!"
    exit 1
fi

scp data_backup.sql $SERVER:$PROJECT_PATH/

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Файл успешно скопирован!"
    echo ""
    echo "Теперь на сервере выполните:"
    echo "cd $PROJECT_PATH"
    echo "psql -U links_user -d links_manager -h localhost -f data_backup.sql"
else
    echo ""
    echo "❌ Ошибка копирования!"
fi
