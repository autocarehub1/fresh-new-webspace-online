#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Setting up domain testing for www.catnetlogistics.com ===${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root (use sudo)${NC}"
  exit 1
fi

# 1. Add entry to hosts file
echo -e "${YELLOW}Adding www.catnetlogistics.com to /etc/hosts...${NC}"
grep -q "www.catnetlogistics.com" /etc/hosts
if [ $? -eq 0 ]; then
  echo -e "Entry already exists in /etc/hosts"
else
  echo "127.0.0.1 www.catnetlogistics.com catnetlogistics.com" >> /etc/hosts
  echo -e "${GREEN}Added entry to /etc/hosts${NC}"
fi

# 2. Create temp nginx config
NGINX_CONF_FILE="/tmp/catnetlogistics.conf"
echo -e "${YELLOW}Creating temporary nginx configuration...${NC}"

cat > $NGINX_CONF_FILE << EOF
server {
    listen 80;
    server_name catnetlogistics.com www.catnetlogistics.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # API routes
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Alternative Slack endpoint
    location /slack/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

echo -e "${GREEN}Created temporary nginx configuration at $NGINX_CONF_FILE${NC}"

# Check if nginx is installed
if command -v nginx >/dev/null 2>&1; then
  echo -e "${YELLOW}Nginx is installed. Attempting to configure...${NC}"
  
  if [ -d "/etc/nginx/sites-available" ]; then
    # Debian/Ubuntu style
    echo -e "${YELLOW}Detected Debian/Ubuntu style nginx configuration${NC}"
    cp $NGINX_CONF_FILE /etc/nginx/sites-available/catnetlogistics.conf
    ln -sf /etc/nginx/sites-available/catnetlogistics.conf /etc/nginx/sites-enabled/
    echo -e "${GREEN}Nginx configured. Testing configuration...${NC}"
    nginx -t
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}Nginx configuration valid. Reloading nginx...${NC}"
      systemctl reload nginx
      echo -e "${GREEN}Nginx reloaded${NC}"
    else
      echo -e "${RED}Nginx configuration invalid. Please check the configuration manually.${NC}"
    fi
  elif [ -d "/etc/nginx/conf.d" ]; then
    # CentOS/RHEL style
    echo -e "${YELLOW}Detected CentOS/RHEL style nginx configuration${NC}"
    cp $NGINX_CONF_FILE /etc/nginx/conf.d/catnetlogistics.conf
    echo -e "${GREEN}Nginx configured. Testing configuration...${NC}"
    nginx -t
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}Nginx configuration valid. Reloading nginx...${NC}"
      systemctl reload nginx
      echo -e "${GREEN}Nginx reloaded${NC}"
    else
      echo -e "${RED}Nginx configuration invalid. Please check the configuration manually.${NC}"
    fi
  else
    echo -e "${RED}Could not determine nginx configuration directory. Please configure manually.${NC}"
    echo -e "${YELLOW}You can use the generated configuration at $NGINX_CONF_FILE${NC}"
  fi
else
  echo -e "${YELLOW}Nginx not installed. Skipping nginx configuration.${NC}"
  echo -e "${YELLOW}You'll need to:${NC}"
  echo -e "1. Install nginx: sudo apt install nginx (Ubuntu) or brew install nginx (macOS)"
  echo -e "2. Configure nginx with the settings in: $NGINX_CONF_FILE"
fi

echo -e "\n${GREEN}=== Instructions for testing ===${NC}"
echo -e "1. Make sure both servers are running:"
echo -e "   - Frontend (Vite): npm run dev"
echo -e "   - Backend: node server.js"
echo -e "2. Visit http://www.catnetlogistics.com/domain-test.html in your browser"
echo -e "3. Use the tabs to test different environments and endpoints"
echo -e "\n${YELLOW}NOTE: You may need to clear your browser cache or use incognito mode${NC}"
echo -e "${YELLOW}To undo these changes later, remove the entry from /etc/hosts${NC}" 