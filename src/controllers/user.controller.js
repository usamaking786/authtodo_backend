import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async(req,res)=>{
    const {username,email,password} = req.body;

    res.status(200).json(
        new ApiResponse(200,{
            username, email, password
        },'User Registered Successfully')
    )
})


export {
    registerUser
}