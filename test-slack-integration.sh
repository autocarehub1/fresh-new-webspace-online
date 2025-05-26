#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Testing Express Med Dispatch Slack Integration ===${NC}"

# Check if the development server is already running
if lsof -i :5050 > /dev/null; then
  echo -e "${YELLOW}Development server already running on port 5050${NC}"
else
  echo -e "${YELLOW}Starting development server...${NC}"
  # Start the dev server in the background
  npm run dev &
  DEV_PID=$!
  
  # Wait for server to start
  echo "Waiting for server to start..."
  sleep 10
fi

echo -e "${GREEN}Running Slack webhook direct test...${NC}"
node slack-test-verification.js

echo -e "${GREEN}Running API route test...${NC}"
node test-api-route.js

echo -e "${GREEN}Tests completed!${NC}"
echo "Check your Slack channel for test messages"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. If tests pass but you still don't receive notifications on form submission:"
echo "   - Check browser console logs during form submission"
echo "   - Verify form submission is calling the Slack notification functions"
echo "2. Try submitting a new request on the website to test the full flow"

# Don't kill the dev server automatically so you can continue testing
echo -e "${YELLOW}Development server is still running. Press Ctrl+C when done testing.${NC}" 