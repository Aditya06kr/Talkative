import { Router } from "express";
import getPeople from "../controllers/getPeople.js";
import getMessages from "../controllers/getMessages.js";
import uploadFile from "../controllers/uploadFile.js";
import {upload} from "../middlewares/multer.js"
import editMessage from "../controllers/editMessage.js";
import deleteMessage from "../controllers/deleteMessage.js";
import editFile from "../controllers/editFile.js";
import deleteFile from "../controllers/deleteFile.js";

const router = Router();

router.route("/messages/:userId").get(getMessages);
router.route("/people").get(getPeople);
router.post("/uploads",upload.single('file'),uploadFile);
router.route("/editMessage/:editId").put(editMessage);
router.route("/deleteMessage/:deleteId").delete(deleteMessage);
router.route("/deleteFile/:deleteId").delete(deleteFile);
router.route("/editFile/:editId").put(editFile);

export default router;