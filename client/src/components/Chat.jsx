import React, { useContext, useEffect, useState, useRef } from "react";
import { UserContext } from "../UserContext";
import Logo from "./Logo";
import { uniqBy } from "lodash";
import axios from "axios";
import Contacts from "./Contacts";
import "../App.css";
import {toast} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [offlinePeople, setOfflinePeople] = useState({});
  const [selectedUserId, setselectedUserId] = useState(null);
  const { userInfo, setUserInfo } = useContext(UserContext);
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
    if (message) {
      setConversation((prev) => [
        ...prev,
        {
          text: message,
          sender: userInfo.id,
          recipient: selectedUserId,
          _id: Date.now(),
        },
      ]);
    }
    setMessage("");
  }

  useEffect(() => {
    const div = messagesEndRef.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [conversation]);

  useEffect(() => {
    if (selectedUserId) {
      axios
        .get("/messages/" + selectedUserId, {
          params: {
            ourUserId: userInfo.id,
          },
        })
        .then((res) => {
          setConversation(res.data);
        });
    }
  }, [selectedUserId]);

  useEffect(() => {
    axios.get("/people").then((res) => {
      const offlineUsersArr = res.data
        .filter((p) => p._id !== userInfo.id)
        .filter((p) => !Object.keys(onlinePeople).includes(p._id));

      const offlineUsers = {};
      offlineUsersArr.forEach((user) => {
        offlineUsers[user._id] = user.username;
      });
      setOfflinePeople(offlineUsers);
    });
  }, [onlinePeople]);

  function LogOut(){
    axios.get("/logout")
    .then(()=>{
      setUserInfo(null);
      toast.success("Logout Successfully");
    })
  }

  const UniqueMessages = uniqBy(conversation, "_id");

  return (
    <div className="flex h-screen">
      <div className="bg-pink-200 w-1/3 py-4 flex flex-col justify-between">
        <div className="overflow-auto mb-4">
          <Logo />
          {Object.keys(onlinePeople).map((id) => (
            <Contacts
              id={id}
              selectedUserId={selectedUserId}
              setselectedUserId={setselectedUserId}
              userName={onlinePeople[id]}
              online={true}
            />
          ))}
          {Object.keys(offlinePeople).map((id) => (
            <Contacts
              id={id}
              selectedUserId={selectedUserId}
              setselectedUserId={setselectedUserId}
              userName={offlinePeople[id]}
              online={false}
            />
          ))}
        </div>
        <div className="w-full flex justify-around">
          <span className="text-gray-300 cursor-pointer bg-pink-400 hover:bg-pink-500 font-bold py-2 px-4 rounded">
            {userInfo?.username}
          </span>
          <button onClick={LogOut} className="text-gray-300 cursor-pointer bg-pink-400 hover:bg-pink-500 font-bold py-2 px-4 rounded">
            LogOut
          </button>
        </div>
      </div>
      <div className="bg-pink-300 w-2/3 p-2 flex flex-col justify-end">
        {!selectedUserId && (
          <div className="m-auto text-slate-400 text-2xl">
            &larr; Start a Conversation
          </div>
        )}
        {selectedUserId && (
          <>
            <div className="overflow-y-auto custom-scrollbar">
              {UniqueMessages.map((msg) => (
                <div className="w-full" key={msg._id} style={{ clear: "both" }}>
                  <div
                    key={msg._id}
                    className={
                      "w-fit p-1 px-3 m-2 rounded-lg " +
                      (userInfo.id === msg.sender
                        ? "bg-pink-200 float-right"
                        : "bg-pink-400 float-left")
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
                className="p-2 flex-grow rounded-sm focus:outline-none bg-pink-100"
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
