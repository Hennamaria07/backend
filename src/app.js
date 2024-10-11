import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = new express();

app.use(cors({
    origin: true,
    credentials: true,
    methods: ["GET", "HEAD", "OPTIONS", "POST", "DELETE", "PUT", "PATCH"],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());


export default app