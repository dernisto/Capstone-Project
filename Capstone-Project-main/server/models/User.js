import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
const SALT_ROUNDS = 10;
const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: false }
);
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
    next();
  } catch (err) {
    next(err);
  }
});
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
const User = mongoose.models.User ?? mongoose.model("User", userSchema);
export {
  User
};
