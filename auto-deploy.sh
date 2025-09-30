#!/bin/bash
# Автоматическое развертывание на links.saidd.ru
set -e

SERVER="109.205.58.19"
USER="root"
PASSWORD="sJiUIEVqcEUI4POz"
DOMAIN="links.saidd.ru"
PROJECT_DIR="/var/www/links-manager"
DB_PASSWORD="$(openssl rand -base64 24 | tr -d '/+=' | cut -c1-20)"

echo "════════════════════════════════════════════════════════════"
echo "🚀 Развертывание links-manager на $DOMAIN"
echo "════════════════════════════════════════════════════════════"
echo ""

# Генерируем секреты
JWT_SECRET=$(openssl rand -base64 32)
NEXTAUTH_SECRET=$(openssl rand -base64 32)

echo "📝 Сгенерированные данные:"
echo "  DB Password: $DB_PASSWORD"
echo "  JWT Secret: $JWT_SECRET"
echo "  NextAuth Secret: $NEXTAUTH_SECRET"
echo ""

# Подключаемся к серверу и выполняем команды
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER << 'ENDSSH'

echo "════════════════════════════════════════════════════════════"
echo "1️⃣  Установка необходимых пакетов..."
echo "════════════════════════════════════════════════════════════"
apt update
apt install -y git nodejs npm postgresql postgresql-contrib nginx certbot python3-certbot-nginx

echo ""
echo "════════════════════════════════════════════════════════════"
echo "2️⃣  Клонирование проекта..."
echo "════════════════════════════════════════════════════════════"
mkdir -p /var/www
cd /var/www
if [ -d "links-manager" ]; then
    cd links-manager
    git pull origin Верстка
else
    git clone -b Верстка https://github.com/artpopcorn/links-manager.git
    cd links-manager
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "3️⃣  Создание базы данных PostgreSQL..."
echo "════════════════════════════════════════════════════════════"
sudo systemctl start postgresql
sudo systemctl enable postgresql

sudo -u postgres psql -c "CREATE DATABASE links_manager;" || echo "БД уже существует"
sudo -u postgres psql -c "CREATE USER links_user WITH ENCRYPTED PASSWORD 'DB_PASSWORD_PLACEHOLDER';" || echo "Пользователь уже существует"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE links_manager TO links_user;"
sudo -u postgres psql -c "ALTER DATABASE links_manager OWNER TO links_user;"

echo ""
echo "════════════════════════════════════════════════════════════"
echo "4️⃣  Создание .env файла..."
echo "════════════════════════════════════════════════════════════"
cat > .env << 'EOF'
DATABASE_URL="postgresql://links_user:DB_PASSWORD_PLACEHOLDER@localhost:5432/links_manager?schema=public"
NEXTAUTH_URL="https://links.saidd.ru"
NEXTAUTH_SECRET="NEXTAUTH_SECRET_PLACEHOLDER"
JWT_SECRET="JWT_SECRET_PLACEHOLDER"
EOF

echo "✅ .env файл создан"

echo ""
echo "════════════════════════════════════════════════════════════"
echo "5️⃣  Применение схемы базы данных..."
echo "════════════════════════════════════════════════════════════"
PGPASSWORD="DB_PASSWORD_PLACEHOLDER" psql -U links_user -d links_manager -h localhost -f init.sql

echo ""
echo "════════════════════════════════════════════════════════════"
echo "6️⃣  Установка зависимостей..."
echo "════════════════════════════════════════════════════════════"
npm install

echo ""
echo "════════════════════════════════════════════════════════════"
echo "7️⃣  Генерация Prisma Client..."
echo "════════════════════════════════════════════════════════════"
npx prisma generate

echo ""
echo "════════════════════════════════════════════════════════════"
echo "8️⃣  Создание админ-пользователя..."
echo "════════════════════════════════════════════════════════════"
node scripts/create-admin.js

echo ""
echo "════════════════════════════════════════════════════════════"
echo "9️⃣  Сборка приложения..."
echo "════════════════════════════════════════════════════════════"
npm run build

echo ""
echo "════════════════════════════════════════════════════════════"
echo "🔟 Установка PM2 и запуск приложения..."
echo "════════════════════════════════════════════════════════════"
npm install -g pm2
pm2 delete links-manager 2>/dev/null || true
pm2 start npm --name "links-manager" -- start
pm2 save
pm2 startup systemd -u root --hp /root

echo ""
echo "════════════════════════════════════════════════════════════"
echo "1️⃣1️⃣  Настройка Nginx..."
echo "════════════════════════════════════════════════════════════"
cat > /etc/nginx/sites-available/links.saidd.ru << 'NGINX'
server {
    listen 80;
    server_name links.saidd.ru www.links.saidd.ru;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        alias /var/www/links-manager/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
NGINX

ln -sf /etc/nginx/sites-available/links.saidd.ru /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo ""
echo "════════════════════════════════════════════════════════════"
echo "1️⃣2️⃣  Настройка SSL (Let's Encrypt)..."
echo "════════════════════════════════════════════════════════════"
certbot --nginx -d links.saidd.ru -d www.links.saidd.ru --non-interactive --agree-tos --email admin@links.saidd.ru --redirect

echo ""
echo "════════════════════════════════════════════════════════════"
echo "✅ РАЗВЕРТЫВАНИЕ ЗАВЕРШЕНО!"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "🌐 Сайт: https://links.saidd.ru"
echo "👤 Админка: https://links.saidd.ru/admin"
echo "🔑 Логин: admin"
echo "🔑 Пароль: admin123"
echo ""
echo "Проверка статуса:"
pm2 status
echo ""
echo "Логи приложения:"
pm2 logs links-manager --lines 20

ENDSSH

echo ""
echo "════════════════════════════════════════════════════════════"
echo "✅ Скрипт выполнен!"
echo "════════════════════════════════════════════════════════════"
