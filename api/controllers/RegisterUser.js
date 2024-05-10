import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

const secret = process.env.SECRET;

const RegisterUser = async (req, res) => {
  const { username, password } = req.body;
  if (username.length < 6) {
    res.json("Username Length should be atleast 6");
  } else if (password.length == 0) {
    res.json("Password is required");
  } else {
    const existedUser = await User.findOne({ username });
    if (existedUser) {
      res.json("Username Already Exist");
    } else {
      try {
        const createdUser = await User.create({
          username,
          password,
        });
        jwt.sign(
          { username, id: createdUser._id },
          secret,
          {},
          (err, token) => {
            if (err) throw err;
            res.cookie("token", token).status(201).json({
              username,
              id: createdUser._id,
            });
          }
        );
      } catch (err) {
        console.error("Error in registration:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
};

export default RegisterUser;
