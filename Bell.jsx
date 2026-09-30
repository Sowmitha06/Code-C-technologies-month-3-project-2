import { useEffect, useState } from 'react'; import api from '../api'; import { useApp } from '../App';
export default function Bell() {
  const { socket } = useApp(); const [items, setItems] = useState([]); const [unread, setUnread] = useState(0); const [open, setOpen] = useState(false);
  useEffect(() => { api.get('/notifications').then((r) => { setItems(r.data.items); setUnread(r.data.unread); }); }, []);
  useEffect(() => { if (!socket) return; const h = (n) => { setItems((x) => [n, ...x].slice(0, 20)); setUnread((c) => c + 1); }; socket.on('notification', h); return () => socket.off('notification', h); }, [socket]);
  const toggle = () => { setOpen(!open); if (!open && unread) api.post('/notifications/read').then(() => setUnread(0)); };
  return (<><button className="ghost" onClick={toggle}>🔔{unread > 0 && <span className="badge">{unread}</span>}</button>
    {open && <div className="drop">{items.length ? items.map((n) => <div key={n.id} style={{ padding: 6 }}><b>{n.from?.username}</b> {n.text}<div className="muted" style={{ fontSize: 12 }}>{new Date(n.at).toLocaleTimeString()}</div></div>) : <p className="muted">No notifications yet.</p>}</div>}</>);
}
