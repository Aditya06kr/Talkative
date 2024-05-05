import Message from "../models/Message.js";

const getMessages = async (req, res) => {
  const { userId } = req.params;
  const { ourUserId } = req.query;

  const messages = await Message.find({
    sender: { $in: [userId, ourUserId] },
    recipient: { $in: [userId, ourUserId] },
  }).sort({ createdAt: 1 });
  res.json(messages);
};

export default getMessages;
