# ✅ Чеклист деплоя на links.saidd.ru

## 📋 Что уже сделано:

- ✅ Создана схема базы данных (init.sql)
- ✅ Создан дамп данных (data_backup.sql - на локальном компьютере)
- ✅ Файлы отправлены в git
- ✅ Подготовлены инструкции

---

## 🚀 ЧТО НУЖНО СДЕЛАТЬ НА СЕРВЕРЕ:

### ШАГ 1: Подключитесь к серверу

```bash
ssh user@links.saidd.ru
# или
ssh root@links.saidd.ru
```

### ШАГ 2: Перейдите в директорию проекта

```bash
cd /path/to/your/project
# Например: cd /var/www/links-manager или cd ~/links-manager
```

### ШАГ 3: Обновите код из git

```bash
git pull origin Верстка
```

### ШАГ 4: Проверьте, установлен ли PostgreSQL

```bash
psql --version
```

**Если не установлен:**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### ШАГ 5: Создайте базу данных

```bash
sudo -u postgres psql
```

**В консоли PostgreSQL выполните:**

```sql
CREATE DATABASE links_manager;
CREATE USER links_user WITH ENCRYPTED PASSWORD 'придумайте_сильный_пароль_здесь';
GRANT ALL PRIVILEGES ON DATABASE links_manager TO links_user;
\q
```

### ШАГ 6: Создайте файл .env

```bash
cp env.production.example .env
nano .env
```

**Отредактируйте .env файл:**

```env
DATABASE_URL="postgresql://links_user:ВАШ_ПАРОЛЬ_ИЗ_ШАГА_5@localhost:5432/links_manager?schema=public"
NEXTAUTH_URL="https://links.saidd.ru"
NEXTAUTH_SECRET="сгенерируйте_командой_ниже"
JWT_SECRET="сгенерируйте_другой_секрет"
```

**Генерация секретов (выполните 2 раза):**

```bash
openssl rand -base64 32
```

Сохраните файл: `Ctrl+X`, затем `Y`, затем `Enter`

### ШАГ 7: Примените схему базы данных

```bash
psql -U links_user -d links_manager -h localhost -f init.sql
# Введите пароль, который создали в ШАГе 5
```

### ШАГ 8: (Опционально) Восстановите данные

**Сначала скопируйте data_backup.sql с локального компьютера:**

На локальном компьютере выполните:

```bash
scp data_backup.sql user@links.saidd.ru:/path/to/project/
```

Затем на сервере:

```bash
psql -U links_user -d links_manager -h localhost -f data_backup.sql
```

### ШАГ 9: Установите зависимости

```bash
npm install
```

### ШАГ 10: Сгенерируйте Prisma Client

```bash
npx prisma generate
```

### ШАГ 11: Создайте админ-пользователя

```bash
node scripts/create-admin.js
```

Это создаст:

- Username: `admin`
- Password: `admin123`

### ШАГ 12: Соберите приложение

```bash
npm run build
```

### ШАГ 13: Проверьте, что приложение запускается

```bash
npm start
```

Если все работает, нажмите `Ctrl+C` для остановки.

### ШАГ 14: Установите PM2 для автозапуска

```bash
sudo npm install -g pm2
pm2 start npm --name "links-manager" -- start
pm2 save
pm2 startup  # Выполните команду, которую выдаст PM2
pm2 logs links-manager  # Проверьте логи
```

### ШАГ 15: Настройте Nginx

```bash
sudo nano /etc/nginx/sites-available/links.saidd.ru
```

**Вставьте конфигурацию:**

```nginx
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
        alias /path/to/project/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

**Замените `/path/to/project/` на реальный путь!**

Сохраните: `Ctrl+X`, `Y`, `Enter`

**Активируйте конфигурацию:**

```bash
sudo ln -s /etc/nginx/sites-available/links.saidd.ru /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### ШАГ 16: Установите SSL сертификат (HTTPS)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d links.saidd.ru -d www.links.saidd.ru
```

Следуйте инструкциям certbot.

### ШАГ 17: Создайте папку для загрузок

```bash
mkdir -p public/uploads
chmod 755 public/uploads
```

### ШАГ 18: Проверьте результат

Откройте в браузере:

- https://links.saidd.ru - главная страница
- https://links.saidd.ru/admin - админ-панель

Войдите с логином: `admin` / `admin123`

---

## 🔥 Быстрые команды для управления

### Перезапуск приложения

```bash
pm2 restart links-manager
```

### Просмотр логов

```bash
pm2 logs links-manager
```

### Остановка приложения

```bash
pm2 stop links-manager
```

### Обновление кода из git

```bash
git pull origin Верстка
npm install
npx prisma generate
npm run build
pm2 restart links-manager
```

---

## 🐛 Устранение проблем

### Проверка подключения к БД

```bash
psql -U links_user -d links_manager -h localhost
\dt  # Показать таблицы
\q   # Выход
```

### Проверка статуса приложения

```bash
pm2 status
```

### Проверка статуса Nginx

```bash
sudo systemctl status nginx
```

### Проверка портов

```bash
netstat -tlnp | grep :3000  # Next.js
netstat -tlnp | grep :5432  # PostgreSQL
```

### Права на папку uploads

```bash
ls -la public/uploads
sudo chown -R $USER:$USER public/uploads
```

---

## 📝 Важные заметки

1. **Пароль БД** - запишите его в надежное место
2. **Секреты в .env** - должны быть уникальными и случайными
3. **Админ-пароль** - смените `admin123` после первого входа
4. **Бэкапы** - настройте регулярное резервное копирование БД
5. **Firewall** - убедитесь, что открыты порты 80 и 443

---

## ✅ После деплоя

- [ ] Сайт открывается по https://links.saidd.ru
- [ ] Админ-панель работает /admin
- [ ] Можно войти как admin
- [ ] Можно добавить/редактировать категории
- [ ] Можно добавить/редактировать ссылки
- [ ] Загрузка изображений работает
- [ ] SSL сертификат установлен (зеленый замок в браузере)

---

**🎉 Готово! Ваше приложение работает!**




