import { Router } from 'express'; import Message from '../models/Message.js'; import User from '../models/User.js'; import { protect, publicUser } from '../utils/auth.js';
const r = Router(); r.use(protect);
r.get('/conversations', async (req, res) => {
  const msgs = await Message.find({ $or: [{ from: req.user._id }, { to: req.user._id }] }).sort('-createdAt').limit(300); const seen = new Map();
  for (const m of msgs) { const other = String(m.from) === String(req.user._id) ? String(m.to) : String(m.from); if (!seen.has(other)) seen.set(other, m); }
  const users = await User.find({ _id: { $in: [...seen.keys()] } }).select(publicUser).lean();
  res.json(users.map((u) => ({ ...u, last: seen.get(String(u._id)).text, at: seen.get(String(u._id)).createdAt })).sort((a, b) => b.at - a.at));
});
r.get('/:userId', async (req, res) => res.json(await Message.find({ $or: [{ from: req.user._id, to: req.params.userId }, { from: req.params.userId, to: req.user._id }] }).sort('createdAt').limit(200)));
export default r;
