import 'dotenv/config';
import http from 'http'; import express from 'express'; import cors from 'cors'; import mongoose from 'mongoose'; import jwt from 'jsonwebtoken'; import { Server } from 'socket.io';
import { sub } from './utils/redis.js'; import Message from './models/Message.js'; import { notify } from './utils/redis.js'; import User from './models/User.js';
import auth from './routes/auth.js'; import users from './routes/users.js'; import posts from './routes/posts.js';
import messages from './routes/messages.js'; import notifications from './routes/notifications.js'; import analytics from './routes/analytics.js';
const app = express(); const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CLIENT_URL } });
app.use(cors({ origin: process.env.CLIENT_URL })); app.use(express.json()); app.use('/uploads', express.static('uploads'));
app.use('/api/auth', auth); app.use('/api/users', users); app.use('/api/posts', posts);
app.use('/api/messages', messages); app.use('/api/notifications', notifications); app.use('/api/analytics', analytics);
app.use((err, req, res, next) => res.status(err.status || 500).json({ message: err.message }));

io.use((socket, next) => { try { socket.userId = jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET).id; next(); } catch { next(new Error('unauthorized')); } });
const online = new Set();
io.on('connection', (socket) => {
  socket.join(socket.userId); online.add(socket.userId); io.emit('presence', [...online]);
  socket.on('message:send', async ({ to, text }, ack) => {
    if (!text?.trim()) return;
    const m = await Message.create({ from: socket.userId, to, text: text.trim().slice(0, 2000) });
    io.to(to).to(socket.userId).emit('message:new', m); ack?.(m);
    const me = await User.findById(socket.userId).select('username avatar');
    notify(to, { type: 'message', from: me, text: 'sent you a message' });
  });
  socket.on('typing', ({ to }) => io.to(to).emit('typing', { from: socket.userId }));
  socket.on('disconnect', () => { if (!io.sockets.adapter.rooms.get(socket.userId)) online.delete(socket.userId); io.emit('presence', [...online]); });
});
sub.subscribe('notifications');
sub.on('message', (_, raw) => { const { to, n } = JSON.parse(raw); io.to(to).emit('notification', n); });
mongoose.connect(process.env.MONGO_URI).then(() => server.listen(5000, () => console.log('API + sockets on :5000')));
