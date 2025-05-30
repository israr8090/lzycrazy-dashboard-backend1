



import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
// import fileUpload from 'express-fileupload';
import dbConnection from "./dataBase/dbConnection.js";
import { errorMiddleware } from "./middlewares/error.js";

import userRoutes from "./router/userRoutes.js";
import headerRoutes from "./router/headerRoutes.js";
import appointmentRoutes from "./router/appointmentRoutes.js";
import footerRoutes from './router/footerRoutes.js';


const app = express();

dotenv.config({ path: "./config/config.env" }); //--

//--



app.use(
  cors({
    origin: [process.env.FRONTEND_URL, process.env.DESHBOARD_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);


app.use(cookieParser()); //--for accessing cokkies--
app.use(express.json()); //--
app.use(express.urlencoded({ extended: true })); //--


// File upload handling is now done in individual routes using multer

//--



//--
// app.use(fileUpload({
// useTempFiles: true,
// tempFileDir: '/temp/'  //--
// }));

//--
app.use("/api/users", userRoutes);
app.use("/api/header", headerRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/footer", footerRoutes);


dbConnection(); //--
app.use(errorMiddleware); //--

export default app;
