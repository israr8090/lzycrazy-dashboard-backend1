import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Full Name required"],
    minlength: [4, "Full Name must contain at least 2 characters"],
  },
  email: {
    type: String,
    required: [true, "Email required"],
  },
  phone: {
    type: String,
    required: [true, "Phone Number required"],
  },

  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must contain at least 8 characters"],
    select: false, //--for getting user password
  },
  role: {
    type: String,
  },
});

//--for hashing password--
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); //--

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  // next();
});

//--for comparing password--
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//--for generating json web token--
userSchema.methods.generateJsonWebToken = function () {
  const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
  return token;
};

//--Generating Reset Password Token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; //--15 minutes
  return resetToken;
};

export const userModel = mongoose.model("User", userSchema);
