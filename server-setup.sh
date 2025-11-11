#!/bin/bash

# Server setup script - Run this ON THE SERVER
# This script sets up the server environment for the Next.js application

set -e

echo "🚀 Setting up server for foryou-realestate.com..."

# Step 1: Update system
echo "📦 Updating system packages..."
apt-get update -y

# Step 2: Install Node.js 20.x
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
else
    echo "✅ Node.js is already installed: $(node --version)"
fi

# Step 3: Install PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
else
    echo "✅ PM2 is already installed: $(pm2 --version)"
fi

# Step 4: Install Nginx
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    apt-get install -y nginx
    systemctl enable nginx
else
    echo "✅ Nginx is already installed: $(nginx -v 2>&1)"
fi

# Step 5: Install Certbot
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing Certbot..."
    apt-get install -y certbot python3-certbot-nginx
else
    echo "✅ Certbot is already installed"
fi

# Step 6: Create app directory
echo "📁 Creating app directory..."
mkdir -p /var/www/foryou-realestate
chown -R $USER:$USER /var/www/foryou-realestate

# Step 7: Configure firewall (if ufw is installed)
if command -v ufw &> /dev/null; then
    echo "🔥 Configuring firewall..."
    ufw allow 'Nginx Full'
    ufw allow OpenSSH
    ufw --force enable || true
fi

echo "✅ Server setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Upload your project files to /var/www/foryou-realestate"
echo "2. Create .env.local file with your environment variables"
echo "3. Run: cd /var/www/foryou-realestate && npm install && npm run build"
echo "4. Configure Nginx (see DEPLOY.md)"
echo "5. Start application with PM2: pm2 start npm --name 'foryou-realestate' -- start"
echo "6. Setup SSL: certbot --nginx -d foryou-realestate.com -d www.foryou-realestate.com"

