import Message from "../models/Message.js";
import User from "../models/User.js";

const getMessages = async (req, res) => {
  const { userId } = req.params;
  const { ourUserId } = req.query;

  const messages = await Message.find({
    sender: { $in: [userId, ourUserId] },
    recipient: { $in: [userId, ourUserId] },
  }).sort({ createdAt: 1 });
  res.json(messages);
};

const getPeople = async (req, res) => {
  const { ourUserId } = req.query;
  const users = await User.find({}, { _id: 1, username: 1 });

  const usersArray = await Promise.all(
    users.map(async (user) => {
      const additionalData = await Message.findOne(
        {
          sender: { $in: [user._id, ourUserId] },
          recipient: { $in: [user._id, ourUserId] },
        },
        { createdAt: 1, _id: 0 }
      ).sort({ createdAt: -1 });

      return {
        ...user.toObject(),
        createdAt: additionalData?.createdAt ? additionalData?.createdAt : null,
        isOnline: false,
      };
    })
  );

  res.json(usersArray);
};

export { getMessages, getPeople };
