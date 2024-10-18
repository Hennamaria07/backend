import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import staffRoutes from "./routes/staff.routes.js";
import librarianRoutes from "./routes/librarian.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import studentRoutes from "./routes/student.routes.js";
import feesHistoryRoutes from "./routes/feeHistroy.routes.js";
import LibraryHistoryRoutes from "./routes/libraryHistrory.routes.js";

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

app.use('/api/v1/staff', staffRoutes)
app.use('/api/v1/librarian', librarianRoutes)
app.use('/api/v1/admin', adminRoutes)
app.use('/api/v1/student', studentRoutes)
app.use('/api/v1/fees-history', feesHistoryRoutes)
app.use('/api/v1/library-history', LibraryHistoryRoutes)


export default app