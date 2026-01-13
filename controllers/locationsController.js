// controllers/locationsController.js

import Locations from '../models/locationsModel.js';
import { broadcastBusLocation } from '../wsServer.js';

 
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* 🔹 THIS IS YOUR MAIN CONTROLLER */
export const addLocation = async (req, res) => {
  try {
    const { busNumber, latitude, longitude } = req.body;

    if (!busNumber || latitude == null || longitude == null) {
      return res.status(400).json({
        message: 'busNumber, latitude and longitude are required'
      });
    }

    const previous = await Locations.getLatest(busNumber);

    let speed = 0;
    const now = new Date();

    if (previous) {
      const distance = calculateDistance(
        previous.latitude,
        previous.longitude,
        latitude,
        longitude
      );

      const timeDiff = (now - new Date(previous.timestamp)) / 1000;

      if (timeDiff > 0) {
        speed = Number(((distance / timeDiff) * 3.6).toFixed(2));
      }
    }

    const inserted = await Locations.add({
      busNumber,
      latitude,
      longitude,
      speed,
      timestamp: now
    });

    broadcastBusLocation(inserted[0]);

    res.status(201).json({
      message: 'Location saved with auto-calculated speed',
      data: inserted[0]
    });

  } catch (error) {
    console.error('❌ addLocation error:', error);
    res.status(500).json({ message: error.message });
  }
};

export default addLocation;


