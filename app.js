import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
// import fileUpload from 'express-fileupload';
import dbConnection from "./dataBase/dbConnection.js";
import { errorMiddleware } from "./middlewares/error.js";

import userRoutes from "./router/userRoutes.js";
import blogRoutes from "./router/blogRoutes.js";
import aboutUsRoutes from "./router/aboutUsRoutes.js";
import headerRoutes from "./router/headerRoutes.js";
import appointmentRoutes from "./router/appointmentRoutes.js";
import footerRoutes from "./router/footerRoutes.js";
import produtRoute from "./router/ProductRoute.js";
import testimonialsRoute from "./router/TestimonialsRoute.js";
import bannerRoutes from "./router/bannerRoutes.js";

const app = express();

dotenv.config({ path: "./config/config.env" }); //--

//--

app.use(cors({
    origin: [process.env.FRONTEND_URL, process.env.DASHBOARD_URL],
    methods:["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));


app.use(cookieParser()); //--for accessing cokkies--
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));-
app.use(express.urlencoded({ extended: true })); //--

// File upload handling is now done in individual routes using multer

//--

//--
app.use("/api/users", userRoutes);
app.use("/api/header", headerRoutes);
app.use("/api/banner", bannerRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/about", aboutUsRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/footer", footerRoutes);
app.use("/api/v1/products", produtRoute);
app.use("/api/v1/testimonials", testimonialsRoute);

dbConnection(); //--
app.use(errorMiddleware); //--

export default app;
