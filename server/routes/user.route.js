import express from "express";
import {
  test,
  signout,
  getstack,
  getallsavedstacks,
  deletesavedstack,
  updateUserBackground,
  setBackground,
} from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/test", test);
router.post("/signout", signout);
router.get("/getstack", verifyToken, getstack);
router.get("/getallsavedstacks", verifyToken, getallsavedstacks);
router.delete("/deletesavedstack/:stackId", verifyToken, deletesavedstack);
router.put("/update", verifyToken, updateUserBackground);
router.patch("/setbackground", verifyToken, setBackground);

export default router;