import { Router } from 'express'; import User from '../models/User.js'; import Post from '../models/Post.js'; import { protect, upload, publicUser } from '../utils/auth.js'; import { notify } from '../utils/redis.js';
const r = Router(); r.use(protect);
r.get('/search', async (req, res) => { const q = new RegExp(String(req.query.q || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  res.json(await User.find({ _id: { $ne: req.user._id }, $or: [{ username: q }, { name: q }] }).select(publicUser).limit(10)); });
r.get('/:username', async (req, res) => {
  const u = await User.findOne({ username: req.params.username.toLowerCase() }).select(`${publicUser} followers following`).lean();
  if (!u) return res.status(404).json({ message: 'User not found' });
  res.json({ ...u, followers: u.followers.length, following: u.following.length, isFollowing: u.followers.some((f) => String(f) === String(req.user._id)), posts: await Post.countDocuments({ author: u._id }) });
});
r.put('/me', upload.single('avatar'), async (req, res) => {
  const { name, bio } = req.body; if (name !== undefined) req.user.name = name; if (bio !== undefined) req.user.bio = bio.slice(0, 200);
  if (req.file) req.user.avatar = `/uploads/${req.file.filename}`; await req.user.save(); res.json({ ...req.user.toObject(), password: undefined });
});
r.post('/:id/follow', async (req, res) => {
  const target = await User.findById(req.params.id); if (!target || String(target._id) === String(req.user._id)) return res.status(400).json({ message: 'Invalid user' });
  const has = target.followers.some((f) => String(f) === String(req.user._id));
  if (has) { target.followers.pull(req.user._id); req.user.following.pull(target._id); }
  else { target.followers.push(req.user._id); req.user.following.push(target._id); notify(target._id, { type: 'follow', from: { _id: req.user._id, username: req.user.username, avatar: req.user.avatar }, text: 'started following you' }); }
  await Promise.all([target.save(), req.user.save()]); res.json({ isFollowing: !has, followers: target.followers.length });
});
export default r;
