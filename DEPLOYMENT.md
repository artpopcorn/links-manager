# Инструкция по развертыванию на VDS (links.saidd.ru)

## 1. Подготовка базы данных на сервере

### Установите PostgreSQL (если еще не установлен)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### Создайте базу данных и пользователя

```bash
sudo -u postgres psql

# В psql выполните:
CREATE DATABASE links_manager;
CREATE USER links_user WITH ENCRYPTED PASSWORD 'your_strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE links_manager TO links_user;
\q
```

## 2. Настройка переменных окружения

Создайте файл `.env` в корне проекта на сервере:

```bash
# Database - замените на реальные данные вашего сервера
DATABASE_URL="postgresql://links_user:your_strong_password_here@localhost:5432/links_manager?schema=public"

# NextAuth.js
NEXTAUTH_URL="https://links.saidd.ru"
NEXTAUTH_SECRET="generate_random_secret_32_chars_minimum_here"

# JWT - используйте другой секрет!
JWT_SECRET="generate_another_random_secret_32_chars_here"
```

**Важно:** Сгенерируйте случайные секреты:

```bash
openssl rand -base64 32
```

## 3. Применение схемы базы данных

### Вариант 1: Использовать готовый SQL скрипт

```bash
# Скопируйте init.sql на сервер
scp init.sql user@links.saidd.ru:/path/to/project/

# На сервере выполните:
psql -U links_user -d links_manager -f init.sql
```

### Вариант 2: Использовать Prisma (рекомендуется)

```bash
# На сервере в директории проекта:
npx prisma db push
```

## 4. Восстановление данных (если нужно перенести данные)

```bash
# Скопируйте data_backup.sql на сервер
scp data_backup.sql user@links.saidd.ru:/path/to/project/

# На сервере выполните:
psql -U links_user -d links_manager -f data_backup.sql
```

## 5. Создание админ-пользователя

```bash
# На сервере в директории проекта:
node scripts/create-admin.js
```

Это создаст пользователя:

- Username: `admin`
- Password: `admin123`

**⚠️ Важно:** Сразу после входа смените пароль!

## 6. Генерация Prisma Client

```bash
npx prisma generate
```

## 7. Сборка и запуск приложения

```bash
# Установите зависимости
npm install

# Соберите приложение
npm run build

# Запустите в production режиме
npm start

# Или используйте PM2 для управления процессом:
npm install -g pm2
pm2 start npm --name "links-manager" -- start
pm2 save
pm2 startup
```

## 8. Настройка Nginx (если используется)

Создайте файл `/etc/nginx/sites-available/links.saidd.ru`:

```nginx
server {
    listen 80;
    server_name links.saidd.ru;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name links.saidd.ru;

    # SSL сертификаты (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/links.saidd.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/links.saidd.ru/privkey.pem;

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

    # Статические файлы (загруженные изображения)
    location /uploads/ {
        alias /path/to/project/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Активируйте конфигурацию:

```bash
sudo ln -s /etc/nginx/sites-available/links.saidd.ru /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 9. SSL сертификат (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d links.saidd.ru
```

## 10. Проверка

1. Откройте https://links.saidd.ru
2. Перейдите на https://links.saidd.ru/admin
3. Войдите с логином `admin` / `admin123`

## Устранение неполадок

### Проверка подключения к БД

```bash
psql -U links_user -d links_manager -h localhost
```

### Проверка логов приложения

```bash
# Если используется PM2:
pm2 logs links-manager

# Или просто:
npm start
```

### Проверка статуса Prisma

```bash
npx prisma db pull  # Проверит подключение и синхронизирует схему
```

### Права на папку uploads

```bash
mkdir -p public/uploads
chmod 755 public/uploads
chown -R www-data:www-data public/uploads  # Или ваш пользователь
```
