const http = require('http');

const WEBHOOK_URL = 'http://localhost:5678/webhook/cowork-alert';

const testPayload = {
  task: 'Telegram Setup Test',
  status: 'Complete â',
  message: 'n8n and Telegram are connected. You will now receive Cowork alerts on Telegram.',
  time: new Date().toLocaleString(),
};

const data = JSON.stringify(testPayload);

const url = new URL(WEBHOOK_URL);
const options = {
  hostname: url.hostname,
  port: url.port,
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  },
};

console.log('Sending test alert to Telegram via n8n...\n');

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => (body += chunk));
  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('â Telegram alert sent! Check your phone.');
    } else {
      console.log(`â Test failed. Status code: ${res.statusCode}`);
      console.log('Response:', body);
      console.log('\nIs n8n running? Run: n8n start');
    }
  });
});

req.on('error', (e) => {
  console.log('â Test failed. Is n8n running?');
  console.log(`   Error: ${e.message}`);
  console.log('   Run: n8n start');
});

req.write(data);
req.end();
