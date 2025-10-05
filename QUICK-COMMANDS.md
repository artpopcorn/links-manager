# ⚡ Быстрые команды

## 🚀 Обновление кода на сервере

```bash
# 1. Коммит и пуш
git add .
git commit -m "Описание изменений"
git push origin Верстка

# 2. Обновить сервер
update-links
```

---

## 📊 Перенос данных

```bash
# Автоматический перенос всех данных
./export-import-data.sh
```

---

## 🖼️ Перенос картинок

```bash
# Перенести все картинки из /public/uploads/
scp -r public/uploads/* root@109.205.58.19:/var/www/links-manager/public/uploads/
```

---

## 📋 Мониторинг

```bash
# Статус приложения
status-links

# Логи приложения
logs-links

# Подключиться к серверу
server-links
```

---

## 🔧 Управление на сервере

```bash
# Перезапустить приложение
ssh root@109.205.58.19 "pm2 restart links-manager"

# Обновить схему БД
ssh root@109.205.58.19 "cd /var/www/links-manager && npx prisma db push"

# Пересборка приложения
ssh root@109.205.58.19 "cd /var/www/links-manager && npm run build && pm2 restart links-manager"
```

---

## 🌐 Полезные ссылки

- Сайт: https://links.saidd.ru
- Админка: https://links.saidd.ru/admin
- Логин: `admin` / Пароль: `admin123`

---

## 📖 Документация

- `UPDATE-GUIDE.md` - обновление кода
- `DATA-MIGRATION.md` - перенос данных
- `DEPLOYMENT-SUCCESS.md` - информация о деплое
