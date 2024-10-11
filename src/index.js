import app from "./app.js";
import dotenv from "dotenv";
import { dbConnect } from "./config/db.config.js";

dotenv.config({path: "./.env"});
dbConnect();

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`server is up on port ${port}`)
})