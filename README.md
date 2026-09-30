# Social Media Dashboard (MERN + Socket.IO + Redis)
Profiles with media uploads, real-time chat, likes/comments/follows, engagement analytics, Redis-backed notifications.

## Run
```
docker run -d -p 6379:6379 redis          # Redis (or install locally)
cd server && cp .env.example .env && npm i && npm run dev    # :5000
cd client && npm i && npm run dev                            # :5173
```
Needs MongoDB running locally. Open two browsers (or one normal + one incognito), sign up two users, follow each other, then chat and like posts to see live notifications.

## How Redis is used
Each notification is pushed onto a per-user list (`notif:<id>`, capped at 50), an unread counter (`unread:<id>`) is incremented, and the event is published on the `notifications` channel. A subscriber in `index.js` forwards it to that user's Socket.IO room. Because Redis pub/sub sits in the middle, this keeps working with several server instances.
