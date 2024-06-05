import Message from "../models/Message.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const uploadFile = async (req, res) => {
  const filePath = req.file?.path;
  const prevFile = req.body.prevFile;

  // Check whether the file exist or not and Delete if exist
  if (prevFile !== "null") {
    try {
      await deleteFromCloudinary(prevFile);
    } catch (err) {
      console.log(err);
    }
  }

  // Upload on Cloudinary
  if (filePath) {
    const fileUploaded = await uploadOnCloudinary(filePath);
    res.json({ url: fileUploaded.url, name: fileUploaded.original_filename });
  } else {
    console.log("File haven't uploaded locally\n");
  }
};

const editFile = async (req, res) => {
  try {
    const { url, name } = req.body;
    const { editId } = req.params;
    const updatedFile = await Message.updateOne(
      { _id: editId },
      { $set: { name, url } }
    );
    if (updatedFile) {
      res
        .status(200)
        .json({ success: true, message: "File updated successfully" });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Failed to update file" });
    }
  } catch (error) {
    console.error("Error updating file:", error);
    res.status(500).json({ success: false, message: "Failed to update file" });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { deleteId } = req.params;
    const url = req.query.url;

    try {
      const res = await deleteFromCloudinary(url);
      console.log(res);
    } catch (error) {
      console.log("Error from Cloudinary Side :- ", error);
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
    res.status(500).json({ success: false, message: "Failed to delete file" });
  }
};

const editMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { editId } = req.params;

    const updatedMessage = await Message.updateOne(
      { _id: editId },
      { $set: { text: message } }
    );
    if (updatedMessage) {
      res
        .status(200)
        .json({ success: true, message: "Message updated successfully" });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Failed to update message" });
    }
  } catch (error) {
    console.error("Error updating message:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update message" });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { deleteId } = req.params;

    const updatedMessage = await Message.deleteOne({ _id: deleteId });
    if (updatedMessage) {
      res
        .status(200)
        .json({ success: true, message: "Message deleted successfully" });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Failed to delete message" });
    }
  } catch (error) {
    console.error("Error deleting message:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete message" });
  }
};

export {uploadFile, editFile, deleteFile, editMessage, deleteMessage };
