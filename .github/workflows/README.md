# GitHub Actions CI/CD Setup

## Налаштування Secrets

Для роботи автоматичного деплою потрібно додати наступні secrets в GitHub:

1. Перейдіть в Settings → Secrets and variables → Actions
2. Додайте наступні secrets:

### Обов'язкові secrets:

- `SSH_PRIVATE_KEY` - приватний SSH ключ для підключення до сервера
- `SERVER_IP` - IP адреса сервера (наприклад: `88.99.38.25`)
- `SERVER_USER` - користувач для SSH (наприклад: `root`)
- `DOMAIN` - домен сайту (наприклад: `propart.ae`)
- `APP_DIR` - директорія на сервері (наприклад: `/var/www/propart.ae`)
- `SERVICE_NAME` - назва systemd сервісу (наприклад: `propart-ae`)
- `PORT` - порт для Next.js (наприклад: `3004`)

### Environment variables для Next.js:

- `NEXT_PUBLIC_API_URL` - URL API
- `NEXT_PUBLIC_API_KEY` - API ключ
- `NEXT_PUBLIC_API_SECRET` - API секрет

## Генерація SSH ключа

Якщо у вас ще немає SSH ключа:

```bash
ssh-keygen -t rsa -b 4096 -C "github-actions@propart.ae" -f ~/.ssh/github_actions_deploy
```

Потім додайте публічний ключ на сервер:

```bash
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub root@88.99.38.25
```

Або вручну:

```bash
cat ~/.ssh/github_actions_deploy.pub | ssh root@88.99.38.25 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

Приватний ключ (`~/.ssh/github_actions_deploy`) додайте як secret `SSH_PRIVATE_KEY` в GitHub.

## Як працює

1. При push в `main` або `master` гілку автоматично запускається деплой
2. GitHub Actions:
   - Встановлює Node.js
   - Встановлює залежності
   - Білдить проект
   - Створює архів
   - Завантажує на сервер
   - Розпаковує та встановлює залежності на сервері
   - Білдить проект на сервері
   - Перезапускає systemd сервіс
   - Оновлює nginx конфігурацію

## Ручний запуск

Можна також запустити деплой вручну через GitHub Actions UI:
1. Перейдіть в Actions
2. Виберіть workflow "Deploy to Production"
3. Натисніть "Run workflow"

