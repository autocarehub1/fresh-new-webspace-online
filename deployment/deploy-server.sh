#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Deploying Express Med Dispatch Server ===${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}PM2 is not installed. Installing it now...${NC}"
    npm install -g pm2
fi

# Create server directory if it doesn't exist
mkdir -p server

# Copy server files
echo -e "${GREEN}Copying server files...${NC}"
cp server.js server/
cp package.json server/

# Install dependencies
echo -e "${GREEN}Installing server dependencies...${NC}"
cd server
npm install express cors axios

# Start/restart the server with PM2
echo -e "${GREEN}Starting server with PM2...${NC}"
pm2 start server.js --name "med-dispatch-server" || pm2 restart "med-dispatch-server"

# Save PM2 configuration
pm2 save

# Configure PM2 to start on boot
echo -e "${YELLOW}Setting up PM2 to start on system boot...${NC}"
pm2 startup

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${YELLOW}Server is now running on port 3001${NC}"
echo -e "Make sure your Nginx configuration routes /api and /slack to this server."
echo -e "Add this to your Nginx config:"
echo -e "${GREEN}location /api/ {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_cache_bypass \$http_upgrade;
}

location /slack/ {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_cache_bypass \$http_upgrade;
}${NC}" 