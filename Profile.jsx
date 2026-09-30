import { useEffect, useState } from 'react'; import { useParams } from 'react-router-dom'; import api from '../api'; import { useApp, Avatar } from '../App'; import { PostCard } from './Feed';
export default function Profile() {
  const { username } = useParams(); const { user, setUser } = useApp(); const [p, setP] = useState(); const [posts, setPosts] = useState([]); const [edit, setEdit] = useState(false); const [f, setF] = useState({}); const [file, setFile] = useState();
  const load = async () => { const r = await api.get(`/users/${username}`); setP(r.data); setF({ name: r.data.name, bio: r.data.bio }); setPosts((await api.get(`/posts/user/${r.data._id}`)).data); }; useEffect(() => { load(); }, [username]);
  const follow = async () => { const r = await api.post(`/users/${p._id}/follow`); setP({ ...p, isFollowing: r.data.isFollowing, followers: r.data.followers }); };
  const save = async (e) => { e.preventDefault(); const fd = new FormData(); fd.append('name', f.name); fd.append('bio', f.bio || ''); if (file) fd.append('avatar', file);
    const r = await api.put('/users/me', fd); setUser(r.data); setEdit(false); load(); };
  if (!p) return null; const mine = p._id === user._id;
  return (<main><div className="card"><div className="row"><Avatar u={p} lg /><div style={{ flex: 1 }}><h2 style={{ margin: 0 }}>{p.name}</h2><div className="muted">@{p.username}</div><p>{p.bio}</p>
    <div className="row muted"><span><b>{p.posts}</b> posts</span><span><b>{p.followers}</b> followers</span><span><b>{p.following}</b> following</span></div></div>
    {mine ? <button className="ghost" onClick={() => setEdit(!edit)}>Edit profile</button> : <button className={p.isFollowing ? 'ghost' : ''} onClick={follow}>{p.isFollowing ? 'Unfollow' : 'Follow'}</button>}</div>
    {edit && <form onSubmit={save} style={{ marginTop: 12 }}><input value={f.name || ''} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Name" /><textarea value={f.bio || ''} onChange={(e) => setF({ ...f, bio: e.target.value })} placeholder="Bio" />
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} /><button>Save changes</button></form>}</div>
    {posts.map((x) => <PostCard key={x._id} p={x} onDelete={load} />)}{!posts.length && <p className="muted">No posts yet.</p>}</main>);
}
