import express from 'express';
import {
    rgisterUser,
    loginUser,
    logoutUser,
    getUser,
    updateUser,
    updatePassword,   
    forgotPassword,
    resetPassword
} from '../controllers/userController.js';
import { isAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

// Define routes here
router.post('/register', rgisterUser);  //--Register a new User
router.post('/login', loginUser);  //--User Login
router.get('/logout', isAuthenticated, logoutUser);  //--User Logout
router.get('/me', isAuthenticated, getUser);  //--Get User
router.put('/update/me', isAuthenticated, updateUser);  //--User Update
router.put('/update/password', isAuthenticated, updatePassword);  //--User Update
router.post('/password/forgot', forgotPassword);  //--forgot password 
router.put('/password/reset/:token', resetPassword);  //--Reset password 

export default router;