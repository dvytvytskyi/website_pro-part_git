# Налаштування CI/CD для автоматичного деплою

## Крок 1: Генерація SSH ключа

Створіть SSH ключ для GitHub Actions (якщо ще не маєте):

```bash
ssh-keygen -t rsa -b 4096 -C "github-actions@propart.ae" -f ~/.ssh/github_actions_deploy
```

**Не встановлюйте пароль** (просто натисніть Enter).

## Крок 2: Додавання публічного ключа на сервер

Скопіюйте публічний ключ на сервер:

```bash
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub root@88.99.38.25
```

Або вручну:

```bash
cat ~/.ssh/github_actions_deploy.pub | ssh root@88.99.38.25 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

## Крок 3: Додавання Secrets в GitHub

1. Перейдіть в ваш GitHub репозиторій: https://github.com/dvytvytskyi/website_pro-part_git
2. Перейдіть в **Settings** → **Secrets and variables** → **Actions**
3. Натисніть **New repository secret**
4. Додайте наступні secrets:

### Обов'язкові secrets:

| Name | Value | Приклад |
|------|-------|---------|
| `SSH_PRIVATE_KEY` | Вміст приватного ключа | `cat ~/.ssh/github_actions_deploy` (весь вміст файлу) |
| `SERVER_IP` | IP адреса сервера | `88.99.38.25` |
| `SERVER_USER` | SSH користувач | `root` |
| `DOMAIN` | Домен сайту | `propart.ae` |
| `APP_DIR` | Директорія на сервері | `/var/www/propart.ae` |
| `SERVICE_NAME` | Назва systemd сервісу | `propart-ae` |
| `PORT` | Порт для Next.js | `3004` |

### Environment variables для Next.js:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_API_URL` | `https://admin.pro-part.online/api` |
| `NEXT_PUBLIC_API_KEY` | `fyr_8f968d115244e76d209a26f5177c5c998aca0e8dbce4a6e9071b2bc43b78f6d2` |
| `NEXT_PUBLIC_API_SECRET` | `5c8335f9c7e476cbe77454fd32532cc68f57baf86f7f96e6bafcf682f98b275bc579d73484cf5bada7f4cd7d071b122778b71f414fb96b741c5fe60394d1795f` |

## Крок 4: Перевірка

Після додавання всіх secrets:

1. Зробіть commit та push в `main` або `master` гілку
2. Перейдіть в **Actions** в GitHub
3. Подивіться, чи запустився workflow "Deploy to Production"
4. Перевірте логи деплою

## Як працює

- **Автоматичний деплой**: При кожному push в `main` або `master` гілку автоматично запускається деплой
- **Ручний запуск**: Можна запустити вручну через GitHub Actions UI (кнопка "Run workflow")

## Troubleshooting

### Помилка "Permission denied (publickey)"

- Перевірте, чи правильно скопійовано публічний ключ на сервер
- Перевірте, чи правильно додано приватний ключ як secret `SSH_PRIVATE_KEY`

### Помилка "Connection refused"

- Перевірте, чи сервер доступний з інтернету
- Перевірте firewall налаштування

### Помилка при білді

- Перевірте, чи всі environment variables додано як secrets
- Перевірте логи в GitHub Actions для деталей

