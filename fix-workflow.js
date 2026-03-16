const http = require('http');

const API_KEY = process.argv[2];
if (!API_KEY) {
  console.error('Usage: node fix-workflow.js YOUR_N8N_API_KEY');
  process.exit(1);
}

function apiRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5678,
      path: '/api/v1' + path,
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
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', (e) => reject(e));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  console.log('\n=== Step 1: Finding your Telegram credential ===');
  const creds = await apiRequest('GET', '/credentials');

  if (!creds.body.data) {
    console.error('Failed to get credentials:', JSON.stringify(creds.body));
    return;
  }

  const telegramCred = creds.body.data.find(c => c.type === 'telegramApi');
  if (!telegramCred) {
    console.error('No Telegram credential found! Please add one in n8n first.');
    return;
  }
  console.log(`   Found: "${telegramCred.name}" (ID: ${telegramCred.id})`);

  console.log('\n=== Step 2: Deleting old broken workflow(s) ===');
  const workflows = await apiRequest('GET', '/workflows');
  if (workflows.body.data) {
    for (const wf of workflows.body.data) {
      if (wf.name === 'DawaHQ Cowork Telegram Alerts') {
        console.log(`   Deleting workflow ID: ${wf.id}...`);
        await apiRequest('DELETE', `/workflows/${wf.id}`);
        console.log('   Deleted.');
      }
    }
  }

  console.log('\n=== Step 3: Creating workflow with correct credential ===');
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
            id: telegramCred.id,
            name: telegramCred.name,
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

  const created = await apiRequest('POST', '/workflows', workflow);
  if (!created.body.id) {
    console.error('Failed to create workflow:', JSON.stringify(created.body, null, 2));
    return;
  }
  console.log(`   Workflow created (ID: ${created.body.id})`);

  console.log('\n=== Step 4: Activating workflow ===');
  const activated = await apiRequest('POST', `/workflows/${created.body.id}/activate`, {});
  if (activated.body.active) {
    console.log('   Workflow activated!');
  } else {
    const act2 = await apiRequest('PATCH', `/workflows/${created.body.id}`, { active: true });
    if (act2.body.active) {
      console.log('   Workflow activated!');
    } else {
      console.log('   Could not auto-activate. Response:', JSON.stringify(activated.body, null, 2));
      console.log('   Please activate manually in n8n UI.');
    }
  }

  console.log('\n=== Step 5: Testing webhook ===');
  console.log('   Waiting 2 seconds for webhook to register...');
  await new Promise(r => setTimeout(r, 2000));

  const testPayload = JSON.stringify({
    task: 'Fix Workflow Setup',
    status: 'Completed',
    message: 'Telegram alerts are now working!',
    time: new Date().toISOString(),
  });

  const testResult = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5678,
      path: '/webhook/cowork-alert',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(testPayload),
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', (e) => reject(e));
    req.write(testPayload);
    req.end();
  });

  if (testResult.status === 200) {
    console.log('   TEST PASSED! Check your Telegram for the message!');
  } else {
    console.log(`   Test returned status ${testResult.status}: ${testResult.body}`);
    console.log('   If you see a 404, try restarting n8n and running this script again.');
  }

  console.log('\n============================================');
  console.log('   SETUP COMPLETE!');
  console.log('============================================');
  console.log('   Webhook URL: http://localhost:5678/webhook/cowork-alert');
  console.log('============================================\n');
}

main().catch(e => console.error('Error:', e.message));
