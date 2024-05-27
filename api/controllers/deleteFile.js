import Message from "../models/Message.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";

const deleteFile = async (req, res) => {
  try {
    const { deleteId } = req.params;
    const url=req.query.url;

    try{
        const res=await deleteFromCloudinary(url);
        console.log(res);
    }
    catch(error){
        console.log("Error from Cloudinary Side :- ",error);
    }

    const updatedMessage = await Message.deleteOne({ _id: deleteId });
    if (updatedMessage) {
      res
        .status(200)
        .json({ success: true, message: "File deleted successfully" });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Failed to delete file" });
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete file" });
  }
};

export default deleteFile;
