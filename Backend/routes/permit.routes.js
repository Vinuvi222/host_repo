import express from 'express';
import Permit from '../models/permit.model.js';
import Route from '../models/routemodel.js';

const router = express.Router();

// Create a new permit
router.post('/add', async (req, res) => {
    try {
        const { permitId, routeName, start, destination } = req.body;

        // Validate required fields
        if (!permitId || !routeName || !start || !destination) {
            return res.status(400).json({
                message: 'permitId, routeName, start, and destination are required'
            });
        }

        // Check if route exists
        const routeExists = await Route.findById(routeName);
        if (!routeExists) {
            return res.status(404).json({
                message: 'Route not found'
            });
        }

        // Check if permitId already exists
        const existingPermit = await Permit.findOne({ permitId });
        if (existingPermit) {
            return res.status(409).json({
                message: 'Permit ID already exists'
            });
        }

        // Create permit
        const permit = new Permit({
            permitId,
            routeName,
            start,
            destination
        });

        await permit.save();

        // Populate route details
        const populatedPermit = await Permit.findById(permit._id)
            .populate('routeName', 'routeNumber routeName startLocation endLocation stops');

        res.status(201).json({
            message: 'Permit created successfully',
            permit: populatedPermit
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all permits
router.get('/', async (req, res) => {
    try {
        const permits = await Permit.find()
            .populate('routeName', 'routeNumber routeName startLocation endLocation')
            .sort({ createdAt: -1 });

        res.json(permits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get permit by ID
router.get('/:id', async (req, res) => {
    try {
        const permit = await Permit.findById(req.params.id)
            .populate('routeName', 'routeNumber routeName startLocation endLocation stops');

        if (!permit) {
            return res.status(404).json({ message: 'Permit not found' });
        }

        res.json(permit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update permit
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { routeName, start, destination } = req.body;

        // Don't allow updating permitId
        const updateData = { start, destination };
        if (routeName) {
            updateData.routeName = routeName;
        }

        const permit = await Permit.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('routeName', 'routeNumber routeName startLocation endLocation');

        if (!permit) {
            return res.status(404).json({ message: 'Permit not found' });
        }

        res.json({
            message: 'Permit updated successfully',
            permit
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete permit
router.delete('/:id', async (req, res) => {
    try {
        const permit = await Permit.findByIdAndDelete(req.params.id);

        if (!permit) {
            return res.status(404).json({ message: 'Permit not found' });
        }

        res.json({ message: 'Permit deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;