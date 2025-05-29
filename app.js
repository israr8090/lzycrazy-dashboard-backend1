import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import dbConnection from './dataBase/dbConnection.js';
import { errorMiddleware } from './middlewares/error.js';

import userRouter from './router/userRoutes.js';


const app = express();

dotenv.config({ path: "./config/config.env" });  //--

//--
app.use(cors({
    origin: [process.env.FRONTEND_URL, process.env.DESHBOARD_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));


app.use(cookieParser());  //--for accessing cokkies--
app.use(express.json());  //--
app.use(express.urlencoded({ extended: true }));  //--

//--
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'  //--
}));

//--
app.use("/api/v1/user", userRouter);  //-- user route


dbConnection();  //--
app.use(errorMiddleware); //--



export default app;