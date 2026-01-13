import mongoose from "mongoose";

const journeyStatusSchema = new mongoose.Schema({
  scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  status: { 
    type: String, 
    enum: ['not-started', 'in-bus-stand', 'journey-started'],
    default: 'not-started'
  },
  timestamp: { type: Date, default: Date.now },
  location: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.model("JourneyStatus", journeyStatusSchema);