export default async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { sid, content } = req.body || {};
    if (!sid || !content) return res.status(400).json({ ok:false, error:'sid/content required' });

    // 1) Mark as pending in Redis
    await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/set/${sid}/pending`, {
      headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
    });

    // Optional: ping a specific user to trigger a sound
    const pingId = process.env.PING_USER_ID;
    const contentStr = pingId ? `<@${pingId}> ${content}` : content;

    // 2) Post a button message to Discord channel
    const body = {
      content: contentStr,
      allowed_mentions: pingId ? { users: [pingId] } : undefined,
      components: [{
        type: 1, // action row
        components: [
          { type: 2, style: 3, label: "Doğrula",     custom_id: `approve:${sid}` }, // green
          { type: 2, style: 4, label: "Hata Göster", custom_id: `reject:${sid}`  }  // red
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

    if (!resp.ok) {
      const t = await resp.text().catch(()=>'');
      return res.status(500).json({ ok:false, error:'discord_post_failed', detail:t });
    }

    res.json({ ok:true });
  } catch (e) {
    res.status(500).json({ ok:false, error:'server_error' });
  }
};