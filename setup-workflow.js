const http = require('http');

const N8N_API_URL = 'http://localhost:5678/api/v1';
const API_KEY = process.argv[2];

if (!API_KEY) {
  console.error('Usage: node setup-workflow.js YOUR_N8N_API_KEY');
  console.error('\nTo get your API key:');
  console.error('  1. Open http://localhost:5678');
  console.error('  2. Click profile icon \u2192 Settings \u2192 API');
  console.error('  3. Create an API Key and copy it');
  process.exit(1);
}

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
        'X-N8N-API-KEY': API_KEY,
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

  // Define the workflow (no 'active' field - it's read-only in n8n API)
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
          text: '=\ud83e\udd16 DawaHQ Cowork Alert\\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\\nTask: {{ $json.body.task }}\\nStatus: {{ $json.body.status }}\\nMessage: {{ $json.body.message }}\\nTime: {{ $json.body.time }}\\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501',
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
    settings: {},
  };

  try {
    // Step 1: Create the workflow
    console.log('1. Creating workflow...');
    const created = await apiRequest('POST', '/workflows', workflow);

    if (!created || !created.id) {
      console.error('\u274c Failed to create workflow. Response:', JSON.stringify(created, null, 2));
      console.error('\nMake sure:');
      console.error('  - n8n is running (run: n8n start)');
      console.error('  - You have created your n8n account at http://localhost:5678');
      console.error('  - You have added your Telegram API credential');
      return;
    }

    console.log(`   \u2705 Workflow created (ID: ${created.id})`);

    // Step 2: Activate the workflow
    console.log('2. Activating workflow...');
    const activated = await apiRequest('POST', `/workflows/${created.id}/activate`, {});

    if (activated && activated.active) {
      console.log('   \u2705 Workflow activated!');
    } else {
      // Fallback: try PATCH method
      const activated2 = await apiRequest('PATCH', `/workflows/${created.id}`, {
        active: true,
      });
      if (activated2 && activated2.active) {
        console.log('   \u2705 Workflow activated!');
      } else {
        console.log('   \u26a0\ufe0f  Could not auto-activate. Please activate manually in the n8n UI.');
        console.log('      Go to Workflows \u2192 DawaHQ Cowork Telegram Alerts \u2192 Toggle Active');
      }
    }

    // Step 3: Print webhook URL
    const webhookUrl = `http://localhost:5678/webhook/cowork-alert`;
    console.log('\n============================================');
    console.log('  \u2705 SETUP COMPLETE!');
    console.log('============================================\n');
    console.log('  Your webhook URL is:');
    console.log(`  ${webhookUrl}\n`);
    console.log('  Test it by running:');
    console.log('  node test-telegram.js\n');
    console.log('============================================');
  } catch (error) {
    console.error('\u274c Error:', error.message);
    console.error('\nMake sure n8n is running: n8n start');
  }
}

main();
