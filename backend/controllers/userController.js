import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
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
          { expiresIn: process.env.EXPIRY },
          (err, token) => {
            if (err) throw err;
            res
              .cookie("token", token, { httpOnly: true, secure: true })
              .status(201)
              .json({
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

const LoginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const foundUser = await User.findOne({ username });
    if (foundUser) {
      const passOk = bcrypt.compareSync(password, foundUser.password);
      if (passOk) {
        jwt.sign(
          { username, id: foundUser._id },
          secret,
          { expiresIn: process.env.EXPIRY },
          (err, token) => {
            if (err) throw err;
            res
              .cookie("token", token, { httpOnly: true, secure: true })
              .status(201)
              .json({
                username,
                id: foundUser._id,
              });
          }
        );
      } else {
        res.json("Wrong Credentials");
      }
    } else if (username.length === 0 || password.length === 0) {
      res.json("Empty Fields");
    } else {
      res.json("First Register Yourself");
    }
  } catch (err) {
    throw err;
  }
};

const Logout = async (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: true,
    })
    .json("ok");
};

const getProfile = async (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, secret, {}, (err, info) => {
      if (err && err.name === "TokenExpiredError") {
        return res
          .status(401)
          .clearCookie(
            "token",
            {
              httpOnly: true,
              secure: true,
            },
            { expires: new Date(0) }
          )
          .json("Token expired and deleted");
      }
      if (err) throw err;
      res.json(info);
    });
  } else {
    res.json(null);
  }
};

export { RegisterUser, LoginUser, Logout, getProfile };
