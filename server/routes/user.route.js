import express from "express";
import {
  test,
  signout,
  getstack,
  getallsavedstacks,
  deletesavedstack,
  updateUserBackground,
  deleteUser,
} from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/test", test);
router.get("/signout", signout);
router.get("/getstack", verifyToken, getstack);
router.get("/savedstacks", verifyToken, getallsavedstacks);
router.delete("/savedstacks/:stackId", verifyToken, deletesavedstack);
router.put("/update", verifyToken, updateUserBackground);
router.delete("/delete", verifyToken, deleteUser);

export default router;