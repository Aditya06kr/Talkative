import express from "express";
import Message from "./models/Message.js";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { WebSocketServer } from "ws";
import connectDb from "./db/index.js";

const secret = process.env.SECRET;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_KEY,
  })
);

// Connect DataBase
try {
  connectDb();
} catch (err) {
  console.log("Error in connecting to MongoDB:");
}

// User components
import userRouter from "./routes/Authentication.js";
app.use("/api/v1/user", userRouter);

// Chat components
import chatRouter from "./routes/Chat.js";
app.use("/api/v1/chat", chatRouter);

app.get("/api/v1/ping", (req, res) => {
  res.json("pong");
});

// Web Socket Logic
try {
  const server = app.listen(process.env.PORT);
  const wss = new WebSocketServer({ server });
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
      if (messageString.type === "notification") {
        notifyAboutOnlinePeople();
      } else {
        const { recipient, text, url, name } = messageString;
        if (recipient && (text || url)) {
          const messageDoc = await Message.create({
            sender: connection.id,
            recipient,
            text,
            url,
            name,
          });
          [...wss.clients]
            .filter(
              (user) => user.id === recipient || user.id === connection.id
            )
            .forEach((c) =>
              c.send(
                JSON.stringify({
                  text,
                  url,
                  name,
                  sender: connection.id,
                  recipient,
                  _id: messageDoc._id,
                })
              )
            );
        }
      }
    });

    notifyAboutOnlinePeople();
  });
} catch (err) {
  console.error("Error starting WebSocket server:", err);
}
