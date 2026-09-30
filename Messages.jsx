import { useEffect, useRef, useState } from 'react'; import { Link } from 'react-router-dom'; import api from '../api'; import { useApp, Avatar } from '../App';
export default function Messages() {
  const { user, socket } = useApp(); const [convos, setConvos] = useState([]); const [sel, setSel] = useState(); const [msgs, setMsgs] = useState([]); const [text, setText] = useState(''); const [q, setQ] = useState(''); const [found, setFound] = useState([]); const [online, setOnline] = useState([]); const [typing, setTyping] = useState(false); const end = useRef();
  const loadConvos = () => api.get('/messages/conversations').then((r) => setConvos(r.data)); useEffect(() => { loadConvos(); }, []);
  useEffect(() => { if (sel) api.get(`/messages/${sel._id}`).then((r) => setMsgs(r.data)); }, [sel?._id]);
  useEffect(() => { if (!socket) return;
    const onMsg = (m) => { if (sel && [m.from, m.to].includes(sel._id)) setMsgs((x) => x.some((y) => y._id === m._id) ? x : [...x, m]); loadConvos(); };
    const onTyping = ({ from }) => { if (from === sel?._id) { setTyping(true); setTimeout(() => setTyping(false), 1500); } };
    socket.on('message:new', onMsg); socket.on('presence', setOnline); socket.on('typing', onTyping);
    return () => { socket.off('message:new', onMsg); socket.off('presence', setOnline); socket.off('typing', onTyping); }; }, [socket, sel?._id]);
  useEffect(() => { end.current?.scrollIntoView(); }, [msgs]);
  useEffect(() => { if (!q.trim()) return setFound([]); const t = setTimeout(() => api.get('/users/search', { params: { q } }).then((r) => setFound(r.data)), 250); return () => clearTimeout(t); }, [q]);
  const send = (e) => { e.preventDefault(); if (!text.trim()) return; socket.emit('message:send', { to: sel._id, text }); setText(''); };
  return (<main style={{ maxWidth: 900 }}><div className="chat"><div className="card"><input placeholder="Find people" value={q} onChange={(e) => setQ(e.target.value)} />
    {(q ? found : convos).map((u) => <div key={u._id} className={`item row ${sel?._id === u._id ? 'sel' : ''}`} onClick={() => { setSel(u); setQ(''); }}><Avatar u={u} /><div><b>{u.username}</b> {online.includes(u._id) && <span className="dot" />}<div className="muted" style={{ fontSize: 13 }}>{u.last}</div></div></div>)}
    {!q && !convos.length && <p className="muted">No conversations yet. Search for someone to say hi.</p>}</div>
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>{sel ? <><div className="row between"><b>{sel.name || sel.username}</b><Link to={`/u/${sel.username}`}>View profile</Link></div>
      <div className="msgs">{msgs.map((m) => <div key={m._id} className={`bub ${m.from === user._id ? 'me' : ''}`}>{m.text}</div>)}{typing && <div className="muted">typing…</div>}<div ref={end} /></div>
      <form className="row" onSubmit={send}><input style={{ flex: 1, width: 'auto' }} placeholder="Write a message" value={text} onChange={(e) => { setText(e.target.value); socket.emit('typing', { to: sel._id }); }} /><button>Send</button></form></> : <p className="muted">Choose a conversation.</p>}</div></div></main>);
}
