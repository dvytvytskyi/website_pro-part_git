# Deployment Guide for foryou-realestate.com

## Server Information
- **IP**: 135.181.201.185
- **Domain**: foryou-realestate.com
- **User**: root
- **Password**: FNrtVkfCRwgW

## Prerequisites

Before deploying, make sure you have:
1. `sshpass` installed on your local machine (for automated deployment)
   ```bash
   brew install sshpass  # macOS
   # or
   sudo apt-get install sshpass  # Ubuntu/Debian
   ```

2. Access to the server via SSH

## Deployment Steps

### Option 1: Automated Deployment (Recommended)

Run the deployment script:

```bash
./deploy.sh
```

This script will:
1. Connect to the server
2. Install Node.js, PM2, Nginx, and Certbot
3. Upload project files
4. Install dependencies
5. Build the project
6. Configure Nginx
7. Start the application with PM2
8. Setup SSL certificate

### Option 2: Manual Deployment

#### 1. Connect to Server

```bash
ssh root@135.181.201.185
# Password: FNrtVkfCRwgW
```

#### 2. Install Required Software

```bash
# Update system
apt-get update -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Install Nginx
apt-get install -y nginx

# Install Certbot for SSL
apt-get install -y certbot python3-certbot-nginx
```

#### 3. Create App Directory

```bash
mkdir -p /var/www/foryou-realestate
cd /var/www/foryou-realestate
```

#### 4. Upload Project Files

From your local machine:

```bash
# Install rsync if not available
# macOS: brew install rsync
# Ubuntu: sudo apt-get install rsync

# Upload files (excluding node_modules, .next, .git)
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' --exclude '.env.local' \
    -e "ssh -o StrictHostKeyChecking=no" \
    ./ root@135.181.201.185:/var/www/foryou-realestate/
```

#### 5. Create Environment File

On the server:

```bash
cd /var/www/foryou-realestate
nano .env.local
```

Add the following content:

```env
NEXT_PUBLIC_API_URL=https://admin.foryou-realestate.com/api
NEXT_PUBLIC_API_KEY=fyr_8f968d115244e76d209a26f5177c5c998aca0e8dbce4a6e9071b2bc43b78f6d2
NEXT_PUBLIC_API_SECRET=5c8335f9c7e476cbe77454fd32532cc68f57baf86f7f96e6bafcf682f98b275bc579d73484cf5bada7f4cd7d071b122778b71f414fb96b741c5fe60394d1795f
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoibW1hcmFjaCIsImEiOiJjbTJqMG1pNjUwNzZ4M2psY21mazV5cDU4In0.FQ7FqgFo4QKHqOVaM3JXjQ
NODE_ENV=production
```

Save and exit (Ctrl+X, then Y, then Enter).

#### 6. Install Dependencies and Build

```bash
cd /var/www/foryou-realestate

# Install dependencies
npm install --production=false

# Build the project
npm run build
```

#### 7. Configure Nginx

```bash
# Create Nginx configuration
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

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Enable new site
ln -sf /etc/nginx/sites-available/foryou-realestate /etc/nginx/sites-enabled/foryou-realestate

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

#### 8. Start Application with PM2

```bash
cd /var/www/foryou-realestate

# Start application
pm2 start npm --name "foryou-realestate" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions provided by the command
```

#### 9. Setup SSL Certificate

```bash
# Request SSL certificate from Let's Encrypt
certbot --nginx -d foryou-realestate.com -d www.foryou-realestate.com --non-interactive --agree-tos --email admin@foryou-realestate.com --redirect
```

## Verification

### Check Application Status

```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs foryou-realestate

# Check Nginx status
systemctl status nginx

# Check Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### Test the Website

1. Open browser and visit: `https://foryou-realestate.com`
2. Check if the site loads correctly
3. Test different pages (properties, areas, map)

## Common Commands

### Restart Application

```bash
pm2 restart foryou-realestate
```

### View Logs

```bash
# Application logs
pm2 logs foryou-realestate

# Nginx error logs
tail -f /var/log/nginx/error.log

# Nginx access logs
tail -f /var/log/nginx/access.log
```

### Update Application

```bash
cd /var/www/foryou-realestate

# Pull latest changes (if using git)
# git pull

# Or upload new files using rsync
# rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
#     -e "ssh -o StrictHostKeyChecking=no" \
#     ./ root@135.181.201.185:/var/www/foryou-realestate/

# Install dependencies
npm install --production=false

# Rebuild
npm run build

# Restart PM2
pm2 restart foryou-realestate
```

### Stop Application

```bash
pm2 stop foryou-realestate
```

### Remove Old Site

If there's an old site running on the server:

```bash
# Stop old application
pm2 stop all
pm2 delete all

# Remove old files
rm -rf /var/www/*

# Remove old Nginx configurations
rm -f /etc/nginx/sites-enabled/*
rm -f /etc/nginx/sites-available/*

# Restart Nginx
systemctl restart nginx
```

## Troubleshooting

### Application won't start

```bash
# Check PM2 logs
pm2 logs foryou-realestate --lines 50

# Check if port 3000 is in use
netstat -tulpn | grep 3000

# Check Node.js version
node --version
```

### Nginx errors

```bash
# Test Nginx configuration
nginx -t

# Check Nginx error log
tail -f /var/log/nginx/error.log

# Restart Nginx
systemctl restart nginx
```

### SSL certificate issues

```bash
# Check certificate status
certbot certificates

# Renew certificate manually
certbot renew

# Test renewal
certbot renew --dry-run
```

## Environment Variables

Make sure these environment variables are set in `.env.local`:

- `NEXT_PUBLIC_API_URL` - API base URL
- `NEXT_PUBLIC_API_KEY` - API key
- `NEXT_PUBLIC_API_SECRET` - API secret
- `NEXT_PUBLIC_MAPBOX_TOKEN` - Mapbox access token
- `NODE_ENV` - Set to `production`

## Security Notes

1. Change the root password after deployment
2. Set up SSH key authentication instead of password
3. Configure firewall rules
4. Keep system and packages updated
5. Regularly backup the application and database

## Backup

```bash
# Backup application
tar -czf /root/backup-foryou-realestate-$(date +%Y%m%d).tar.gz /var/www/foryou-realestate

# Backup Nginx configuration
tar -czf /root/backup-nginx-$(date +%Y%m%d).tar.gz /etc/nginx
```

