require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");
const Message = require("./models/Message");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const ws = require("ws");

const mongoUrl = process.env.MONGO_URL;
const secret = "asjdfn238rn43gi4b40gn3";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_KEY,
  })
);

mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log("DB Connected");
  })
  .catch((e) => {
    console.log("Error in Connecting DB " + e);
  });

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (username.length < 6) {
    res.json("Minimum length should be 6");
  } else if (password.length == 0) {
    res.json("Password should not be empty");
  } else {
    const existedUser = await User.findOne({ username });
    if (existedUser) {
      res.json("Username Already Existed");
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
});

app.post("/login", async (req, res) => {
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
});

app.get("/profile", (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, secret, {}, (err, info) => {
      if (err) throw err;
      res.json(info);
    });
  } else {
    res.json(null);
  }
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json("ok");
});

app.get("/messages/:userId", async (req, res) => {
  const { userId } = req.params;
  const { ourUserId } = req.query;

  const messages = await Message.find({
    sender: { $in: [userId, ourUserId] },
    recipient: { $in: [userId, ourUserId] },
  }).sort({ createdAt: 1 });
  res.json(messages);
});

app.get("/people", async (req, res) => {
  const { ourUserId } = req.query;
  const users = await User.find({}, { _id: 1, username: 1 });

  const usersArray = await Promise.all(
    users.map(async (user) => {
      const additionalData = await Message.findOne(
        {
          sender: { $in: [user._id, ourUserId] },
          recipient: { $in: [user._id, ourUserId] },
        },
        { updatedAt: 1,_id:0 }
      ).sort({ updatedAt: -1 });

      return {
        ...user.toObject(),
        updatedAt: (additionalData?.updatedAt ? additionalData?.updatedAt : null),
        isOnline:false,
      };
    })
  );

  // console.log(usersArray);
  res.json(usersArray);
});

const server = app.listen(process.env.API_PORT);

const wss = new ws.WebSocketServer({ server });
wss.on("connection", (connection, req) => {
  function notifyAboutOnlinePeople() {
    [...wss.clients].forEach((client) => {
      const onlineUsers = [...wss.clients].map((c) => ({
        id: c.id,
        username: c.username,
      }));
      client.send(JSON.stringify({ online: onlineUsers }));
    });
  }

  connection.isAlive = true;

  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyAboutOnlinePeople();
    }, 1000);
  }, 5000);

  connection.on("pong", () => {
    clearTimeout(connection.deathTimer);
  });

  const cookies = req.headers.cookie;
  if (cookies) {
    const cookieArray = cookies.split(";");
    cookieArray.forEach((cookie) => {
      const token = cookie.trim().split("=")[1];
      if (token) {
        jwt.verify(token, secret, {}, (err, info) => {
          if (err) throw err;
          const { username, id } = info;
          connection.username = username;
          connection.id = id;
        });
      }
    });
  }

  connection.on("message", async (message) => {
    const messageString = JSON.parse(message.toString());
    const { recipient, text } = messageString;
    if (recipient && text) {
      const messageDoc = await Message.create({
        sender: connection.id,
        recipient,
        text,
      });
      [...wss.clients]
        .filter((user) => user.id === recipient || user.id === connection.id)
        .forEach((c) =>
          c.send(
            JSON.stringify({
              text,
              sender: connection.id,
              recipient,
              _id: messageDoc._id,
            })
          )
        );
    }
  });

  notifyAboutOnlinePeople();
});
