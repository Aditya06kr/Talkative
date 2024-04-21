import React, { useContext, useEffect, useState, useRef } from "react";
import Avatar from "./Avatar";
import { UserContext } from "../UserContext";
import Logo from "./Logo";
import { uniqBy } from "lodash";
import axios from "axios";

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState([]);
  const [selectedUserId, setselectedUserId] = useState(null);
  const { userInfo } = useContext(UserContext);
  const [message, setMessage] = useState();
  const [conversation, setConversation] = useState([]);
  const messagesEndRef = useRef(null);
  useEffect(() => {
    connectToWs();
  }, []);

  function connectToWs() {
    const ws = new WebSocket("ws://localhost:4040");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("close", () => {
      setTimeout(() => {
        connectToWs();
      }, 1000);
    });
  }

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
    } else if ("text" in messageData) {
      setConversation((prev) => [...prev, { ...messageData }]);
    }
  }

  function sendMessage(e) {
    e.preventDefault();
    ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: message,
      })
    );
    setConversation((prev) => [
      ...prev,
      {
        text: message,
        sender: userInfo.id,
        recipient: selectedUserId,
        id: Date.now(),
      },
    ]);
    setMessage("");
  }

  const UniqueMessages = uniqBy(conversation, "id");

  useEffect(() => {
    const div = messagesEndRef.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [conversation]);

  useEffect(() => {
    if (selectedUserId) {
      axios.get("/messages/" + selectedUserId, {
        params: {
          ourUserId: userInfo.id,
        },
      });
    }
  }, [selectedUserId]);

  return (
    <div className="flex h-screen">
      <div className="bg-pink-200 w-1/3 py-4">
        <Logo />
        {Object.keys(onlinePeople).map((id) => (
          <div
            key={id}
            onClick={() => setselectedUserId(id)}
            className={
              "border-b-2 border-pink-300 flex items-center gap-2 cursor-pointer " +
              (selectedUserId === id ? "bg-pink-300" : "bg-pink-200")
            }
          >
            {selectedUserId === id && (
              <div className="bg-pink-600 w-1 h-12 rounded-r-md"></div>
            )}
            <div className="flex items-center gap-2 py-2 pl-4">
              <Avatar username={onlinePeople[id]} id={id} />
              <span>{onlinePeople[id]}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-pink-300 w-2/3 p-2 flex flex-col justify-end">
        {!selectedUserId && (
          <div className="m-auto text-slate-400 text-2xl">
            &larr; Start a Conversation
          </div>
        )}
        {selectedUserId && (
          <>
            <div className="overflow-y-scroll">
              {UniqueMessages.map((msg) => (
                <div className="w-full" style={{ clear: "both" }}>
                  <div
                    className={
                      "w-fit p-1 px-3 m-2 rounded-lg " +
                      (userInfo.id === msg.sender
                        ? "bg-pink-200 float-right"
                        : "bg-pink-600 float-left")
                    }
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef}></div>
            </div>
            <form className="flex gap-2 mt-3" onSubmit={sendMessage}>
              <input
                value={message}
                s
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
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
