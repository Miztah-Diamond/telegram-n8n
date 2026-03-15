# DawaHQ Telegram Alerts â Setup (3 Steps)

## Step 1 â Run the setup script ONCE

Windows: Double-click `setup-telegram-alerts.bat`

Mac/Linux: `bash setup-telegram-alerts.sh`

## Step 2 â Complete n8n in browser (2 mins)

- Create free account at localhost:5678
- Go to Credentials â Add Credential â Telegram API
- Paste your Bot Token from BotFather
- Save â then run in terminal:

```
node setup-workflow.js
```

## Step 3 â Test it

```
node test-telegram.js
```

Check Telegram for the test message â

## To start n8n in future sessions:

```
n8n start
```

## Done. Cowork will now ping your Telegram automatically after every task.
