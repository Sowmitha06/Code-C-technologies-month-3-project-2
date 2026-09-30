import { Router } from 'express'; import Post from '../models/Post.js'; import { protect } from '../utils/auth.js';
const r = Router(); r.use(protect);
r.get('/', async (req, res) => {
  const posts = await Post.find({ author: req.user._id }).sort('-createdAt').lean(); const day = (d) => new Date(d).toISOString().slice(0, 10);
  const days = [...Array(7)].map((_, i) => day(Date.now() - (6 - i) * 864e5)); const byDay = Object.fromEntries(days.map((d) => [d, { day: d, posts: 0, likes: 0, comments: 0 }]));
  for (const p of posts) { const b = byDay[day(p.createdAt)]; if (b) { b.posts++; b.likes += p.likes.length; b.comments += p.comments.length; } }
  const likes = posts.reduce((s, p) => s + p.likes.length, 0), comments = posts.reduce((s, p) => s + p.comments.length, 0);
  res.json({ followers: req.user.followers.length, following: req.user.following.length, posts: posts.length, likes, comments,
    engagementRate: posts.length ? +((likes + comments) / posts.length).toFixed(1) : 0, daily: days.map((d) => byDay[d]),
    top: posts.map((p) => ({ _id: p._id, text: p.text, likes: p.likes.length, comments: p.comments.length })).sort((a, b) => b.likes + b.comments - (a.likes + a.comments)).slice(0, 5) });
});
export default r;
