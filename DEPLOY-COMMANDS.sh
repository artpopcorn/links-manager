#!/bin/bash
# Команды для развертывания на сервере links.saidd.ru
# Скопируйте и вставьте эти команды в терминал на сервере

# Сгенерируйте пароль для БД и секреты:
DB_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=' | cut -c1-20)
JWT_SECRET=$(openssl rand -base64 32)
NEXTAUTH_SECRET=$(openssl rand -base64 32)

echo "════════════════════════════════════════════════════════════"
echo "Сохраните эти данные в безопасном месте:"
echo "DB_PASSWORD=$DB_PASSWORD"
echo "JWT_SECRET=$JWT_SECRET"
echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET"
echo "════════════════════════════════════════════════════════════"
echo ""

# 1. Установка пакетов
echo "1️⃣  Установка пакетов..."
apt update && apt install -y git nodejs npm postgresql postgresql-contrib nginx certbot python3-certbot-nginx

# 2. Клонирование проекта
echo "2️⃣  Клонирование проекта..."
mkdir -p /var/www && cd /var/www
if [ -d "links-manager" ]; then
    cd links-manager && git pull origin Верстка
else
    git clone -b Верстка https://github.com/artpopcorn/links-manager.git && cd links-manager
fi

# 3. Создание БД
echo "3️⃣  Создание базы данных..."
systemctl start postgresql && systemctl enable postgresql
sudo -u postgres psql << EOF
CREATE DATABASE links_manager;
CREATE USER links_user WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE links_manager TO links_user;
ALTER DATABASE links_manager OWNER TO links_user;
\q
EOF

# 4. Создание .env
echo "4️⃣  Создание .env файла..."
cat > .env << EOF
DATABASE_URL="postgresql://links_user:$DB_PASSWORD@localhost:5432/links_manager?schema=public"
NEXTAUTH_URL="https://links.saidd.ru"
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
JWT_SECRET="$JWT_SECRET"
EOF

# 5. Применение схемы БД
echo "5️⃣  Применение схемы БД..."
PGPASSWORD=$DB_PASSWORD psql -U links_user -d links_manager -h localhost -f init.sql

# 6. Установка зависимостей
echo "6️⃣  Установка зависимостей..."
npm install

# 7. Prisma
echo "7️⃣  Генерация Prisma Client..."
npx prisma generate

# 8. Создание админа
echo "8️⃣  Создание админ-пользователя..."
node scripts/create-admin.js

# 9. Сборка
echo "9️⃣  Сборка приложения..."
npm run build

# 10. PM2
echo "🔟 Запуск с PM2..."
npm install -g pm2
pm2 delete links-manager 2>/dev/null || true
pm2 start npm --name "links-manager" -- start
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash

# 11. Nginx
echo "1️⃣1️⃣  Настройка Nginx..."
cat > /etc/nginx/sites-available/links.saidd.ru << 'EOF'
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
EOF

ln -sf /etc/nginx/sites-available/links.saidd.ru /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# 12. SSL
echo "1️⃣2️⃣  Настройка SSL..."
certbot --nginx -d links.saidd.ru -d www.links.saidd.ru --non-interactive --agree-tos --email admin@links.saidd.ru --redirect

echo ""
echo "════════════════════════════════════════════════════════════"
echo "✅ ГОТОВО!"
echo "════════════════════════════════════════════════════════════"
echo "🌐 Сайт: https://links.saidd.ru"
echo "👤 Админка: https://links.saidd.ru/admin"
echo "🔑 Логин: admin / Пароль: admin123"
echo ""
pm2 status
pm2 logs links-manager --lines 10
