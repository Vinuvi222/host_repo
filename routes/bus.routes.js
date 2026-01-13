import express from "express";
import Bus from "../models/bus.model.js";
import Permit from "../models/permit.model.js";
import Route from "../models/routemodel.js";

const router = express.Router();

// Add a new bus
router.post("/add", async (req, res) => {
    try {
        const {
            busNumber,
            busName,
            model,
            numberPlate,
            seats,
            permitId,
            routeId
        } = req.body;

        // Validate required fields
        if (!busNumber || !busName || !model || !numberPlate || !seats || !permitId || !routeId) {
            return res.status(400).json({
                message: "All fields are required: busNumber, busName, model, numberPlate, seats, permitId, routeId"
            });
        }

        // Check if bus number already exists
        const existingBusNumber = await Bus.findOne({ busNumber });
        if (existingBusNumber) {
            return res.status(409).json({
                message: "Bus number already exists"
            });
        }

        // Check if number plate already exists
        const existingNumberPlate = await Bus.findOne({ numberPlate });
        if (existingNumberPlate) {
            return res.status(409).json({
                message: "Number plate already exists"
            });
        }

        // Check if permit exists
        const permitExists = await Permit.findById(permitId);
        if (!permitExists) {
            return res.status(404).json({
                message: "Permit not found"
            });
        }

        // Check if route exists
        const routeExists = await Route.findById(routeId);
        if (!routeExists) {
            return res.status(404).json({
                message: "Route not found"
            });
        }

        // Create bus
        const bus = new Bus({
            busNumber,
            busName,
            model,
            numberPlate,
            seats: parseInt(seats),
            permitId,
            routeId
        });

        await bus.save();

        // Populate permit and route details
        const populatedBus = await Bus.findById(bus._id)
            .populate('permitId', 'permitId start destination')
            .populate('routeId', 'routeNumber routeName startLocation endLocation');

        res.status(201).json({
            message: "Bus added successfully",
            bus: populatedBus
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all buses
router.get("/", async (req, res) => {
    try {
        const buses = await Bus.find()
            .populate('permitId', 'permitId start destination')
            .populate('routeId', 'routeNumber routeName startLocation endLocation')
            .sort({ busNumber: 1 });

        res.json(buses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get bus by ID
router.get("/:id", async (req, res) => {
    try {
        const bus = await Bus.findById(req.params.id)
            .populate('permitId', 'permitId start destination')
            .populate('routeId', 'routeNumber routeName startLocation endLocation');

        if (!bus) {
            return res.status(404).json({ message: "Bus not found" });
        }

        res.json(bus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update bus details
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { busName, model, numberPlate, seats, permitId, routeId } = req.body;

        const updateData = { busName, model, numberPlate };
        
        if (seats) updateData.seats = parseInt(seats);
        if (permitId) updateData.permitId = permitId;
        if (routeId) updateData.routeId = routeId;

        const bus = await Bus.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )
        .populate('permitId', 'permitId start destination')
        .populate('routeId', 'routeNumber routeName startLocation endLocation');

        if (!bus) {
            return res.status(404).json({ message: "Bus not found" });
        }

        res.json({
            message: "Bus updated successfully",
            bus
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete bus
router.delete("/:id", async (req, res) => {
    try {
        const bus = await Bus.findByIdAndDelete(req.params.id);

        if (!bus) {
            return res.status(404).json({ message: "Bus not found" });
        }

        res.json({ message: "Bus deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
