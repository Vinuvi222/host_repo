import mongoose from 'mongoose';

const permitSchema = new mongoose.Schema({
    permitId: { type: String, required: true, unique: true },
    routeName: { type: String, required: true },
    start: { type: String, required: true },
    destination: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Permit', permitSchema);
