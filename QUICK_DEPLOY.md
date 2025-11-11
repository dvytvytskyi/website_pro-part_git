# Швидкий деплой на foryou-realestate.com

## Сервер
- **IP**: 135.181.201.185
- **Домен**: foryou-realestate.com
- **User**: root
- **Password**: FNrtVkfCRwgW

## Швидкий старт (автоматичний)

### Варіант 1: Використання скрипта деплою

```bash
# З локальної машини
./deploy.sh
```

Скрипт автоматично:
1. Підключиться до сервера
2. Встановить необхідне ПЗ (Node.js, PM2, Nginx, Certbot)
3. Завантажить файли проекту
4. Налаштує .env.local
5. Встановить залежності та збудує проект
6. Налаштує Nginx
7. Запустить додаток через PM2
8. Налаштує SSL сертифікат

**Примітка**: Під час виконання скрипта потрібно буде ввести пароль: `FNrtVkfCRwgW`

## Ручний деплой (покроково)

### Крок 1: Підключення до сервера

```bash
ssh root@135.181.201.185
# Password: FNrtVkfCRwgW
```

### Крок 2: Налаштування сервера

```bash
# Оновити систему
apt-get update -y

# Встановити Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Встановити PM2
npm install -g pm2

# Встановити Nginx
apt-get install -y nginx

# Встановити Certbot для SSL
apt-get install -y certbot python3-certbot-nginx
```

### Крок 3: Створити директорію для проекту

```bash
mkdir -p /var/www/foryou-realestate
cd /var/www/foryou-realestate
```

### Крок 4: Завантажити файли проекту

**З локальної машини** (з директорії проекту):

```bash
# Завантажити файли (виключаючи node_modules, .next, .git)
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' --exclude '.env.local' \
    -e "ssh -o StrictHostKeyChecking=no" \
    ./ root@135.181.201.185:/var/www/foryou-realestate/
```

### Крок 5: Створити .env.local на сервері

```bash
# На сервері
cd /var/www/foryou-realestate
nano .env.local
```

Додати наступний вміст:

```env
NEXT_PUBLIC_API_URL=https://admin.foryou-realestate.com/api
NEXT_PUBLIC_API_KEY=fyr_8f968d115244e76d209a26f5177c5c998aca0e8dbce4a6e9071b2bc43b78f6d2
NEXT_PUBLIC_API_SECRET=5c8335f9c7e476cbe77454fd32532cc68f57baf86f7f96e6bafcf682f98b275bc579d73484cf5bada7f4cd7d071b122778b71f414fb96b741c5fe60394d1795f
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoibW1hcmFjaCIsImEiOiJjbTJqMG1pNjUwNzZ4M2psY21mazV5cDU4In0.FQ7FqgFo4QKHqOVaM3JXjQ
NODE_ENV=production
```

Зберегти (Ctrl+X, потім Y, потім Enter).

### Крок 6: Встановити залежності та збудувати проект

```bash
cd /var/www/foryou-realestate

# Встановити залежності
npm install --production=false

# Збудувати проект
npm run build
```

### Крок 7: Налаштувати Nginx

```bash
# Створити конфігурацію Nginx
cat > /etc/nginx/sites-available/foryou-realestate << 'EOF'
server {
    listen 80;
    server_name foryou-realestate.com www.foryou-realestate.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Видалити default сайт
rm -f /etc/nginx/sites-enabled/default

# Увімкнути новий сайт
ln -sf /etc/nginx/sites-available/foryou-realestate /etc/nginx/sites-enabled/foryou-realestate

# Перевірити конфігурацію Nginx
nginx -t

# Перезавантажити Nginx
systemctl reload nginx
```

### Крок 8: Запустити додаток через PM2

```bash
cd /var/www/foryou-realestate

# Запустити додаток
pm2 start npm --name "foryou-realestate" -- start

# Зберегти конфігурацію PM2
pm2 save

# Налаштувати автозапуск PM2 при перезавантаженні сервера
pm2 startup systemd -u root --hp /root
# Виконати команду, яку виведе PM2 (зазвичай що-небудь на кшталт):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root
```

### Крок 9: Налаштувати SSL сертифікат

```bash
# Запитати SSL сертифікат від Let's Encrypt
certbot --nginx -d foryou-realestate.com -d www.foryou-realestate.com --non-interactive --agree-tos --email admin@foryou-realestate.com --redirect
```

## Перевірка

### Перевірити статус додатку

```bash
# Перевірити статус PM2
pm2 status

# Переглянути логи додатку
pm2 logs foryou-realestate

# Перевірити статус Nginx
systemctl status nginx

# Переглянути логи Nginx
tail -f /var/log/nginx/error.log
```

### Відкрити сайт у браузері

Відкрити: `https://foryou-realestate.com`

## Видалення старого сайту

Якщо на сервері є старий сайт:

```bash
# Зупинити всі PM2 процеси
pm2 stop all
pm2 delete all

# Видалити старі файли
rm -rf /var/www/*

# Видалити старі конфігурації Nginx
rm -f /etc/nginx/sites-enabled/*
rm -f /etc/nginx/sites-available/*

# Перезапустити Nginx
systemctl restart nginx
```

## Оновлення додатку

```bash
# Підключитися до сервера
ssh root@135.181.201.185

# Перейти до директорії проекту
cd /var/www/foryou-realestate

# Завантажити нові файли (з локальної машини)
# rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
#     -e "ssh -o StrictHostKeyChecking=no" \
#     ./ root@135.181.201.185:/var/www/foryou-realestate/

# Встановити залежності
npm install --production=false

# Перебудувати проект
npm run build

# Перезапустити PM2
pm2 restart foryou-realestate
```

## Усунення проблем

### Додаток не запускається

```bash
# Переглянути логи PM2
pm2 logs foryou-realestate --lines 50

# Перевірити, чи порт 3000 зайнятий
netstat -tulpn | grep 3000

# Перевірити версію Node.js
node --version
```

### Помилки Nginx

```bash
# Перевірити конфігурацію Nginx
nginx -t

# Переглянути логи помилок Nginx
tail -f /var/log/nginx/error.log

# Перезапустити Nginx
systemctl restart nginx
```

### Проблеми з SSL сертифікатом

```bash
# Перевірити статус сертифікатів
certbot certificates

# Оновити сертифікат вручну
certbot renew

# Протестувати оновлення
certbot renew --dry-run
```

## Корисні команди

### Перезапустити додаток

```bash
pm2 restart foryou-realestate
```

### Зупинити додаток

```bash
pm2 stop foryou-realestate
```

### Переглянути логи

```bash
# Логи додатку
pm2 logs foryou-realestate

# Логи помилок Nginx
tail -f /var/log/nginx/error.log

# Логи доступу Nginx
tail -f /var/log/nginx/access.log
```

## Безпека

1. **Змінити пароль root** після деплою
2. **Налаштувати SSH ключі** замість пароля
3. **Налаштувати firewall** (ufw)
4. **Регулярно оновлювати систему** та пакети
5. **Робити резервні копії** додатку та бази даних

## Резервне копіювання

```bash
# Створити резервну копію додатку
tar -czf /root/backup-foryou-realestate-$(date +%Y%m%d).tar.gz /var/www/foryou-realestate

# Створити резервну копію конфігурації Nginx
tar -czf /root/backup-nginx-$(date +%Y%m%d).tar.gz /etc/nginx
```

