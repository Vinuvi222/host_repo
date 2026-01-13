import mongoose from "mongoose";
import bcrypt from "bcrypt";

const driverSchema = mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone_num: { type: String },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// Hash password before saving
driverSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});



// Compare password method
driverSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("Driver", driverSchema);
