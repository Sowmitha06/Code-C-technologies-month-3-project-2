import mongoose from 'mongoose'; const id = { type: mongoose.Schema.Types.ObjectId, ref: 'User' };
export default mongoose.model('Message', new mongoose.Schema({ from: id, to: id, text: String }, { timestamps: true }));
