import Redis from 'ioredis';
const url = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
export const redis = new Redis(url); export const sub = new Redis(url);
export async function notify(to, payload) {
  if (String(to) === String(payload.from?._id)) return; // never notify yourself
  const n = { id: Date.now() + Math.random().toString(36).slice(2, 7), at: Date.now(), ...payload };
  await redis.multi().lpush(`notif:${to}`, JSON.stringify(n)).ltrim(`notif:${to}`, 0, 49).incr(`unread:${to}`)
    .publish('notifications', JSON.stringify({ to: String(to), n })).exec();
}
