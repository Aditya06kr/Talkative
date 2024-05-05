import { Router } from "express";
import RegisterUser from "../controllers/RegisterUser.js";
import LoginUser from "../controllers/LoginUser.js";
import getProfile from "../controllers/getProfile.js";
import Logout from "../controllers/Logout.js";

const router = Router();

router.route("/register").post(RegisterUser);
router.route("/login").post(LoginUser);
router.route("/profile").get(getProfile);
router.route("/logout").post(Logout);

export default router;
