import Message from "../models/Message.js";

const editFile = async (req, res) => {
  try {
    const { url, name } = req.body;
    const { editId } = req.params;
    console.log(url,name);
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
    res
      .status(500)
      .json({ success: false, message: "Failed to update file" });
  }
};

export default editFile;
