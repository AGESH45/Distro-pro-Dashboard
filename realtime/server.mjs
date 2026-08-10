import http from 'node:http';
import crypto from 'node:crypto';
import { WebSocketServer } from 'ws';

const PORT = Number(process.env.PORT || 8080);
const TOKEN_SECRET = process.env.REALTIME_TOKEN_SECRET || '';
const PUBLISH_SECRET = process.env.REALTIME_PUBLISH_SECRET || '';
if (!TOKEN_SECRET || !PUBLISH_SECRET) throw new Error('REALTIME_TOKEN_SECRET and REALTIME_PUBLISH_SECRET are required');
const topics = new Map();
function verifyToken(token) {
  const [encoded, signature] = String(token || '').split('.');
  if (!encoded || !signature) return null;
  const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(encoded).digest('base64url');
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try { const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString()); return payload.exp > Math.floor(Date.now()/1000) ? payload : null; } catch { return null; }
}
function subscribe(client, topic) {
  if (topic === 'admin' && client.user.role !== 'admin') return;
  if (topic.startsWith('artist:') && topic !== `artist:${client.user.id}` && client.user.role !== 'admin') return;
  if (!topics.has(topic)) topics.set(topic, new Set());
  topics.get(topic).add(client); client.topics.add(topic);
}
function cleanup(client) { for (const topic of client.topics) { topics.get(topic)?.delete(client); if (topics.get(topic)?.size === 0) topics.delete(topic); } }
function broadcast(event) {
  const targets = new Set(topics.get(event.topic) || []);
  if (event.topic.startsWith('artist:')) for (const client of topics.get('admin') || []) targets.add(client);
  const payload = JSON.stringify(event);
  for (const client of targets) if (client.ws.readyState === 1) client.ws.send(payload);
}
const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/publish') {
    if (req.headers['x-realtime-secret'] !== PUBLISH_SECRET) { res.writeHead(401); return res.end('Unauthorized'); }
    let raw = ''; req.on('data', chunk => raw += chunk); req.on('end', () => {
      try {
        const body = JSON.parse(raw || '{}');
        if (!body.topic || !body.type) throw new Error('topic and type required');
        broadcast({ id: crypto.randomUUID(), type: body.type, topic: body.topic, data: body.data || {}, timestamp: new Date().toISOString() });
        res.writeHead(202, {'content-type':'application/json'}); res.end(JSON.stringify({ok:true}));
      } catch (error) { res.writeHead(400); res.end(JSON.stringify({error:error.message})); }
    }); return;
  }
  res.writeHead(200, {'content-type':'application/json'}); res.end(JSON.stringify({ok:true,service:'trm-mariadb-realtime'}));
});
const wss = new WebSocketServer({ server });
wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const user = verifyToken(url.searchParams.get('token'));
  if (!user?.id) { ws.close(1008, 'Invalid token'); return; }
  const client = { ws, user, topics: new Set() };
  ws.send(JSON.stringify({type:'realtime.ready'}));
  ws.on('message', raw => { try { const message = JSON.parse(String(raw)); if (message.action === 'subscribe') for (const topic of message.topics || []) subscribe(client, topic); if (message.action === 'unsubscribe') for (const topic of message.topics || []) { topics.get(topic)?.delete(client); client.topics.delete(topic); } } catch {} });
  ws.on('close', () => cleanup(client));
});
server.listen(PORT, '0.0.0.0', () => console.log(`TRM MariaDB realtime listening on ${PORT}`));
