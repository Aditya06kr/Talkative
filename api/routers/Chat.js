import { Router } from "express";
import getPeople from "../controllers/getPeople.js";
import getMessages from "../controllers/getMessages.js";

const router = Router();

router.route("/messages/:userId").get(getMessages);
router.route("/people").get(getPeople);

export default router;