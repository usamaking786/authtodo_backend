import {v2 as cloudinary} from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadOnCloudinary = async (localFilePath) => {
    try {
    const response = await cloudinary.uploader.upload(localFilePath);
    return response;
    } catch (error) {
    fs.unlinkSync(localFilePath);
    console.log(error);      
    }
}