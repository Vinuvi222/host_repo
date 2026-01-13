import mongoose from "mongoose";

const routeSchema = new mongoose.Schema(
  {
    routeNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    startLocation: {
      type: String,
      required: true
    },

    endLocation: {
      type: String,
      required: true
    },

    stops: [
      {
        type: String,
        trim: true
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Route", routeSchema);