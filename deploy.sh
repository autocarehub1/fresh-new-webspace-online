#!/bin/bash
# Simple deployment script for the Catalyst Network Logistics website

# Color formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}===== Catalyst Network Logistics - Deployment Script =====${NC}"

# 1. Prompt for server SSH details
read -p "Enter server address (e.g., user@server.com): " SERVER
read -p "Enter actual web root path on server (e.g., /var/www/html): " WEBROOT

# Confirm details
echo -e "\n${YELLOW}Deployment details:${NC}"
echo "Server: $SERVER"
echo "Web root: $WEBROOT"
read -p "Are these details correct? (y/n): " CONFIRM

if [[ $CONFIRM != "y" && $CONFIRM != "Y" ]]; then
  echo -e "${RED}Deployment cancelled.${NC}"
  exit 1
fi

# 2. Generate the nginx configuration
echo -e "\n${GREEN}Generating Nginx configuration...${NC}"
cat > nginx.conf << EOL
server {
    listen 80;
    server_name catnetlogistics.com www.catnetlogistics.com;

    # Set to the actual web root
    root $WEBROOT;
    index index.html;

    # Critical part for SPA routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Serve static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)\$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
        try_files \$uri =404;
    }
}
EOL

echo -e "${GREEN}Nginx configuration generated.${NC}"

# 3. Transfer files to server
echo -e "\n${GREEN}Transferring files to server...${NC}"
echo "This will copy all files to $SERVER:$WEBROOT"
read -p "Continue? (y/n): " CONTINUE

if [[ $CONTINUE != "y" && $CONTINUE != "Y" ]]; then
  echo -e "${RED}Deployment cancelled.${NC}"
  exit 1
fi

# Create temporary script to run on the server
cat > remote_setup.sh << EOL
#!/bin/bash
# This script will be executed on the remote server

# Backup existing files
if [ -d "$WEBROOT" ]; then
  timestamp=\$(date +%Y%m%d_%H%M%S)
  backup_dir="\${WEBROOT}_backup_\${timestamp}"
  echo "Creating backup at \$backup_dir"
  cp -r $WEBROOT \$backup_dir
fi

# Copy nginx configuration
echo "Setting up Nginx configuration..."
sudo cp nginx.conf /etc/nginx/sites-available/catnetlogistics.com
if [ ! -L "/etc/nginx/sites-enabled/catnetlogistics.com" ]; then
  sudo ln -s /etc/nginx/sites-available/catnetlogistics.com /etc/nginx/sites-enabled/
fi

# Test and reload Nginx
echo "Testing Nginx configuration..."
sudo nginx -t

if [ \$? -eq 0 ]; then
  echo "Reloading Nginx..."
  sudo systemctl reload nginx
else
  echo "Nginx configuration test failed! Please check the errors above."
  exit 1
fi

# Set proper permissions
echo "Setting permissions..."
sudo chown -R www-data:www-data $WEBROOT
sudo chmod -R 755 $WEBROOT

echo "Deployment completed successfully!"
EOL

# Add execution permission to the script
chmod +x remote_setup.sh

echo -e "${GREEN}Beginning file transfer...${NC}"
# SCP files to server
scp -r dist/* $SERVER:$WEBROOT/
scp nginx.conf remote_setup.sh $SERVER:~/

echo -e "${GREEN}Files transferred. Running setup script on server...${NC}"
# SSH to server and run the setup script
ssh $SERVER "bash ~/remote_setup.sh"

echo -e "\n${GREEN}Deployment process completed!${NC}"
echo -e "${YELLOW}Important:${NC} Verify your site at https://catnetlogistics.com/tracking?id=MED-123"
echo -e "If still having issues, check the server logs with: ${YELLOW}sudo tail -n 50 /var/log/nginx/error.log${NC}" 