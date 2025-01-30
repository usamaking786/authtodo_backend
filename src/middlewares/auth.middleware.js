import {User} from "../models/user.models.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

export const verifyJwt = asyncHandler(async(req,res,next)=>{
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");

    if(!token){
        throw new ApiError(401,"Unauthorized request or token not found");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if(!decodedToken){
        throw new ApiError(401,"Token has not been matched with security key")
    }

    const user = await User.findById(decodedToken._id).select("-password -refreshToken");
    if(!user){
        throw new ApiError(401,"Invalid access token or user not found from decoded access token");
    }

    req.user = user;
    next();

})