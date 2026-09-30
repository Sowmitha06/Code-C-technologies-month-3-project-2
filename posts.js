import { Router } from 'express'; import Post from '../models/Post.js'; import { protect, upload, publicUser } from '../utils/auth.js'; import { notify } from '../utils/redis.js';
const r = Router(); r.use(protect);
const populate = (q) => q.populate('author', publicUser).populate('comments.user', 'username avatar').sort('-createdAt').limit(50);
const from = (u) => ({ _id: u._id, username: u.username, avatar: u.avatar });
r.get('/feed', async (req, res) => res.json(await populate(Post.find({ author: { $in: [req.user._id, ...req.user.following] } }))));
r.get('/user/:id', async (req, res) => res.json(await populate(Post.find({ author: req.params.id }))));
r.post('/', upload.single('media'), async (req, res) => {
  if (!req.body.text?.trim() && !req.file) return res.status(400).json({ message: 'Add some text or a photo/video' });
  const p = await Post.create({ author: req.user._id, text: req.body.text, media: req.file && `/uploads/${req.file.filename}`, mediaType: req.file?.mimetype.split('/')[0] });
  res.json(await p.populate('author', publicUser));
});
r.post('/:id/like', async (req, res) => {
  const p = await Post.findById(req.params.id); const liked = p.likes.some((l) => String(l) === String(req.user._id));
  if (liked) p.likes.pull(req.user._id); else { p.likes.push(req.user._id); notify(p.author, { type: 'like', from: from(req.user), postId: p._id, text: 'liked your post' }); }
  await p.save(); res.json({ liked: !liked, likes: p.likes.length });
});
r.post('/:id/comment', async (req, res) => {
  if (!req.body.text?.trim()) return res.status(400).json({ message: 'Comment is empty' });
  const p = await Post.findById(req.params.id); p.comments.push({ user: req.user._id, text: req.body.text.slice(0, 500) }); await p.save();
  notify(p.author, { type: 'comment', from: from(req.user), postId: p._id, text: 'commented on your post' });
  await p.populate('comments.user', 'username avatar'); res.json(p.comments);
});
r.delete('/:id', async (req, res) => { await Post.deleteOne({ _id: req.params.id, author: req.user._id }); res.json({ ok: true }); });
export default r;
