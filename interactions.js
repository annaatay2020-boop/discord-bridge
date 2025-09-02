import { verifyKey } from "discord-interactions";
export const config = { api: { bodyParser: false } };

async function readRaw(req){ const cs=[]; for await (const c of req) cs.push(c); return Buffer.concat(cs); }

export default async (req, res) => {
  try {
    const sig = req.headers['x-signature-ed25519'];
    const ts  = req.headers['x-signature-timestamp'];
    const raw = await readRaw(req);
    const ok  = verifyKey(raw, sig, ts, process.env.DISCORD_PUBLIC_KEY);
    if (!ok) return res.status(401).send('bad sig');

    const i = JSON.parse(raw.toString('utf8'));
    if (i.type === 1) return res.json({ type: 1 }); // PING

    if (i.type === 3) { // BUTTON
      const [action, sid] = i.data.custom_id.split(':');
      const state = action === 'approve' ? 'approved' : 'rejected';
      await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/set/${sid}/${state}`, {
        headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
      });
      return res.json({ type: 7, data: { content: state==='approved'?'✅ Doğrulandı':'❌ Hata gösterildi', components: [] } });
    }

    res.json({ type: 4, data: { content: 'unsupported', flags: 64 } });
  } catch {
    res.status(500).send('error');
  }
};
