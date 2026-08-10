import http from 'node:http';
import crypto from 'node:crypto';

const PORT = Number(process.env.PORT || 8080);
const TOKEN_SECRET = process.env.REALTIME_TOKEN_SECRET || '';
const PUBLISH_SECRET = process.env.REALTIME_PUBLISH_SECRET || '';
if (!TOKEN_SECRET || !PUBLISH_SECRET) throw new Error('Realtime secrets are required.');
const topics = new Map();
const clients = new Set();
const verify = (token) => {
  const [a,b] = String(token||'').split('.'); if(!a||!b) return null;
  const e=crypto.createHmac('sha256',TOKEN_SECRET).update(a).digest('base64url');
  if(b.length!==e.length || !crypto.timingSafeEqual(Buffer.from(b),Buffer.from(e))) return null;
  const p=JSON.parse(Buffer.from(a,'base64url').toString()); return p.exp>Date.now()/1000?p:null;
};
function frame(text){const d=Buffer.from(text); if(d.length<126)return Buffer.concat([Buffer.from([0x81,d.length]),d]); if(d.length<65536){const h=Buffer.alloc(4);h[0]=0x81;h[1]=126;h.writeUInt16BE(d.length,2);return Buffer.concat([h,d]);} const h=Buffer.alloc(10);h[0]=0x81;h[1]=127;h.writeBigUInt64BE(BigInt(d.length),2);return Buffer.concat([h,d]);}
function send(c,o){try{c.socket.write(frame(JSON.stringify(o)))}catch{}}
function subscribe(c,t){if(t!=='admin'&&!t.startsWith('artist:'))return;if(t==='admin'&&c.user.role!=='admin')return;if(t.startsWith('artist:')&&t!==`artist:${c.user.id}`&&c.user.role!=='admin')return;if(!topics.has(t))topics.set(t,new Set());topics.get(t).add(c);c.topics.add(t)}
function publish(e){const set=new Set(topics.get(e.topic)||[]);if(e.topic.startsWith('artist:'))for(const c of topics.get('admin')||[])set.add(c);for(const c of set)send(c,e)}
function parse(buf){if(buf.length<2)return null;const len=buf[1]&127;let o=2,n=len;if(len===126){if(buf.length<4)return null;n=buf.readUInt16BE(2);o=4}else if(len===127){if(buf.length<10)return null;n=Number(buf.readBigUInt64BE(2));o=10}const masked=!!(buf[1]&128);if(masked)o+=4;if(buf.length<o+n)return null;let p=buf.subarray(o,o+n);if(masked){const m=buf.subarray(o-4,o);p=Buffer.from(p);for(let i=0;i<p.length;i++)p[i]^=m[i%4]}return {opcode:buf[0]&15,text:(buf[0]&15)===1?p.toString():null,bytes:o+n}}
const server=http.createServer((req,res)=>{if(req.method==='POST'&&req.url==='/publish'){if(req.headers['x-realtime-secret']!==PUBLISH_SECRET)return res.writeHead(401).end();let raw='';req.on('data',d=>raw+=d);req.on('end',()=>{try{const b=JSON.parse(raw);publish({id:crypto.randomUUID(),type:b.type,topic:b.topic,data:b.data||{},timestamp:new Date().toISOString()});res.writeHead(202,{'content-type':'application/json'}).end('{"ok":true}')}catch(e){res.writeHead(400).end(JSON.stringify({error:e.message}))}});return}res.writeHead(200,{'content-type':'application/json'}).end('{"ok":true,"service":"trm-realtime"}')});
server.on('upgrade',(req,socket)=>{try{const u=new URL(req.url,`http://${req.headers.host}`),user=verify(u.searchParams.get('token'));if(!user){socket.destroy();return}const key=req.headers['sec-websocket-key'];const accept=crypto.createHash('sha1').update(key+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);const c={socket,user,topics:new Set(),buffer:Buffer.alloc(0)};clients.add(c);send(c,{type:'realtime.ready',topic:'system',timestamp:new Date().toISOString()});socket.on('data',chunk=>{c.buffer=Buffer.concat([c.buffer,chunk]);while(true){const m=parse(c.buffer);if(!m)break;c.buffer=c.buffer.subarray(m.bytes);if(m.opcode===8){socket.end();break}if(m.text){try{const b=JSON.parse(m.text);for(const t of b.topics||[])if(b.action==='subscribe')subscribe(c,t);else if(b.action==='unsubscribe')topics.get(t)?.delete(c)}catch{}}}});socket.on('close',()=>{for(const t of c.topics)topics.get(t)?.delete(c);clients.delete(c)})}catch{socket.destroy()}});
server.listen(PORT,'0.0.0.0',()=>console.log(`TRM realtime server listening on ${PORT}`));
