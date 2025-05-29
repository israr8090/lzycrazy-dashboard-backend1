import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dbConnection from './dataBase/dbConnection.js';
import { errorMiddleware } from './middlewares/error.js';

import userRoutes from './router/userRoutes.js';
import footerRoutes from './router/footerRoutes.js';


const app = express();

dotenv.config({ path: "./config/config.env" });  //--

//--
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', process.env.FRONTEND_URL, process.env.DESHBOARD_URL].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
    exposedHeaders: ['Authorization'],
    maxAge: 600
}));


app.use(cookieParser());  //--for accessing cokkies--
app.use(express.json());  //--
app.use(express.urlencoded({ extended: true }));  //--

// File upload handling is now done in individual routes using multer

//--
app.use("/api/users", userRoutes);
app.use("/api/footer", footerRoutes);

dbConnection();  //--
app.use(errorMiddleware); //--



export default app;