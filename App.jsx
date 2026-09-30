import { createContext, useContext, useEffect, useState } from 'react'; import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'; import { io } from 'socket.io-client';
import api from './api'; import Auth from './pages/Auth'; import Feed from './pages/Feed'; import Profile from './pages/Profile'; import Messages from './pages/Messages'; import Analytics from './pages/Analytics'; import Bell from './pages/Bell';
const Ctx = createContext(); export const useApp = () => useContext(Ctx);
export const Avatar = ({ u, lg }) => u?.avatar ? <img className={`av ${lg ? 'lg' : ''}`} src={u.avatar} alt="" /> : <div className={`av ${lg ? 'lg' : ''}`}>{(u?.username || '?')[0].toUpperCase()}</div>;
export default function App() {
  const [user, setUser] = useState(null); const [ready, setReady] = useState(false); const [socket, setSocket] = useState(null); const nav = useNavigate();
  useEffect(() => { api.get('/auth/me').then((r) => setUser(r.data)).catch(() => {}).finally(() => setReady(true)); }, []);
  useEffect(() => { if (!user) return; const s = io({ auth: { token: localStorage.getItem('token') } }); setSocket(s); return () => s.close(); }, [user?._id]);
  if (!ready) return null;
  const logout = () => { localStorage.removeItem('token'); setUser(null); nav('/login'); };
  return (<Ctx.Provider value={{ user, setUser, socket }}>
    {user && <nav><b>Pulse</b><Link to="/">Feed</Link><Link to="/messages">Messages</Link><Link to="/analytics">Analytics</Link><span className="grow" />
      <Bell /><Link to={`/u/${user.username}`}>@{user.username}</Link><button className="ghost" onClick={logout}>Log out</button></nav>}
    <Routes><Route path="/login" element={<Auth mode="login" />} /><Route path="/register" element={<Auth mode="register" />} />
      {user ? <><Route path="/" element={<Feed />} /><Route path="/u/:username" element={<Profile />} /><Route path="/messages" element={<Messages />} /><Route path="/analytics" element={<Analytics />} /></>
        : <Route path="*" element={<Navigate to="/login" />} />}</Routes></Ctx.Provider>);
}
