import { useState } from 'react'; import { Link, useNavigate } from 'react-router-dom'; import api from '../api'; import { useApp } from '../App';
export default function Auth({ mode }) {
  const [f, setF] = useState({}); const [err, setErr] = useState(''); const { setUser } = useApp(); const nav = useNavigate(); const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => { e.preventDefault(); try { const r = await api.post(`/auth/${mode}`, f); localStorage.setItem('token', r.data.token); setUser(r.data.user); nav('/'); } catch (x) { setErr(x.response?.data?.message || 'Something went wrong'); } };
  return (<main style={{ maxWidth: 380 }}><form className="card" onSubmit={submit}><h2>{mode === 'login' ? 'Log in' : 'Create account'}</h2>
    {mode === 'register' && <><input placeholder="Username" onChange={set('username')} required /><input placeholder="Display name" onChange={set('name')} /></>}
    <input type="email" placeholder="Email" onChange={set('email')} required /><input type="password" placeholder="Password (6+ characters)" onChange={set('password')} required />
    {err && <div className="err">{err}</div>}<button>{mode === 'login' ? 'Log in' : 'Sign up'}</button>
    <span className="muted">{mode === 'login' ? <>New here? <Link to="/register">Sign up</Link></> : <>Have an account? <Link to="/login">Log in</Link></>}</span></form></main>);
}
