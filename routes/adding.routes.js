import express from "express";
import Route from "../models/routemodel.js";  

const router = express.Router();

// Add a new route
router.post("/add", async (req, res) => {
  try {
    const { routeNumber, routeName, wayPoints } = req.body;

    const route = new Route({
      routeNumber,
      routeName,
      wayPoints
    });

    await route.save();
    res.status(201).json(route);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//  Get all routes
router.get("/", async (req, res) => {
  try {
    const routes = await Route.find();
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
