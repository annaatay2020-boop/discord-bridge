export default async (req, res) => {
  try {
    const sid = req.query.sid || '';
    if (!sid) return res.status(400).json({ status:'missing' });
    const r = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/${sid}`, {
      headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
    });
    const j = await r.json().catch(()=>({}));
    res.json({ status: j.result || 'pending' });
  } catch {
    res.status(500).json({ status:'error' });
  }
};
