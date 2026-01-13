import mongoose from "mongoose";

const busSchema = new mongoose.Schema({
    busNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    busName: {
        type: String,
        required: true,
        trim: true
    },
    model: {
        type: String,
        required: true,
        trim: true
    },
    numberPlate: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    seats: {
        type: Number,
        required: true,
        min: 10,
        max: 100
    },
    permitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permit',
        required: true
    },
    routeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route',
        required: true
    }
}, { timestamps: true });

export default mongoose.model("Bus", busSchema);