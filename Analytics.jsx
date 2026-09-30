import { useEffect, useState } from 'react'; import api from '../api';
export default function Analytics() {
  const [d, setD] = useState(); useEffect(() => { api.get('/analytics').then((r) => setD(r.data)); }, []); if (!d) return null;
  const max = Math.max(1, ...d.daily.flatMap((x) => [x.likes, x.comments]));
  const stats = [['Followers', d.followers], ['Following', d.following], ['Posts', d.posts], ['Likes', d.likes], ['Comments', d.comments], ['Avg. engagement / post', d.engagementRate]];
  return (<main><div className="stats">{stats.map(([k, v]) => <div key={k} className="card"><div className="muted">{k}</div><b>{v}</b></div>)}</div>
    <div className="card"><h3 style={{ marginTop: 0 }}>Last 7 days</h3><p className="muted">Likes (blue) and comments (amber) on posts published each day.</p>
      <div className="bars">{d.daily.map((x) => <div key={x.day}><div className="pair"><i title={`${x.likes} likes`} style={{ height: `${(x.likes / max) * 100}%` }} /><i className="c" title={`${x.comments} comments`} style={{ height: `${(x.comments / max) * 100}%` }} /></div><small className="muted">{x.day.slice(5)}</small></div>)}</div></div>
    <div className="card"><h3 style={{ marginTop: 0 }}>Top posts</h3>{d.top.map((p) => <div key={p._id} className="row between"><span>{p.text || '(media post)'}</span><span className="muted">♥ {p.likes} · 💬 {p.comments}</span></div>)}{!d.top.length && <p className="muted">Publish a post to see engagement here.</p>}</div></main>);
}
