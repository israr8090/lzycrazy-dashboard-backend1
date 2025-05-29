import { userModel } from "../models/userSchema.js";
import { catchAsyncErrors } from './catchAsyncErrors.js';
import ErrorHandler from "./error.js";
import jwt from 'jsonwebtoken';

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    const {token} = req.cookies;

    if(!token) {
        return next(new ErrorHandler('User is not authenticated!', 400));
    }

    let decoded = null;
    try {
        decoded= jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return next(new ErrorHandler('Invalid Token!', 401));
    }

    req.user = await userModel.findById(decoded.id);
    next();
    
});