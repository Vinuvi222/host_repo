import express from 'express';
import Locations from '../models/locationsModel.js';  
import { broadcastBusLocation } from '../wsServer.js';

const router = express.Router();

router.post('/add-location', async (req, res) => {
  try {
    console.log('='.repeat(50));
    console.log('🔍 Backend - Received POST /add-location request');
    console.log('📅 Time:', new Date().toISOString());
    console.log('📥 Full request body:', JSON.stringify(req.body, null, 2));
    
    const { busNumber, latitude, longitude, speed, timestamp } = req.body;
    
    // Detailed field inspection
    console.log('\n🔍 Extracted fields analysis:');
    console.log('- busNumber:', busNumber, 
                '| type:', typeof busNumber, 
                '| isString:', typeof busNumber === 'string',
                '| length:', typeof busNumber === 'string' ? busNumber.length : 'N/A',
                '| trimmed:', typeof busNumber === 'string' ? `"${busNumber.trim()}"` : 'N/A');
    
    console.log('- latitude:', latitude, 
                '| type:', typeof latitude, 
                '| isNumber:', typeof latitude === 'number',
                '| isFinite:', typeof latitude === 'number' ? isFinite(latitude) : 'N/A');
    
    console.log('- longitude:', longitude, 
                '| type:', typeof longitude, 
                '| isNumber:', typeof longitude === 'number',
                '| isFinite:', typeof longitude === 'number' ? isFinite(longitude) : 'N/A');
    
    console.log('- speed:', speed, 
                '| type:', typeof speed, 
                '| isNumber:', typeof speed === 'number',
                '| isFinite:', typeof speed === 'number' ? isFinite(speed) : 'N/A');
    
    console.log('- timestamp:', timestamp, 
                '| type:', typeof timestamp, 
                '| isString:', typeof timestamp === 'string',
                '| length:', typeof timestamp === 'string' ? timestamp.length : 'N/A');
    
    // Strict validation with detailed error messages
    const validationErrors = [];
    
    // Check busNumber
    if (busNumber === undefined || busNumber === null) {
      validationErrors.push('busNumber is undefined or null');
    } else if (typeof busNumber !== 'string') {
      validationErrors.push(`busNumber must be a string, got ${typeof busNumber}`);
    } else if (busNumber.trim() === '') {
      validationErrors.push('busNumber is empty string');
    }
    
    // Check latitude
    if (latitude === undefined || latitude === null) {
      validationErrors.push('latitude is undefined or null');
    } else if (typeof latitude !== 'number') {
      validationErrors.push(`latitude must be a number, got ${typeof latitude}`);
    } else if (!isFinite(latitude)) {
      validationErrors.push(`latitude is not a finite number: ${latitude}`);
    } else if (latitude < -90 || latitude > 90) {
      validationErrors.push(`latitude out of range (-90 to 90): ${latitude}`);
    }
    
    // Check longitude
    if (longitude === undefined || longitude === null) {
      validationErrors.push('longitude is undefined or null');
    } else if (typeof longitude !== 'number') {
      validationErrors.push(`longitude must be a number, got ${typeof longitude}`);
    } else if (!isFinite(longitude)) {
      validationErrors.push(`longitude is not a finite number: ${longitude}`);
    } else if (longitude < -180 || longitude > 180) {
      validationErrors.push(`longitude out of range (-180 to 180): ${longitude}`);
    }
    
    // Check speed
    if (speed === undefined || speed === null) {
      validationErrors.push('speed is undefined or null');
    } else if (typeof speed !== 'number') {
      validationErrors.push(`speed must be a number, got ${typeof speed}`);
    } else if (!isFinite(speed)) {
      validationErrors.push(`speed is not a finite number: ${speed}`);
    } else if (speed < 0) {
      validationErrors.push(`speed cannot be negative: ${speed}`);
    }
    
    // Check timestamp
    if (timestamp === undefined || timestamp === null) {
      validationErrors.push('timestamp is undefined or null');
    } else if (typeof timestamp !== 'string') {
      validationErrors.push(`timestamp must be a string, got ${typeof timestamp}`);
    } else if (timestamp.trim() === '') {
      validationErrors.push('timestamp is empty string');
    } else {
      // Try to parse the timestamp
      try {
        const parsedDate = new Date(timestamp);
        if (isNaN(parsedDate.getTime())) {
          validationErrors.push(`timestamp is not a valid date: "${timestamp}"`);
        } else {
          console.log(`✅ Timestamp parsed successfully: ${parsedDate.toISOString()}`);
        }
      } catch (dateError) {
        validationErrors.push(`timestamp parsing error: ${dateError.message}`);
      }
    }
    
    // If validation errors, return them
    if (validationErrors.length > 0) {
      console.log('\n❌ Validation failed with errors:');
      validationErrors.forEach(error => console.log(`  - ${error}`));
      
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: validationErrors,
        receivedData: {
          busNumber: busNumber !== undefined,
          latitude: latitude !== undefined ? `number: ${latitude}` : 'missing',
          longitude: longitude !== undefined ? `number: ${longitude}` : 'missing',
          speed: speed !== undefined ? `number: ${speed}` : 'missing',
          timestamp: timestamp !== undefined ? `string: "${timestamp}"` : 'missing'
        }
      });
    }
    
    console.log('\n✅ All validations passed!');
    console.log('📝 Inserting into database...');
    
    // Insert into database
    const data = await Locations.add({ 
      busNumber, 
      latitude, 
      longitude, 
      speed, 
      timestamp 
    });

    console.log('✅ Database insert successful!');
    console.log('📊 Inserted data:', JSON.stringify(data, null, 2));
    
    // Broadcast to WebSocket clients
    console.log('📡 Broadcasting to WebSocket clients...');
    broadcastBusLocation({
      busNumber,
      latitude,
      longitude,
      speed,
      timestamp
    });
    
    console.log('✅ Broadcast complete');
    console.log('='.repeat(50));

    res.status(201).json({ 
      message: 'Location saved successfully!', 
      data 
    });
    
  } catch (error) {
    console.error('\n❌ ERROR in /add-location endpoint:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check if it's a PostgreSQL/Supabase error
    if (error.message && error.message.includes('database')) {
      console.error('⚠️ Database/Supabase error detected');
    }
    
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message,
      errorType: error.constructor.name
    });
  }
});

// GET latest location of a bus
router.get('/latest/:busNumber', async (req, res) => {
  try {
    const busNumber = req.params.busNumber;
    
    console.log(`🔍 GET /latest/${busNumber} requested`);
    
    if (!busNumber || busNumber.trim() === '') {
      return res.status(400).json({ 
        message: 'busNumber parameter is required' 
      });
    }

    const latestLocation = await Locations.getLatest(busNumber);

    if (!latestLocation) {
      console.log(`ℹ️ No location found for bus: ${busNumber}`);
      return res.status(404).json({ 
        message: 'No location found for this bus.',
        busNumber: busNumber
      });
    }

    console.log(`✅ Found latest location for ${busNumber}:`, latestLocation);
    
    res.status(200).json({ 
      message: 'Latest location retrieved', 
      data: latestLocation 
    });
  } catch (error) {
    console.error(`❌ Error in GET /latest/${req.params.busNumber}:`, error);
    res.status(500).json({ 
      message: error.message,
      busNumber: req.params.busNumber
    });
  }
});

export default router;


