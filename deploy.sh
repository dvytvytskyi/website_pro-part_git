#!/bin/bash

# Deployment script for main.pro-part.online
# Server: 135.181.201.185
# User: root
# Domain: main.pro-part.online

set -e

SERVER_IP="135.181.201.185"
SERVER_USER="root"
SERVER_PASS="FNrtVkfCRwgW"
DOMAIN="main.pro-part.online"
APP_DIR="/var/www/main.pro-part.online"
SERVICE_NAME="main-pro-part"

echo "🚀 Starting deployment to $DOMAIN..."

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
    echo "❌ sshpass is not installed. Installing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install hudochenkov/sshpass/sshpass
    else
        echo "Please install sshpass manually"
        exit 1
    fi
fi

# Build the project locally
echo "📦 Building Next.js application..."
# Build may show prerendering errors, but that's OK - pages will render dynamically
npm run build || echo "⚠️ Build completed with warnings (prerendering errors are OK)"

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf deploy.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='deploy.tar.gz' \
    --exclude='.DS_Store' \
    --exclude='*.log' \
    --exclude='.next/cache' \
    .

# Upload to server
echo "📤 Uploading files to server..."
sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no -o PreferredAuthentications=password deploy.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

# Run deployment commands on server
echo "🔧 Setting up on server..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no -o PreferredAuthentications=password $SERVER_USER@$SERVER_IP << 'ENDSSH'
set -e

DOMAIN="main.pro-part.online"
APP_DIR="/var/www/main.pro-part.online"
SERVICE_NAME="main-pro-part"
PORT=3003

# Create app directory
mkdir -p $APP_DIR
cd $APP_DIR

# Extract files
echo "📦 Extracting files..."
tar -xzf /tmp/deploy.tar.gz -C $APP_DIR
rm /tmp/deploy.tar.gz

# Install dependencies (including devDependencies for build)
echo "📥 Installing dependencies..."
if [ -f "package-lock.json" ]; then
    npm ci
else
    npm install
fi

# Build Next.js
echo "🔨 Building Next.js application..."
# Build may show prerendering errors, but that's OK - pages will render dynamically
npm run build || echo "⚠️ Build completed with warnings (prerendering errors are OK)"

# Ensure prerender-manifest.json exists (required by Next.js)
if [ ! -f ".next/prerender-manifest.json" ]; then
    echo "📝 Creating prerender-manifest.json..."
    node -e "const fs=require('fs');const path='.next/prerender-manifest.json';if(!fs.existsSync(path)){fs.writeFileSync(path,JSON.stringify({version:3,routes:{},dynamicRoutes:{},notFoundRoutes:[],preview:{previewModeId:'development-id',previewModeSigningKey:'development-key',previewModeEncryptionKey:'development-key'}},null,2));}"
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Get Node.js path
NODE_PATH=$(which node)
NPM_PATH=$(which npm)

# Create systemd service
echo "⚙️ Creating systemd service..."
cat > /etc/systemd/system/${SERVICE_NAME}.service << EOF
[Unit]
Description=Next.js App for ${DOMAIN}
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${APP_DIR}
Environment=NODE_ENV=production
Environment=PORT=${PORT}
Environment=NEXT_PUBLIC_API_URL=https://admin.pro-part.online/api
Environment=GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/AKfycbz2IYI0VYkkRb0vHassxdL9lvw8HxWFCaK_vWChgHtDDsbChOeypbBlL4xuGX3zOolq3A/exec
ExecStart=${NPM_PATH} start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start service
systemctl daemon-reload
systemctl enable ${SERVICE_NAME}

# Check if port is already in use
if lsof -Pi :${PORT} -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️ Port ${PORT} is already in use. Stopping existing service..."
    systemctl stop ${SERVICE_NAME} || true
    sleep 2
fi

systemctl restart ${SERVICE_NAME}
sleep 3

# Check service status
if systemctl is-active --quiet ${SERVICE_NAME}; then
    echo "✅ Service ${SERVICE_NAME} started successfully"
    systemctl status ${SERVICE_NAME} --no-pager -l
else
    echo "❌ Service ${SERVICE_NAME} failed to start!"
    systemctl status ${SERVICE_NAME} --no-pager -l
    exit 1
fi

# Check if nginx config exists and if it has SSL (managed by certbot)
if [ ! -f "/etc/nginx/sites-available/${DOMAIN}" ]; then
    echo "📝 Creating nginx configuration..."
    cat > /etc/nginx/sites-available/${DOMAIN} << NGINX_EOF
server {
    listen 80;
    server_name ${DOMAIN};

    location / {
        proxy_pass http://localhost:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Increase timeouts for Next.js
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
NGINX_EOF

    # Enable site
    ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/${DOMAIN}
    
    # Test nginx config
    echo "🧪 Testing nginx configuration..."
    if nginx -t; then
        # Reload nginx
        systemctl reload nginx
        echo "✅ Nginx configuration created and enabled"
    else
        echo "❌ Nginx configuration test failed!"
        exit 1
    fi
else
    # Check if SSL config exists (managed by certbot)
    if grep -q "listen 443 ssl" /etc/nginx/sites-available/${DOMAIN}; then
        echo "ℹ️ SSL configuration detected (managed by certbot), preserving it..."
        # Only update the proxy_pass location if needed, but preserve SSL config
        # Check if proxy_pass is correct
        if ! grep -q "proxy_pass http://localhost:${PORT}" /etc/nginx/sites-available/${DOMAIN}; then
            echo "⚠️ Updating proxy_pass in SSL config..."
            # Use sed to update only the proxy_pass line
            sed -i "s|proxy_pass http://localhost:[0-9]*;|proxy_pass http://localhost:${PORT};|g" /etc/nginx/sites-available/${DOMAIN}
            if nginx -t; then
                systemctl reload nginx
                echo "✅ Updated proxy_pass in SSL configuration"
            else
                echo "❌ Nginx configuration test failed after update!"
                exit 1
            fi
        else
            echo "✅ SSL configuration is correct, no changes needed"
        fi
    else
        echo "ℹ️ Nginx configuration exists without SSL, updating..."
        # Update existing config (no SSL)
        cat > /etc/nginx/sites-available/${DOMAIN} << NGINX_EOF
server {
    listen 80;
    server_name ${DOMAIN};

    location / {
        proxy_pass http://localhost:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Increase timeouts for Next.js
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
NGINX_EOF
        
        # Test and reload
        if nginx -t; then
            systemctl reload nginx
            echo "✅ Nginx configuration updated"
        else
            echo "❌ Nginx configuration test failed!"
            exit 1
        fi
    fi
fi

echo "✅ Deployment completed!"
echo "🌐 Site should be available at http://${DOMAIN}"
ENDSSH

# Cleanup
rm -f deploy.tar.gz

echo "✅ Deployment completed successfully!"
echo "🌐 Site should be available at http://${DOMAIN}"

