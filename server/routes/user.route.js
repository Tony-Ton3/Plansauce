import express from "express";
import {
  signout,
  getstack,
  getallsavedstacks,
  deletesavedstack,
} from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/signout", signout);
router.get("/getstack", verifyToken, getstack);
router.get("/getallsavedstacks", verifyToken, getallsavedstacks);
router.delete("/deletesavedstack/:stackId", verifyToken, deletesavedstack);

export default router;