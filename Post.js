import mongoose from 'mongoose'; const id = { type: mongoose.Schema.Types.ObjectId, ref: 'User' };
export default mongoose.model('Post', new mongoose.Schema({
  author: id, text: String, media: String, mediaType: String, likes: [id],
  comments: [{ user: id, text: String, createdAt: { type: Date, default: Date.now } }],
}, { timestamps: true }));
