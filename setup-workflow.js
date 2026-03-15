const http = require('http');

const N8N_API_URL = 'http://localhost:5678/api/v1';

function apiRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${N8N_API_URL}${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', (e) => reject(e));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  console.log('============================================');
  console.log('  Creating DawaHQ Cowork Alert Workflow');
  console.log('============================================\n');

  // Define the workflow
  const workflow = {
    name: 'DawaHQ Cowork Telegram Alerts',
    nodes: [
      {
        parameters: {
          httpMethod: 'POST',
          path: 'cowork-alert',
          responseMode: 'onReceived',
          responseData: 'allEntries',
        },
        id: 'webhook-node',
        name: 'Cowork Alert Webhook',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 1,
        position: [250, 300],
      },
      {
        parameters: {
          chatId: '640273761',
          text: '=ð¤ DawaHQ Cowork Alert\nââââââââââââââââââââ\nTask: {{ $json.body.task }}\nStatus: {{ $json.body.status }}\nMessage: {{ $json.body.message }}\nTime: {{ $json.body.time }}\nââââââââââââââââââââ',
          additionalFields: {},
        },
        id: 'telegram-node',
        name: 'Send Telegram Alert',
        type: 'n8n-nodes-base.telegram',
        typeVersion: 1,
        position: [500, 300],
        credentials: {
          telegramApi: {
            id: '1',
            name: 'Telegram API',
          },
        },
      },
    ],
    connections: {
      'Cowork Alert Webhook': {
        main: [
          [
            {
              node: 'Send Telegram Alert',
              type: 'main',
              index: 0,
            },
          ],
        ],
      },
    },
    active: false,
    settings: {},
  };

  try {
    // Step 1: Create the workflow
    console.log('1. Creating workflow...');
    const created = await apiRequest('POST', '/workflows', workflow);

    if (!created || !created.id) {
      console.error('â Failed to create workflow. Response:', JSON.stringify(created, null, 2));
      console.error('\nMake sure:');
      console.error('  - n8n is running (run: n8n start)');
      console.error('  - You have created your n8n account at http://localhost:5678');
      console.error('  - You have added your Telegram API credential');
      return;
    }

    console.log(`   â Workflow created (ID: ${created.id})`);

    // Step 2: Activate the workflow
    console.log('2. Activating workflow...');
    const activated = await apiRequest('PATCH', `/workflows/${created.id}`, {
      active: true,
    });

    if (activated && activated.active) {
      console.log('   â Workflow activated!');
    } else {
      console.log('   â ï¸  Could not auto-activate. Please activate manually in the n8n UI.');
    }

    // Step 3: Print webhook URL
    const webhookUrl = `http://localhost:5678/webhook/cowork-alert`;
    console.log('\n============================================');
    console.log('  â SETUP COMPLETE!');
    console.log('============================================\n');
    console.log('  Your webhook URL is:');
    console.log(`  ${webhookUrl}\n`);
    console.log('  Test it by running:');
    console.log('  node test-telegram.js\n');
    console.log('============================================');
  } catch (error) {
    console.error('â Error:', error.message);
    console.error('\nMake sure n8n is running: n8n start');
  }
}

main();
