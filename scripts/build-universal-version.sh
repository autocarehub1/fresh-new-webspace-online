#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Building Universal Version with Enhanced Slack Client ===${NC}"

# 1. Build the application
echo -e "${YELLOW}Building application...${NC}"
npm run build

if [ $? -ne 0 ]; then
  echo -e "${RED}Build failed. Aborting.${NC}"
  exit 1
fi

echo -e "${GREEN}Build successful!${NC}"

# 2. Create deployment package
PACKAGE_NAME="universal-slack-${$(date +%Y%m%d_%H%M%S)}.zip"
PACKAGE_PATH=~/Downloads/$PACKAGE_NAME

echo -e "${YELLOW}Creating deployment package at $PACKAGE_PATH...${NC}"
zip -r "$PACKAGE_PATH" dist

if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to create deployment package. Aborting.${NC}"
  exit 1
fi

echo -e "${GREEN}Deployment package created successfully!${NC}"

# 3. Create test page archive
TEST_PACKAGE_NAME="slack-test-pages.zip"
TEST_PACKAGE_PATH=~/Downloads/$TEST_PACKAGE_NAME

echo -e "${YELLOW}Creating test page package at $TEST_PACKAGE_PATH...${NC}"
zip -r "$TEST_PACKAGE_PATH" dist/domain-test.html dist/slack-test.html

if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to create test page package. Aborting.${NC}"
  exit 1
fi

echo -e "${GREEN}Test page package created successfully!${NC}"

# 4. Print deployment instructions
echo -e "\n${GREEN}=== Deployment Instructions ===${NC}"
echo -e "1. Upload the build package to your server:"
echo -e "   ${YELLOW}$PACKAGE_PATH${NC}"
echo -e "2. Extract the package to your web root folder"
echo -e "3. Configure your server as described in DEPLOYMENT.md"
echo -e "\nAdditional test tools are available in:"
echo -e "   ${YELLOW}$TEST_PACKAGE_PATH${NC}"
echo -e "\n${GREEN}For local testing:${NC}"
echo -e "1. Run sudo scripts/setup-domain-testing.sh to set up local domain simulation"
echo -e "2. Start both servers: npm run dev and node server.js"
echo -e "3. Visit http://www.catnetlogistics.com/domain-test.html" 