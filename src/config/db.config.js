import mongoose from "mongoose";

export const dbConnect = () => {
    mongoose.connect(process.env.MONGODB_URI)
    .then(res => console.log(`DATABASE CONNECTED SUCCESSFULLY WITH ${res.connection.host}`))
    .catch(err => console.log(`DATABASE CONNECTION ERROR--->${err.message}`))
}