import { Router } from "express";
import getPeople from "../controllers/getPeople.js";
import getMessages from "../controllers/getMessages.js";
import uploadFile from "../controllers/uploadFile.js";
import {upload} from "../middlewares/multer.js"

const router = Router();

router.route("/messages/:userId").get(getMessages);
router.route("/people").get(getPeople);
router.post("/uploads",upload.single('file'),uploadFile);

export default router;