import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import bcrypt from "bcrypt";

const registerUser = asyncHandler(async(req,res)=>{
    
    // Get Values from req.body
    const {username, fullname, email, password} = req.body;
    console.log(username,fullname,email,password);
    // Validation check values exist or not
        if([username, fullname, email, password].some(field => field.trim() === "")){
            throw new ApiError(401,"All Fields are required")        
        }
    // Check user already exist or not
    const userExist = await User.findOne({
        $or:[{username},{email}]
    })
    if(userExist){
        throw new ApiError(401,"user is already exist. Please create with new Username and email")
    }
    // Password encryption will be automatically we did on the modeling. We don't need to tackle it here
    // Upload Files
    const avatarLocalPath = req.files?.avatar[0].path;
    let coverImageLocalPath;
    if(req.files && req.files.coverImage && req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(401,"Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    // create User
    const user = await User.create({
        username,
        fullname,
        email,
        password,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
    })


    // Fetch user details
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if(!createdUser){
        throw new ApiError(401,"data not found into the database. Please create the User");
    }
    // Send Response
    return res
    .status(200)
    .json(
        new ApiResponse(201,createdUser,"User Created Successfully")
    )
})

const loginUser = asyncHandler(async(req,res)=>{
    // Algorithm
    // 1. Get username || email and Password Values
    const {username,email,password} = req.body;
    // Validation
    if(!username || !email){
        throw new ApiError(401,"Username or email is required");
    }
    // Check Values exist on the database
    const userExist = await User.findOne({
        $or:[{username},{email}]
    });
    if(!userExist){
        throw new ApiError(401,"Username or email does not exist. Please Register First");
    }
    // Password Matching
    const isPasswordCorrect = await bcrypt.compare(password,userExist.password);
    if(!isPasswordCorrect){
        throw new ApiError(401,"Password does not match. Please type the correct password");
    }
    // Generating Access and Refresh Token
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(userExist._id);
    const loginUser = await User.findById(userExist._id).select("-password -refreshToken");
    const options={
        httpOnly:true,
        secure:true,
    }
    // Send Response into cookies
    res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,{loginUser,accessToken,refreshToken},"User Login Successfully")
    )
})

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.createAccessToken();
        const refreshToken = await user.createRefreshToken();

        return {accessToken, refreshToken};
    } catch (error) {
        console.log("Find Error in generating tokens",error);
    }
}

const logoutUser = asyncHandler(async(req,res)=>{
    const user = req.user;

    const loggingoutUser = await User.findByIdAndUpdate(
        user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    ) 

    const options = {
        httpOnly:true,
        secure:true
    }
    
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(201,{},"User has been Logged Out Successfully")
    )

})


export {
    registerUser,
    loginUser,
    logoutUser
}