import Message from "../models/Message.js";

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

export default editMessage;
