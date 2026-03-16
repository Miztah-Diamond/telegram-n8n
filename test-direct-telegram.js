const https = require('https');

const BOT_TOKEN = '8613194890:AAEzW6yV0BxW-ZNCvAYTgQaqDXkynmcDKmA';
const CHAT_ID = '640273761';

const message = `\ud83e\udd16 DawaHQ Cowork Alert
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
Task: Direct Telegram Test
Status: Completed \u2705
Message: Telegram alerts working without n8n!
Time: ${new Date().toLocaleString()}
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501`;

const payload = JSON.stringify({
  chat_id: CHAT_ID,
  text: message,
  parse_mode: 'HTML',
});

const req = https.request({
  hostname: 'api.telegram.org',
  path: `/bot${BOT_TOKEN}/sendMessage`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  },
}, (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('\u2705 Telegram message sent successfully!');
      console.log('   Check your Telegram now.');
    } else {
      console.log(`\u274c Failed with status ${res.statusCode}`);
      console.log(data);
    }
  });
});

req.on('error', (e) => console.error('\u274c Error:', e.message));
req.write(payload);
req.end();
