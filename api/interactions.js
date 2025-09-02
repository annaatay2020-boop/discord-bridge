import { verifyKey } from "discord-interactions";

export const config = { api: { bodyParser: false } };

async function readRaw(req){
  const chunks=[]; for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks);
}

export default async (req, res) => {
  try {
    const sig = req.headers['x-signature-ed25519'];
    const ts  = req.headers['x-signature-timestamp'];
    const raw = await readRaw(req);
    const ok  = verifyKey(raw, sig, ts, process.env.DISCORD_PUBLIC_KEY);
    if (!ok) return res.status(401).send('bad signature');

    const i = JSON.parse(raw.toString('utf8'));

    // PING
    if (i.type === 1) return res.json({ type: 1 });

    // MESSAGE COMPONENT (button)
    if (i.type === 3) {
      const [action, sid] = i.data.custom_id.split(':');
      const state = action === 'approve' ? 'approved' : 'rejected';

      await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/set/${sid}/${state}`, {
        headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
      });

      // Update the original message & remove buttons
      return res.json({
        type: 7,
        data: { content: state === 'approved' ? '✅ Doğrulandı' : '❌ Hata gösterildi', components: [] }
      });
    }

    // Unknown
    return res.json({ type: 4, data: { content: 'unsupported', flags: 64 } });
  } catch (e) {
    return res.status(500).send('error');
  }
};