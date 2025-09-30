# ⚡ Быстрый деплой - Шпаргалка

## 🎯 Минимальные команды для запуска на сервере

### 1️⃣ Подключение и подготовка
```bash
ssh user@links.saidd.ru
cd /path/to/project
git pull origin Верстка
```

### 2️⃣ База данных (один раз)
```bash
# Создать БД
sudo -u postgres psql -c "CREATE DATABASE links_manager;"
sudo -u postgres psql -c "CREATE USER links_user WITH ENCRYPTED PASSWORD 'ваш_пароль';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE links_manager TO links_user;"

# Применить схему
psql -U links_user -d links_manager -h localhost -f init.sql
```

### 3️⃣ Настройка .env (один раз)
```bash
cp env.production.example .env
nano .env
```

**Вставьте:**
```
DATABASE_URL="postgresql://links_user:ваш_пароль@localhost:5432/links_manager?schema=public"
NEXTAUTH_URL="https://links.saidd.ru"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
JWT_SECRET="$(openssl rand -base64 32)"
```

### 4️⃣ Установка
```bash
npm install
npx prisma generate
node scripts/create-admin.js
npm run build
```

### 5️⃣ Запуск с PM2
```bash
npm install -g pm2
pm2 start npm --name "links-manager" -- start
pm2 save
pm2 startup
```

### 6️⃣ Nginx (один раз)
```bash
sudo nano /etc/nginx/sites-available/links.saidd.ru
```

**Минимальная конфигурация:**
```nginx
server {
    listen 80;
    server_name links.saidd.ru;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/links.saidd.ru /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 7️⃣ SSL (один раз)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d links.saidd.ru
```

### 8️⃣ Готово!
Откройте: **https://links.saidd.ru/admin**
Логин: `admin` / `admin123`

---

## 🔄 Обновление (при изменениях кода)
```bash
cd /path/to/project
git pull origin Верстка
npm install
npx prisma generate
npm run build
pm2 restart links-manager
```

---

## 🆘 Проблемы?

**Приложение не запускается:**
```bash
pm2 logs links-manager
```

**Проблемы с БД:**
```bash
psql -U links_user -d links_manager -h localhost
```

**Nginx не работает:**
```bash
sudo nginx -t
sudo systemctl status nginx
```

---

## 📞 Полная документация
См. файл **CHECKLIST.md** для подробных инструкций.
