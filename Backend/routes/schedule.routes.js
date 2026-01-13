import express from "express";
import Schedule from "../models/schedule.model.js";
import JourneyStatus from "../models/journeyStatus.model.js";
import Bus from "../models/bus.model.js";

const router = express.Router();

// Create new schedule
router.post("/add", async (req, res) => {
  try {
    const { date, permitId, routeId, busId, driverId, startTime, endTime } = req.body;

    // Generate schedule ID
    const scheduleId = `SCH-${Date.now()}`;

    const schedule = new Schedule({
      scheduleId,
      date: new Date(date),
      permitId,
      routeId,
      busId,
      driverId,
      startTime,
      endTime
    });

    await schedule.save();
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get schedules for a driver (for mobile app)
router.get("/driver/:driverId", async (req, res) => {
  try {
    const { driverId } = req.params;
    const { month, year } = req.query;
    
    let query = { driverId };
    
    // Filter by month/year if provided
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    const schedules = await Schedule.find(query)
      .populate('routeId', 'routeNumber routeName')
      .populate('busId', 'busNumber model')
      .populate('permitId', 'permitId start destination')
      .sort({ date: 1, startTime: 1 });
    
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update journey status
router.post("/update-journey-status", async (req, res) => {
  try {
    const { scheduleId, driverId, status, latitude, longitude, notes } = req.body;
    
    // Update schedule status
    const schedule = await Schedule.findByIdAndUpdate(
      scheduleId,
      { 
        journeyStatus: status,
        ...(status === 'journey-started' && !schedule.actualStartTime ? { actualStartTime: new Date() } : {}),
        ...(status === 'completed' ? { actualEndTime: new Date(), status: 'completed' } : {})
      },
      { new: true }
    );
    
    // Create journey status record
    const journeyStatus = new JourneyStatus({
      scheduleId,
      driverId,
      busId: schedule.busId,
      status,
      location: latitude && longitude ? { latitude, longitude } : undefined,
      notes,
      timestamp: new Date()
    });
    
    await journeyStatus.save();
    
    res.json({ 
      message: 'Journey status updated successfully',
      schedule,
      journeyStatus 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get upcoming schedules for today and tomorrow
router.get("/upcoming/:driverId", async (req, res) => {
  try {
    const { driverId } = req.params;
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const schedules = await Schedule.find({
      driverId,
      date: { $gte: today.setHours(0,0,0,0), $lte: tomorrow.setHours(23,59,59,999) },
      status: 'upcoming'
    })
    .populate('routeId', 'routeNumber routeName')
    .populate('busId', 'busNumber model')
    .sort({ date: 1, startTime: 1 });
    
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;