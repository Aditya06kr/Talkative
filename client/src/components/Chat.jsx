import React, { useContext, useEffect, useState } from "react";
import Avatar from "./Avatar";
import { UserContext } from "../UserContext";
import Logo from "./Logo";

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState([]);
  const [userId, setUserId] = useState(null);
  const { userInfo } = useContext(UserContext);
  const [message, setMessage] = useState();
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4040");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
  }, []);

  function showOnlinePeople(data) {
    const people = {};
    data.forEach((item) => {
      people[item.id] = item.username;
    });
    delete people[userInfo.id];
    setOnlinePeople(people);
  }

  function handleMessage(e) {
    const messageData = JSON.parse(e.data);
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    }
    else if("message" in messageData){
      console.log(messageData);
    }
  }

  function sendMessage(e) {
    e.preventDefault();
    ws.send(
      JSON.stringify({
        recipient: userId,
        text: message,
      })
    );
  }

  return (
    <div className="flex h-screen">
      <div className="bg-pink-200 w-1/3 py-4">
        <Logo />
        {Object.keys(onlinePeople).map((id) => (
          <div
            key={id}
            onClick={() => setUserId(id)}
            className={
              "border-b-2 border-pink-300 flex items-center gap-2 cursor-pointer " +
              (userId === id ? "bg-pink-300" : "bg-pink-200")
            }
          >
            {userId === id && (
              <div className="bg-pink-600 w-1 h-12 rounded-r-md"></div>
            )}
            <div className="flex items-center gap-2 py-2 pl-4">
              <Avatar username={onlinePeople[id]} id={id} />
              <span>{onlinePeople[id]}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-pink-300 w-2/3 p-2 flex flex-col-reverse">
        {!userId && (
          <div className="m-auto text-slate-400 text-2xl">
            &larr; Start a Conversation
          </div>
        )}
        {userId && (
          <form className="flex gap-2" onSubmit={sendMessage}>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              type="text"
              placeholder="Type a Message"
              className="p-2 flex-grow rounded-sm"
            />
            <button
              type="submit"
              className="bg-pink-500 text-white p-2 rounded-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Chat;
