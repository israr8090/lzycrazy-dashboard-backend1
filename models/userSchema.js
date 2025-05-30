import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full Name is required'],
        minlength: [4, 'Full Name must contain at least 4 characters'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address'],
        lowercase: true,
    },
    phone: {
        type: String,       
        match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must contain at least 8 characters'],
        select: false,
    },
    role: {
        type: String,
        required: [true, 'Role is required'],
        enum: ['user', 'admin', 'superAdmin'],
        default: 'user',
    },
    image: {
        type: String,            // image file name or URL
        default: "",             // default empty
    },
    resetPasswordToken: {
        type: String,
        select: false,
    },
    resetPasswordExpire: {
        type: Date,
        select: false,
    },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT
userSchema.methods.generateJsonWebToken = function () {
    return jwt.sign(
        { id: this._id, role: this.role, email: this.email },
        process.env.JWT_SECRET || 'defaultSecret',
        { expiresIn: process.env.JWT_EXPIRES || '7d' }
    );
};

// Generate Reset Password Token
userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
};

export const userModel = mongoose.model("User", userSchema);
