// server.js
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

// Import routes
import driverRoutes from './routes/driver.routes.js';
import loginRoutes from './routes/auth.route.js';
import addingRoutes from './routes/adding.routes.js';
import locationRoutes from './routes/location.routes.js';
import scheduleRoutes from './routes/schedule.routes.js';
import permitRoutes from './routes/permit.routes.js';
import busRoutes from './routes/bus.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

dotenv.config();

const PORT = process.env.PORT || 8070;
const URL = process.env.MONGODB_URL;

mongoose.connect(URL);

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB connection is successful');
});

// Routes
app.use('/driver', driverRoutes);
app.use('/auth', loginRoutes);
app.use('/bus-route', addingRoutes);
app.use('/locations', locationRoutes);
app.use('/schedule', scheduleRoutes);
app.use('/permit', permitRoutes);
app.use('/bus', busRoutes);

// NEW TRACKING ENDPOINTS

// Get next schedule within 1 hour
app.get('/schedule/next-within-hour/:driverId', async (req, res) => {
  try {
    const { driverId } = req.params;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const schedule = await Schedule.findOne({
      driverId,
      date: { $gte: today },
      status: 'upcoming',
      $or: [
        { journeyStatus: 'not-started' },
        { journeyStatus: { $exists: false } }
      ]
    })
    .populate('routeId', 'routeNumber routeName startLocation endLocation')
    .populate('busId', 'busNumber busName model seats')
    .populate('permitId', 'permitId start destination')
    .sort({ date: 1, startTime: 1 })
    .limit(1);
    
    if (!schedule) {
      return res.status(404).json({ 
        success: false,
        message: 'No upcoming schedule' 
      });
    }
    
    res.json({
      success: true,
      data: schedule
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Update schedule location
app.post('/schedule/update-location', async (req, res) => {
  try {
    const { scheduleId, latitude, longitude, speed, accuracy, timestamp } = req.body;
    
    if (!scheduleId || !latitude || !longitude) {
      return res.status(400).json({ 
        message: 'scheduleId, latitude, and longitude are required' 
      });
    }
    
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ 
        message: 'Schedule not found' 
      });
    }
    
    // Update location
    schedule.lastLocation = {
      latitude,
      longitude,
      timestamp: new Date(timestamp || Date.now())
    };
    
    // Auto-detect if journey started (moved > 100 meters)
    if (schedule.journeyStatus === 'at-terminal' && schedule.lastLocation) {
      const prevLocation = schedule.locationUpdates[schedule.locationUpdates.length - 1];
      if (prevLocation) {
        const distance = calculateDistance(
          prevLocation.latitude, prevLocation.longitude,
          latitude, longitude
        );
        
        if (distance > 100) {
          schedule.journeyStatus = 'journey-started';
          schedule.startJourneyTime = new Date();
        }
      }
    }
    
    // Add to location updates array
    schedule.locationUpdates.push({
      latitude,
      longitude,
      speed: speed || 0,
      accuracy: accuracy || 0,
      timestamp: new Date(timestamp || Date.now())
    });
    
    await schedule.save();
    
    res.json({ 
      message: 'Location updated',
      journeyStatus: schedule.journeyStatus
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});