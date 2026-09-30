import { Router } from 'express'; import { protect } from '../utils/auth.js'; import { redis } from '../utils/redis.js';
const r = Router(); r.use(protect);
r.get('/', async (req, res) => { const [items, unread] = await Promise.all([redis.lrange(`notif:${req.user._id}`, 0, 19), redis.get(`unread:${req.user._id}`)]); res.json({ items: items.map(JSON.parse), unread: +unread || 0 }); });
r.post('/read', async (req, res) => { await redis.set(`unread:${req.user._id}`, 0); res.json({ ok: true }); });
export default r;
