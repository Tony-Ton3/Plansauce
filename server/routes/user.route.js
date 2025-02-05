import express from "express";
import {
  signout,
} from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/signout", signout);

export default router;
