const BOT_TOKEN = '8613194890:AAEzW6yV0BxW-ZNCvAYTgQaqDXkynmcDKmA';
const CHAT_ID = '640273761';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = req.query.action || req.body?.action;

  try {
    if (action === 'getUpdates') {
      const offset = req.query.offset || req.body?.offset || 0;
      const resp = await fetch(`${TELEGRAM_API}/getUpdates?offset=${offset}&allowed_updates=["message"]`);
      const data = await resp.json();
      return res.status(200).json(data);
    }

    if (action === 'sendMessage') {
      const text = req.body?.text || 'No message provided';
      const chatId = req.body?.chat_id || CHAT_ID;
      const resp = await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'HTML' }),
      });
      const data = await resp.json();
      return res.status(200).json(data);
    }

    return res.status(200).json({
      status: 'ok',
      message: 'Telegram Relay API',
      actions: ['getUpdates', 'sendMessage'],
      usage: {
        getUpdates: 'GET /api/telegram?action=getUpdates&offset=0',
        sendMessage: 'POST /api/telegram { "action": "sendMessage", "text": "hello" }',
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
