import mongoose from 'mongoose';

const permitSchema = new mongoose.Schema({
    permitId: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true
    },
    routeName: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Route', 
        required: true 
    },
    start: { 
        type: String, 
        required: true,
        trim: true
    },
    destination: { 
        type: String, 
        required: true,
        trim: true
    }
}, { 
    timestamps: true 
});

export default mongoose.model('Permit', permitSchema);
