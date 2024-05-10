import Message from "../models/Message.js";

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

export default deleteMessage;
