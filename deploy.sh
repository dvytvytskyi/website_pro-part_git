#!/bin/bash

# Deploy script for foryou-realestate.com
# Server: 135.181.201.185
# Domain: foryou-realestate.com
# 
# Usage:
#   1. Make sure you have SSH access to the server
#   2. Run: ./deploy.sh
#   3. Enter password when prompted: FNrtVkfCRwgW

set -e

SERVER_IP="135.181.201.185"
SERVER_USER="root"
DOMAIN="foryou-realestate.com"
APP_DIR="/var/www/foryou-realestate"
PM2_APP_NAME="foryou-realestate"

echo "🚀 Starting deployment to ${DOMAIN}..."
echo "📡 Make sure you have SSH access to ${SERVER_USER}@${SERVER_IP}"
echo ""

# Step 2: Install required packages on server
echo "📦 Installing required packages on server..."
ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
    # Update system
    apt-get update -y
    
    # Install Node.js 20.x if not installed
    if ! command -v node &> /dev/null; then
        echo "Installing Node.js 20.x..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    fi
    
    # Install PM2 if not installed
    if ! command -v pm2 &> /dev/null; then
        echo "Installing PM2..."
        npm install -g pm2
    fi
    
    # Install Nginx if not installed
    if ! command -v nginx &> /dev/null; then
        echo "Installing Nginx..."
        apt-get install -y nginx
    fi
    
    # Install certbot for SSL
    if ! command -v certbot &> /dev/null; then
        echo "Installing Certbot..."
        apt-get install -y certbot python3-certbot-nginx
    fi
    
    # Verify installations
    echo "Node.js version: $(node --version)"
    echo "npm version: $(npm --version)"
    echo "PM2 version: $(pm2 --version)"
    echo "Nginx version: $(nginx -v 2>&1)"
ENDSSH

# Step 3: Create app directory
echo "📁 Creating app directory..."
ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
    # Create app directory
    mkdir -p /var/www/foryou-realestate
    cd /var/www/foryou-realestate
    
    # Remove old files if they exist
    rm -rf .next node_modules package*.json
    
    # Create .env.local file (will be updated with actual values)
    touch .env.local
ENDSSH

# Step 4: Upload project files (excluding node_modules, .next)
echo "📤 Uploading project files..."
echo "   This may take a few minutes..."
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' --exclude '.env.local' \
    -e "ssh -o StrictHostKeyChecking=no" \
    ./ ${SERVER_USER}@${SERVER_IP}:${APP_DIR}/

# Step 5: Create .env.local on server
echo "⚙️  Creating .env.local file..."
ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
    cat > /var/www/foryou-realestate/.env.local << 'ENVFILE'
NEXT_PUBLIC_API_URL=https://admin.foryou-realestate.com/api
NEXT_PUBLIC_API_KEY=fyr_8f968d115244e76d209a26f5177c5c998aca0e8dbce4a6e9071b2bc43b78f6d2
NEXT_PUBLIC_API_SECRET=5c8335f9c7e476cbe77454fd32532cc68f57baf86f7f96e6bafcf682f98b275bc579d73484cf5bada7f4cd7d071b122778b71f414fb96b741c5fe60394d1795f
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoibW1hcmFjaCIsImEiOiJjbTJqMG1pNjUwNzZ4M2psY21mazV5cDU4In0.FQ7FqgFo4QKHqOVaM3JXjQ
NODE_ENV=production
ENVFILE
ENDSSH

# Step 6: Install dependencies and build on server
echo "🔨 Installing dependencies and building project..."
echo "   This may take 5-10 minutes..."
ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
    cd /var/www/foryou-realestate
    
    # Install dependencies
    echo "Installing npm dependencies..."
    npm install --production=false
    
    # Build project
    echo "Building Next.js project..."
    npm run build
ENDSSH

# Step 7: Configure Nginx
echo "🌐 Configuring Nginx..."
ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
    # Create Nginx configuration
    cat > /etc/nginx/sites-available/foryou-realestate << 'NGINXCONF'
server {
    listen 80;
    server_name foryou-realestate.com www.foryou-realestate.com;
    
    # Redirect HTTP to HTTPS (will be enabled after SSL setup)
    # return 301 https://$server_name$request_uri;
    
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
NGINXCONF

    # Remove default Nginx site if it exists
    rm -f /etc/nginx/sites-enabled/default
    
    # Enable new site
    ln -sf /etc/nginx/sites-available/foryou-realestate /etc/nginx/sites-enabled/foryou-realestate
    
    # Test Nginx configuration
    nginx -t
    
    # Reload Nginx
    systemctl reload nginx
ENDSSH

# Step 8: Start application with PM2
echo "🚀 Starting application with PM2..."
ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << ENDSSH
    cd /var/www/foryou-realestate
    
    # Stop existing PM2 process if running
    pm2 stop ${PM2_APP_NAME} 2>/dev/null || true
    pm2 delete ${PM2_APP_NAME} 2>/dev/null || true
    
    # Start application
    pm2 start npm --name "${PM2_APP_NAME}" -- start
    pm2 save
    
    # Setup PM2 startup (this will output a command to run)
    echo ""
    echo "⚠️  IMPORTANT: Run the following command that PM2 outputs:"
    echo "   (Usually: sudo env PATH=\$PATH:/usr/bin pm2 startup systemd -u root --hp /root)"
    pm2 startup systemd -u root --hp /root || true
ENDSSH

# Step 9: Setup SSL with Let's Encrypt
echo "🔒 Setting up SSL certificate..."
echo "   Note: SSL setup requires DNS to be properly configured"
ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
    # Request SSL certificate (non-interactive, but may need email)
    certbot --nginx -d foryou-realestate.com -d www.foryou-realestate.com --non-interactive --agree-tos --email admin@foryou-realestate.com --redirect 2>&1 || {
        echo ""
        echo "⚠️  SSL certificate setup may have failed."
        echo "   You can set it up manually later with:"
        echo "   certbot --nginx -d foryou-realestate.com -d www.foryou-realestate.com"
        echo ""
    }
ENDSSH

echo "✅ Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Check if the site is running: https://${DOMAIN}"
echo "2. Check PM2 status: ssh ${SERVER_USER}@${SERVER_IP} 'pm2 status'"
echo "3. Check Nginx logs: ssh ${SERVER_USER}@${SERVER_IP} 'tail -f /var/log/nginx/error.log'"
echo "4. Check app logs: ssh ${SERVER_USER}@${SERVER_IP} 'pm2 logs ${PM2_APP_NAME}'"

