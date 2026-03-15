#!/bin/bash
echo "============================================"
echo "  DawaHQ Telegram Alert System — Setup"
echo "============================================"
echo ""
echo "Installing n8n globally..."
npm install -g n8n
echo ""
echo "Starting n8n in the background..."
n8n start &
echo ""
echo "Waiting 5 seconds for n8n to start..."
sleep 5
echo ""
echo "Opening n8n in your browser..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:5678
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:5678 2>/dev/null || echo "Please open http://localhost:5678 in your browser"
fi
echo ""
echo "============================================"
echo ""
echo "  ✅ n8n is running!"
echo ""
echo "  NOW DO THIS IN THE BROWSER THAT JUST OPENED:"
echo "  1. Create your free n8n account"
echo "  2. Go to Credentials → Add Credential → Telegram"
echo "  3. Paste your Bot Token"
echo "  4. Save it"
echo "  5. Then come back and run: node setup-workflow.js"
echo ""
echo "============================================"
