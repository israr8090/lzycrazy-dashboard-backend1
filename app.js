import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import dbConnection from "./dataBase/dbConnection.js";
import { errorMiddleware } from "./middlewares/error.js";
import userRouter from "./router/userRoutes.js";
import produtRoute from "./router/ProductRoute.js";
import testimonialsRoute from "./router/TestimonialsRoute.js";
import morgan from "morgan";

const app = express();

dotenv.config({ path: "./config/config.env" }); //--

dbConnection(); //--
//--
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, process.env.DESHBOARD_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(cookieParser()); //--for accessing cokkies--
app.use(express.json()); //--
app.use(express.urlencoded({ extended: true })); //--

//--
// app.use(
//   fileUpload({
//     useTempFiles: true,
//     tempFileDir: "/tmp/", //--
//   })
// );

//--

app.use("/api/v1/user", userRouter); //-- user route
app.use("/api/v1/products", produtRoute);
app.use("/api/v1/testimonials", testimonialsRoute);

app.use(errorMiddleware); //--

export default app;
