import { useEffect, useState } from 'react'; import { Link } from 'react-router-dom'; import api from '../api'; import { useApp, Avatar } from '../App';
export function PostCard({ p, onDelete }) {
  const { user } = useApp(); const [likes, setLikes] = useState(p.likes.length); const [liked, setLiked] = useState(p.likes.includes(user._id)); const [comments, setComments] = useState(p.comments); const [text, setText] = useState('');
  const like = async () => { const r = await api.post(`/posts/${p._id}/like`); setLikes(r.data.likes); setLiked(r.data.liked); };
  const comment = async (e) => { e.preventDefault(); if (!text.trim()) return; setComments((await api.post(`/posts/${p._id}/comment`, { text })).data); setText(''); };
  return (<div className="card post"><div className="row between"><Link to={`/u/${p.author.username}`} className="row"><Avatar u={p.author} /><b>{p.author.name || p.author.username}</b><span className="muted">{new Date(p.createdAt).toLocaleString()}</span></Link>
    {p.author._id === user._id && <button className="ghost" onClick={() => api.delete(`/posts/${p._id}`).then(onDelete)}>Delete</button>}</div>
    <p>{p.text}</p>{p.media && (p.mediaType === 'video' ? <video src={p.media} controls /> : <img src={p.media} alt="" />)}
    <div className="row" style={{ marginTop: 8 }}><button className={liked ? 'on' : 'ghost'} onClick={like}>♥ {likes}</button><span className="muted">{comments.length} comments</span></div>
    {comments.map((c) => <div key={c._id} style={{ marginTop: 6 }}><b>{c.user?.username}</b> {c.text}</div>)}
    <form onSubmit={comment} className="row" style={{ marginTop: 8 }}><input style={{ flex: 1, width: 'auto' }} placeholder="Add a comment" value={text} onChange={(e) => setText(e.target.value)} /><button className="ghost">Post</button></form></div>);
}
export default function Feed() {
  const [posts, setPosts] = useState([]); const [text, setText] = useState(''); const [file, setFile] = useState(null); const [err, setErr] = useState('');
  const load = () => api.get('/posts/feed').then((r) => setPosts(r.data)); useEffect(() => { load(); }, []);
  const submit = async (e) => { e.preventDefault(); const fd = new FormData(); fd.append('text', text); if (file) fd.append('media', file);
    try { await api.post('/posts', fd); setText(''); setFile(null); e.target.reset(); load(); } catch (x) { setErr(x.response?.data?.message); } };
  return (<main><form className="card" onSubmit={submit}><textarea rows={3} placeholder="What's happening?" value={text} onChange={(e) => setText(e.target.value)} />
    <div className="row between"><input type="file" accept="image/*,video/*" style={{ width: 'auto' }} onChange={(e) => setFile(e.target.files[0])} /><button>Post</button></div>{err && <div className="err">{err}</div>}</form>
    {posts.map((p) => <PostCard key={p._id} p={p} onDelete={load} />)}{!posts.length && <p className="muted">Your feed is empty. Post something or search for people on the Messages page and follow them from their profile.</p>}</main>);
}
