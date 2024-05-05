import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const secret = process.env.SECRET;

const getProfile = async (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, secret, {}, (err, info) => {
      if (err) throw err;
      res.json(info);
    });
  } else {
    res.json(null);
  }
};

export default getProfile;
