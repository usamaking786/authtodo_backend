import {Todo} from "../models/todo.models.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";


const addTodo = asyncHandler(async(req,res)=>{
    const {text,completed} = req.body;

    if(!text){
        throw new ApiError(401,"Text is required");
    }

    const todo = await Todo.create({
        text,
        completed
    });

    return res
    .status(201)
    .json(
        new ApiResponse(200,todo,"Todo Created Successfully")
    )

})


export {
    addTodo
}