import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
  scheduleId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  date: { 
    type: Date, 
    required: true 
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
  },
  busId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Bus', 
    required: true 
  },
  driverId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Driver', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['upcoming', 'in-progress', 'completed', 'cancelled'], 
    default: 'upcoming' 
  },
  journeyStatus: {
    type: String,
    enum: ['not-started', 'at-terminal', 'journey-started', 'journey-completed'],
    default: 'not-started'
  },
  startTime: { 
    type: String 
  },
  endTime: { 
    type: String 
  },
  actualStartTime: { 
    type: Date 
  },
  actualEndTime: { 
    type: Date 
  },
  
  // NEW FIELDS FOR TRACKING
  currentStatus: {
    type: String,
    enum: ['waiting', 'at-terminal', 'journey-started', 'journey-completed', 'cancelled'],
    default: 'waiting'
  },
  locationUpdates: [{
    latitude: Number,
    longitude: Number,
    speed: Number,
    timestamp: Date,
    accuracy: Number
  }],
  lastLocation: {
    latitude: Number,
    longitude: Number,
    timestamp: Date
  },
  startJourneyTime: Date,
  endJourneyTime: Date
}, { timestamps: true });

export default mongoose.model("Schedule", scheduleSchema);