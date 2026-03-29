import { Router } from "express";
import {
  register,
  login,
  authMiddleware,
  me
} from "../controllers/authController.js";
const router = Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, me);
var stdin_default = router;
export {
  stdin_default as default
};
