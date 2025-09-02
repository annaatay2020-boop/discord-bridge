# Discord ↔ Site Köprüsü (Vercel)

**API tabanlıdır.** Kökteki `index.html` basit test sayfasıdır.

## API’ler
- `POST /api/submit` → `{ sid, content }` alır; Discord kanalına butonlu mesaj gönderir; `sid` için `pending` yazar.
- `POST /api/interactions` → Discord **Interactions**. Buton tıklanınca `approved/rejected` yazar.
- `GET  /api/status?sid=...` → `pending | approved | rejected` döner.

## Ortam Değişkenleri (Vercel → Project → Settings → Environment Variables)
- `DISCORD_TOKEN`
- `DISCORD_PUBLIC_KEY`
- `DISCORD_CHANNEL_ID`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- (opsiyonel) `PING_USER_ID`

## Kurulum
- GitHub’a yükle → Vercel’e import → ENV’leri ekle → Redeploy.
- Discord Developer Portal → **General Information → Interactions Endpoint URL** = `https://<app>.vercel.app/api/interactions`.
