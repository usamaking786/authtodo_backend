import mongoose from "mongoose";

import { DB_NAME } from "../constant.js";

const dbConnect = async () => {
    try {
        const conn = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("MongoDB Connected: ", conn.connection.host);
    } catch (error) {
     console.log("MongoDB Connection ERROR: ", error);
     process.exist(1);  
    }
}
export default dbConnect;