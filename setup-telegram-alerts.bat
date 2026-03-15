@echo off
echo ============================================
echo   DawaHQ Telegram Alert System — Setup
echo ============================================
echo.
echo Installing n8n globally...
call npm install -g n8n
echo.
echo Starting n8n in the background...
start /B n8n start
echo.
echo Waiting 5 seconds for n8n to start...
timeout /t 5 /nobreak >nul
echo.
echo Opening n8n in your browser...
start http://localhost:5678
echo.
echo ============================================
echo.
echo   n8n is running!
echo.
echo   NOW DO THIS IN THE BROWSER THAT JUST OPENED:
echo   1. Create your free n8n account
echo   2. Go to Credentials → Add Credential → Telegram
echo   3. Paste your Bot Token
echo   4. Save it
echo   5. Then come back and run: node setup-workflow.js
echo.
echo ============================================
