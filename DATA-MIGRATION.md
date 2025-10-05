# 📊 Перенос данных между БД

## ⚠️ Важно понимать

При деплое переносятся:
- ✅ **Код приложения** (через Git)
- ✅ **Структура БД** (через Prisma schema)
- ❌ **Данные в таблицах** — **НЕ переносятся автоматически!**

---

## 🔄 Автоматический перенос данных

Используйте готовый скрипт:

```bash
./export-import-data.sh
```

Этот скрипт:
1. Экспортирует данные из локальной БД
2. Загружает на сервер
3. Импортирует в БД на сервере
4. Перезапускает приложение

---

## 📝 Ручной перенос данных

### Шаг 1: Экспорт локальных данных

```bash
docker exec links-manager-db pg_dump -U links_user -d links_manager \
  -t parent_categories -t child_categories -t links \
  --data-only --column-inserts > data_export.sql
```

### Шаг 2: Загрузка на сервер

```bash
scp data_export.sql root@109.205.58.19:/var/www/links-manager/
```

### Шаг 3: Импорт на сервере

```bash
ssh root@109.205.58.19 "cd /var/www/links-manager && \
  PGPASSWORD='rqCXhE4Os3z97CNXU4pY' psql -U links_user -h localhost -d links_manager -f data_export.sql"
```

### Шаг 4: Перезапуск приложения

```bash
ssh root@109.205.58.19 "pm2 restart links-manager"
```

---

## 🎯 Что переносится

Скрипт переносит:
- ✅ Родительские категории (`parent_categories`)
- ✅ Дочерние категории (`child_categories`)
- ✅ Ссылки (`links`)
- ❌ Пользователи (не переносятся, они создаются отдельно)

---

## 🆘 Типичные проблемы

### Ошибка: "duplicate key value"

**Причина:** Данные уже существуют в БД  
**Решение:** Это нормально, повторные записи просто пропускаются

### Ошибка: "column does not exist"

**Причина:** Схема БД на сервере не обновлена  
**Решение:** 
```bash
ssh root@109.205.58.19 "cd /var/www/links-manager && npx prisma db push"
```

### Картинки не отображаются

**Причина:** Файлы картинок хранятся в `/public/uploads/` и не переносятся автоматически  
**Решение:** Скопируйте папку uploads:
```bash
scp -r public/uploads/* root@109.205.58.19:/var/www/links-manager/public/uploads/
```

---

## 📦 Полный перенос (код + данные + картинки)

Если нужно перенести всё:

```bash
# 1. Обновить код
git add .
git commit -m "Update"
git push origin Верстка
update-links

# 2. Перенести данные
./export-import-data.sh

# 3. Перенести картинки (если есть)
scp -r public/uploads/* root@109.205.58.19:/var/www/links-manager/public/uploads/
```

---

## 💡 Рекомендации

1. **При первом деплое:** Лучше создать данные заново через админку
2. **При переносе между серверами:** Используйте скрипт
3. **При миграции структуры:** Сначала обновите схему (`prisma db push`), потом импортируйте данные
4. **Backup перед импортом:** Сделайте резервную копию перед импортом больших объемов данных

---

## 🔐 Безопасность

⚠️ **Важно:** 
- Файл `data_export.sql` содержит данные БД
- Он добавлен в `.gitignore` и не попадает в Git
- Не коммитьте этот файл в репозиторий!

---

## ✅ Проверка после импорта

Проверьте количество записей:

```bash
ssh root@109.205.58.19 "PGPASSWORD='rqCXhE4Os3z97CNXU4pY' psql -U links_user -h localhost -d links_manager -c \
  'SELECT 
    (SELECT COUNT(*) FROM parent_categories) as родительские,
    (SELECT COUNT(*) FROM child_categories) as дочерние,
    (SELECT COUNT(*) FROM links) as ссылки;'"
```

Откройте сайт и проверьте:
- 🌐 https://links.saidd.ru
- 🔐 https://links.saidd.ru/admin

---

**Готово! Теперь вы знаете, как переносить данные между БД!** 🚀
