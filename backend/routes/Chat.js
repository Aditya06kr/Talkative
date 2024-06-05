import { Router } from "express";
import { upload } from "../middlewares/multer.js";
import { getMessages, getPeople } from "../controllers/chatController.js";
import {
  editFile,
  editMessage,
  deleteFile,
  deleteMessage,
  uploadFile,
} from "../controllers/messageController.js";

const router = Router();

router.route("/messages/:userId").get(getMessages);
router.route("/people").get(getPeople);
router.post("/uploads", upload.single("file"), uploadFile);
router.route("/editMessage/:editId").put(editMessage);
router.route("/deleteMessage/:deleteId").delete(deleteMessage);
router.route("/deleteFile/:deleteId").delete(deleteFile);
router.route("/editFile/:editId").put(editFile);

export default router;
