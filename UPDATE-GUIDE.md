# 🚀 Быстрое обновление сайта

## Workflow для внесения изменений

### 1️⃣ Локально вносите изменения
```bash
# Редактируете код в Cursor/VSCode
```

### 2️⃣ Коммитите и пушите
```bash
git add .
git commit -m "Описание изменений"
git push origin Верстка
```

### 3️⃣ Обновляете на сервере
```bash
update-links
```

**Вот и всё!** ✨

---

## 📋 Полная команда обновления

Если команда `update-links` не работает, используйте:

```bash
ssh root@109.205.58.19 "/var/www/links-manager/update.sh"
```

---

## 🎯 Что делает скрипт обновления

1. **Получает обновления** из Git (ветка Верстка)
2. **Устанавливает** новые npm зависимости (если есть)
3. **Генерирует** Prisma Client (если изменилась схема БД)
4. **Собирает** production build приложения
5. **Перезапускает** приложение через PM2
6. **Показывает** статус приложения

**Время выполнения:** ~2-3 минуты

---

## 🔧 Типичные сценарии

### Только изменили CSS/верстку
```bash
# Быстрое обновление без npm install
ssh root@109.205.58.19 "cd /var/www/links-manager && git pull origin Верстка && npm run build && pm2 restart links-manager"
```

### Изменили схему БД (schema.prisma)
```bash
# После push выполните:
update-links

# Или если нужна миграция:
ssh root@109.205.58.19 "cd /var/www/links-manager && git pull origin Верстка && npx prisma db push && npx prisma generate && npm run build && pm2 restart links-manager"
```

### Добавили новый npm пакет
```bash
# Обычный update-links включает npm install
update-links
```

---

## 🆘 Если что-то пошло не так

### Проверить статус приложения
```bash
ssh root@109.205.58.19 "pm2 status"
```

### Посмотреть логи
```bash
ssh root@109.205.58.19 "pm2 logs links-manager --lines 50"
```

### Перезапустить приложение
```bash
ssh root@109.205.58.19 "pm2 restart links-manager"
```

### Полная пересборка
```bash
ssh root@109.205.58.19 "cd /var/www/links-manager && rm -rf .next node_modules && npm install && npm run build && pm2 restart links-manager"
```

---

## 📊 Мониторинг

### Проверить что сайт работает
```bash
curl -I https://links.saidd.ru
```

### Посмотреть статус PM2
```bash
ssh root@109.205.58.19 "pm2 monit"
```

---

## 💡 Полезные алиасы

Добавьте в `~/.zshrc` для еще большего удобства:

```bash
# Обновление сайта
alias update-links='ssh root@109.205.58.19 "/var/www/links-manager/update.sh"'

# Быстрый просмотр логов
alias logs-links='ssh root@109.205.58.19 "pm2 logs links-manager"'

# Статус приложения
alias status-links='ssh root@109.205.58.19 "pm2 status"'

# Подключение к серверу
alias server-links='ssh root@109.205.58.19'
```

После добавления выполните:
```bash
source ~/.zshrc
```

---

## 🎓 Примеры использования

### Обычное обновление после изменений
```bash
git add .
git commit -m "Изменил цвет кнопок"
git push origin Верстка
update-links
```

### Быстрая проверка после обновления
```bash
update-links && curl -I https://links.saidd.ru
```

---

## ✅ Чеклист перед обновлением

- [ ] Код работает локально
- [ ] Нет ошибок в консоли
- [ ] Изменения закоммичены
- [ ] Push выполнен в ветку Верстка
- [ ] Запущена команда `update-links`
- [ ] Проверен сайт: https://links.saidd.ru

---

**Готово! Теперь обновление сайта занимает меньше минуты!** 🚀
