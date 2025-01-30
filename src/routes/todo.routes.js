import {Router} from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { addTodo } from "../controllers/todo.controller.js";

const router = Router();

router.route("/addTodo").post(verifyJwt,addTodo);

export default router;
