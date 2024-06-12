import { Router } from "express";
import { RegisterUser,LoginUser,Logout,getProfile } from "../controllers/userController.js";

const router = Router();

router.route("/register").post(RegisterUser);
router.route("/login").post(LoginUser);
router.route("/profile").get(getProfile);
router.route("/logout").post(Logout);

export default router;
