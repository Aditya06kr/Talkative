import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

const secret=process.env.SECRET;

const LoginUser = async(req,res)=>{
    const { username, password } = req.body;
  try {
    const foundUser = await User.findOne({ username });
    if (foundUser) {
      const passOk = bcrypt.compareSync(password, foundUser.password);
      if (passOk) {
        jwt.sign({ username, id: foundUser._id }, secret, {}, (err, token) => {
          if (err) throw err;
          res.cookie("token", token).status(201).json({
            username,
            id: foundUser._id,
          });
        });
      } else {
        res.json("Wrong Credentials");
      }
    } else {
      res.json("First Register Yourself");
    }
  } catch (err) {
    throw err;
  }
};

export default LoginUser;