import jwt from 'jsonwebtoken'; import multer from 'multer'; import path from 'path'; import crypto from 'crypto'; import User from '../models/User.js';
export const protect = async (req, res, next) => {
  try { req.user = await User.findById(jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), process.env.JWT_SECRET).id); if (!req.user) throw 0; next(); }
  catch { res.status(401).json({ message: 'Please log in' }); }
};
export const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
export const upload = multer({
  storage: multer.diskStorage({ destination: 'uploads', filename: (_, f, cb) => cb(null, crypto.randomBytes(12).toString('hex') + path.extname(f.originalname).toLowerCase()) }),
  limits: { fileSize: 25e6 }, fileFilter: (_, f, cb) => cb(null, /^(image|video)\//.test(f.mimetype)),
});
export const publicUser = 'username name avatar bio';
