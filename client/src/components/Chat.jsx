import React, { useContext, useEffect, useState, useRef } from "react";
import { UserContext } from "../UserContext";
import Logo from "./Logo";
import { uniqBy } from "lodash";
import axios from "axios";
import Contacts from "./Contacts";
import "../App.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InputEmoji from "react-input-emoji";

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
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
    } else if ("_id" in messageData) {
      setConversation((prev) => [...prev, { ...messageData }]);
    }
  }

  function sendMessage(e, file = "") {
    if (e != null && e.type == "submit") {
      e.preventDefault();
    }
    ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: message,
        url: file.url,
        name: file.name,
      })
    );
    setMessage("");
  }

  function sendFile(e) {
    e.preventDefault();

    const data = new FormData();
    data.append("file", e.target.files[0]);

    axios
      .post("/chat/uploads", data)
      .then((res) => {
        sendMessage(null, res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  useEffect(() => {
    if (selectedUserId) {
      axios
        .get("/chat/messages/" + selectedUserId, {
          params: {
            ourUserId: userInfo.id,
          },
        })
        .then((res) => {
          setConversation(res.data);
        });
    }
  }, [selectedUserId]);

  function LogOut() {
    axios.post("/user/logout").then(() => {
      setUserInfo(null);
      setWs(null);
      toast.success("Logout Successfully");
    });
  }

  const UniqueMessages = uniqBy(conversation, "_id");

  useEffect(() => {
    const div = messagesEndRef.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation, setSelectedUserId]);

  useEffect(() => {
    axios
      .get("/chat/people", {
        params: {
          ourUserId: userInfo.id,
        },
      })
      .then((res) => {
        const users = res.data;
        users.forEach((user) => {
          if (onlinePeople.hasOwnProperty(user._id)) {
            user.isOnline = true;
          }
        });

        const userArray = users.filter((user) => user._id !== userInfo.id);
        userArray.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setAllUsers(userArray);
      });
  }, [onlinePeople, UniqueMessages]);

  return (
    <div className="flex h-screen">
      <div className="h-screen bg-pink-200 w-1/3 flex flex-col justify-between">
        <div className="flex items-center justify-between flex-wrap border-b-2 border-pink-300 pb-1">
          <Logo setSelectedUserId={setSelectedUserId} />
          <button
            onClick={LogOut}
            className="text-gray-300 cursor-pointer bg-pink-400 hover:bg-pink-500 font-bold py-1 px-4 rounded-3xl mr-2"
          >
            LogOut
          </button>
        </div>
        <div className="overflow-y-auto h-[425px] custom-scrollbar flex-1">
          {allUsers.map((user) => (
            <Contacts
              id={user._id}
              selectedUserId={selectedUserId}
              setSelectedUserId={setSelectedUserId}
              userName={user.username}
              online={user.isOnline}
            />
          ))}
        </div>
        <div className="flex gap-1 justify-center items-center text-pink-600 border-pink-300 border-t-2 border-b-2 shadow-4xl hover:shadow-3xl text-xl font-bold py-2 px-4 ">
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-8 h-8"
            >
              <path
                fill-rule="evenodd"
                d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                clip-rule="evenodd"
              />
            </svg>
          </span>
          <span>{userInfo?.username}</span>
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
              {UniqueMessages.map((msg) => {
                if (msg.url) {
                  var fileExtension = msg.url.split(".").pop();
                  var isImage = ["jpg", "jpeg", "png", "gif", "bmp"].includes(
                    fileExtension.toLowerCase()
                  );
                }
                return (
                  <div
                    className="w-full"
                    key={msg._id}
                    style={{ clear: "both" }}
                  >
                    <div
                      key={msg._id}
                      className={
                        "w-fit max-w-2xl p-1 px-3 m-2 rounded-2xl " +
                        (userInfo.id === msg.sender
                          ? "bg-pink-200 float-right"
                          : "bg-pink-400 float-left")
                      }
                    >
                      {msg.text ? (
                        <div>{msg.text}</div>
                      ) : (
                        <div className="flex items-center bg-pink-100 rounded-2xl p-1">
                          <a
                            href={msg.url}
                            className="flex gap-1 items-center"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {isImage ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="w-7 h-7"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                class="w-6 h-6"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                                />
                              </svg>
                            )}
                            <p className="font-semibold">{msg.name}</p>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef}></div>
            </div>
            <form
              className="flex gap-2 items-center mt-3"
              onSubmit={sendMessage}
            >
              <InputEmoji
                value={message}
                onChange={setMessage}
                cleanOnEnter
                onEnter={sendMessage}
                placeholder="Type a Message"
                background="rgb(252 231 243)"
                color="rgb(236 72 153)"
                fontSize="16px"
              />
              <label className=" text-greyColor cursor-pointer rounded-sm">
                <input type="file" className="hidden" onChange={sendFile} />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-7 h-7"
                >
                  <path
                    fillRule="evenodd"
                    d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z"
                    clipRule="evenodd"
                  />
                </svg>
              </label>
              <button
                type="submit"
                className="bg-pink-500 text-white p-2 rounded-sm h-3/4"
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
