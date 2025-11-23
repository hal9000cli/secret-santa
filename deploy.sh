#!/bin/bash

# Secret Santa Deployment Script
# Deploys to production server at 192.168.1.111

set -e  # Exit on error

SERVER="192.168.1.111"
REMOTE_USER="root"
REMOTE_PATH="/root/secret-santa-new/secret-santa"
LOCAL_PATH="."

echo "🎅 Starting Secret Santa deployment to $SERVER..."

# Build the frontend
echo "📦 Building frontend..."
npm run build

# Sync files to server (excluding node_modules and dev files)
echo "🚀 Syncing files to server..."
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'dist' \
  --exclude '.env' \
  --exclude '*.log' \
  --exclude '.DS_Store' \
  --exclude 'data' \
  $LOCAL_PATH/ $REMOTE_USER@$SERVER:$REMOTE_PATH/

# Sync the built frontend
echo "📤 Syncing built frontend..."
rsync -avz --progress \
  dist/ $REMOTE_USER@$SERVER:$REMOTE_PATH/dist/

# SSH into server and restart the application
echo "🔄 Restarting application on server..."
ssh $REMOTE_USER@$SERVER << 'ENDSSH'
  cd /root/secret-santa-new/secret-santa
  
  # Install dependencies if needed
  npm install --production
  
  # Restart the service (adjust based on your setup)
  # Option 1: If using PM2
  pm2 restart secret-santa || pm2 start server.js --name secret-santa
  
  # Option 2: If using systemd
  # sudo systemctl restart secret-santa
  
  # Option 3: If using a simple process manager
  # pkill -f "node server.js" && nohup node server.js > /dev/null 2>&1 &
  
  echo "✅ Application restarted successfully"
ENDSSH

echo "🎉 Deployment complete!"
echo "🌐 Your app should be running at http://$SERVER:3000"
