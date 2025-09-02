export default async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { sid, content } = req.body || {};
    if (!sid || !content) return res.status(400).json({ ok:false, error:'sid/content required' });

    await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/set/${sid}/pending`, {
      headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
    });

    const pingId = process.env.PING_USER_ID;
    const body = {
      content: pingId ? `<@${pingId}> ${content}` : content,
      allowed_mentions: pingId ? { users: [pingId] } : undefined,
      components: [{
        type: 1,
        components: [
          { type: 2, style: 3, label: "Doğrula",     custom_id: `approve:${sid}` },
          { type: 2, style: 4, label: "Hata Göster", custom_id: `reject:${sid}`  }
        ]
      }]
    };

    const resp = await fetch(`https://discord.com/api/v10/channels/${process.env.DISCORD_CHANNEL_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${process.env.DISCORD_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!resp.ok) return res.status(500).json({ ok:false, error:'discord_post_failed' });
    res.json({ ok:true });
  } catch {
    res.status(500).json({ ok:false, error:'server_error' });
  }
};
