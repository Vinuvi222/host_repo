import express from 'express';
import { addLocation } from '../controllers/locationsController.js';

const router = express.Router();

// Unified route for Postman or mobile app
router.post('/add-location', addLocation);

export default router;
