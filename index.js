import express from "express";
import dotenv from 'dotenv';
import connectDB from "./database/dbConnect.js";
import userRoute from "./routes/user.route.js"
import courseRoute from "./routes/course.route.js"
import mediaRoute from "./routes/media.route.js"
import cookieParser from "cookie-parser";
import cors from 'cors'

dotenv.config({})

//Call the DB connection
connectDB();

const app = express();

const PORT = process.env.PORT || 3000;

// default middlewares
app.use(express.json())
app.use(cookieParser());  // We use cookie parser to parse the cookie
app.use(cors({
    origin:"http://localhost:5173", //This is FE URL
    credentials:true
}))


// Apis
// http://localhost:8080/api/v1/user/register
app.use("/api/v1/user", userRoute)
app.use("/api/v1/course",courseRoute)
app.use("/api/v1/media", mediaRoute)

app.listen(PORT, ()=>{
    console.log(`Server is listening at PORT ${PORT}`)
})