# Discord ↔ Site Köprüsü (Vercel)

## API’ler
- `POST /api/submit` → `{ sid, content }` alır, Discord kanalına butonlu mesaj gönderir ve `sid` için `pending` yazar.
- `POST /api/interactions` → Discord **Interactions Endpoint**. Buton tıklanınca `approved/rejected` yazar.
- `GET  /api/status?sid=...` → `pending | approved | rejected` döner.

## Ortam Değişkenleri
- `DISCORD_TOKEN`
- `DISCORD_PUBLIC_KEY`
- `DISCORD_CHANNEL_ID`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- (opsiyonel) `PING_USER_ID` → `<@id>` mention ile ping sesi almak için

## Test
```
curl -X POST https://<app>.vercel.app/api/submit \
 -H "Content-Type: application/json" \
 -d '{"sid":"test-1","content":"Form geldi"}'
curl https://<app>.vercel.app/api/status?sid=test-1
```
