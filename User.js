import mongoose from 'mongoose'; const id = { type: mongoose.Schema.Types.ObjectId, ref: 'User' };
export default mongoose.model('User', new mongoose.Schema({
  username: { type: String, unique: true, required: true, lowercase: true, trim: true }, email: { type: String, unique: true, required: true },
  password: String, name: String, bio: { type: String, default: '' }, avatar: String, followers: [id], following: [id],
}, { timestamps: true }));
