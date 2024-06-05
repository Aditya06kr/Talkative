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
import Avatar from "./Avatar";
import { FcDocument, FcImageFile } from "react-icons/fc";
import { AiOutlineSend } from "react-icons/ai";
import { GrAttachment } from "react-icons/gr";
import { IoLogOutOutline } from "react-icons/io5";
import Popup from "reactjs-popup";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [open, setOpen] = useState(false);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { userInfo, setUserInfo } = useContext(UserContext);
  const [message, setMessage] = useState();
  const [conversation, setConversation] = useState([]);
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [isEditingFile, setIsEditingFile] = useState(false);
  const [editId, setEditId] = useState(null);
  const [prevFile, setPrevFile] = useState(null);
  const messagesEndRef = useRef(null);
  useEffect(() => {
    connectToWs();
  }, []);

  function connectToWs() {
    const ws = new WebSocket("ws://localhost:8080");
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
      if (selectedUserId) {
        setSelectedUserId(selectedUserId);
      }
    } else if ("_id" in messageData) {
      setConversation((prev) => [...prev, { ...messageData }]);
      setOpen(false);
    }
  }

  function notifyChange() {
    ws.send(
      JSON.stringify({
        type: "notification",
      })
    );
  }

  function sendMessage(e, file = "") {
    if (e != null && e.type == "submit") {
      e.preventDefault();
    }

    if (isEditingMessage) {
      handleEditMessage();
    } else {
      ws.send(
        JSON.stringify({
          type: "message",
          recipient: selectedUserId,
          text: message,
          url: file.url,
          name: file.name,
        })
      );
    }
    setMessage("");
  }

  function sendFile(e) {
    e.preventDefault();

    if (e.target.files[0]) {
      setOpen(true);
      const data = new FormData();
      data.append("file", e.target.files[0]);
      data.append("prevFile", prevFile);
      axios
        .post("/chat/uploads", data)
        .then((res) => {
          if (!isEditingFile) sendMessage(null, res.data);
          else {
            handleEditFile(res.data);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      console.log("Select a file");
    }
  }

  function GenerateMessages() {
    axios
      .get("/chat/messages/" + selectedUserId, {
        params: {
          ourUserId: userInfo.id,
        },
      })
      .then((res) => {
        setConversation(res.data);
      });
    setOpen(false);
  }

  useEffect(() => {
    if (selectedUserId) {
      GenerateMessages();
    }
  }, [selectedUserId]);

  function LogOut() {
    axios.post("/user/logout").then(() => {
      setUserInfo(null);
      setWs(null);
      toast.success("Logout Successfully");
      notifyChange();
    });
  }

  function handleEditMessage() {
    axios
      .put("/chat/editMessage/" + editId, { message })
      .then((res) => {
        if (res.status === 200) {
          GenerateMessages();
        } else {
          console.log("Editing Message Failed");
        }
      })
      .catch((err) => {
        console.log("Editing message failed");
        console.error("Error editing message:", err);
      });
    setEditId(null);
    setIsEditingMessage(false);
    notifyChange();
  }

  function editMessage(msg, id) {
    setMessage(msg);
    setEditId(id);
    setIsEditingMessage(true);
  }

  function handleEditFile(file) {
    const url = file.url;
    const name = file.name;

    axios
      .put("/chat/editFile/" + editId, { url, name })
      .then((res) => {
        if (res.status === 200) {
          GenerateMessages();
        } else {
          console.log("Editing File Failed");
        }
      })
      .catch((err) => {
        console.log("Editing file failed");
        console.error("Error editing file:", err);
      });

    setIsEditingFile(false);
    setPrevFile(null);
    setEditId(null);
    notifyChange();
  }

  function editFile(url, id) {
    setPrevFile(url);
    setEditId(id);
    setIsEditingFile(true);
    document.getElementById("selectFile").click();
  }

  function deleteMessage(deleteId) {
    axios
      .delete("/chat/deleteMessage/" + deleteId)
      .then((res) => {
        if (res.status === 200) {
          GenerateMessages();
        } else {
          console.log("Error in Deleting Message");
        }
      })
      .catch((err) => {
        console.log("Error in Client Side in Deleting a Message");
        console.log("Error Deleting message:", err);
      });
  }

  function deleteFile(url, deleteId) {
    setOpen(true);
    axios
      .delete("/chat/deleteFile/" + deleteId, { params: { url } })
      .then((res) => {
        if (res.status === 200) {
          GenerateMessages();
        } else {
          console.log("Error in Deleting File");
        }
      })
      .catch((err) => {
        console.log("Error in Client Side in Deleting a File");
        console.log("Error Deleting file:", err);
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
        userArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAllUsers(userArray);
      });
  }, [conversation, onlinePeople]);

  return (
    <div className="flex h-screen bg-blue0">
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
        onClick={() => setOpen(false)}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <div className={"h-screen md:w-1/3 flex flex-col justify-between " + (selectedUserId ? "md:flex hidden" : "w-screen")}>
        <div className="flex items-center justify-between flex-wrap pb-1 ">
          <Logo setSelectedUserId={setSelectedUserId} />
          <button
            onClick={LogOut}
            className="bg-blue2 hover:bg-blue-600 delay-150 focus:bg-blue-400 focus:outline-none active:bg-blue-700 text-white border border-transparent rounded-md shadow-sm py-2 px-3 inline-block font-medium text-sm mr-3"
          >
            <IoLogOutOutline size={25} />
          </button>
        </div>
        <div className="overflow-y-auto h-[425px] custom-scrollbar flex-1 m-2 py-1 ">
          {allUsers.length > 0 ? (
            allUsers.map((user) => (
              <Contacts
                key={user._id}
                id={user._id}
                selectedUserId={selectedUserId}
                setSelectedUserId={setSelectedUserId}
                userName={user.username}
                online={user.isOnline}
              />
            ))
          ) : (
            <h1 className="text-2xl text-blue-100">No Contacts</h1>
          )}
        </div>
      </div>
      <div className={"bg-blue4 md:w-2/3 flex flex-col justify-end mx-2 rounded-xl " + (selectedUserId ? "w-screen" : "md:flex hidden")}>
        {!selectedUserId ? (
          <div className="m-auto text-slate-400 text-2xl">
            &larr; Start a Conversation
          </div>
        ) : (
          <>
            <div className="flex flex-col h-screen gap-2 ">
              <div className="bg-blue5 flex justify-between items-center text-white text-xl font-bold py-2 px-4">
                <div className="flex items-center gap-2">
                  <span>
                    <Avatar
                      username={
                        allUsers.find((user) => user._id === selectedUserId)
                          .username
                      }
                      id={selectedUserId}
                      online={
                        allUsers.find((user) => user._id === selectedUserId)
                          .isOnline
                      }
                    />
                  </span>
                  <span>
                    {
                      allUsers.find((user) => user._id === selectedUserId)
                        .username
                    }
                  </span>
                </div>
                <button
                  className={" appearance-none bg-transparent border-2 border-gray-900 rounded-lg text-blue-500 cursor-pointer md:hidden inline-block font-medium text-base py-2 px-4 min-h-8 min-w-0 outline-none transition duration-300 ease-in-out hover:text-white hover:bg-gray-900 hover:shadow-md active:shadow-none active:translate-y-0 disabled:pointer-events-none disabled:opacity-50"}
                  role="button"
                  onClick={()=>setSelectedUserId(null)}
                >
                  Contacts
                </button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar rounded">
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
                          "w-fit max-w-2xl p-1 px-3 m-2 text-white rounded-2xl " +
                          (userInfo.id === msg.sender
                            ? "bg-blue2 float-right"
                            : "bg-blue3 float-left")
                        }
                      >
                        {msg.text ? (
                          userInfo.id === msg.sender ? (
                            <Popup
                              trigger={<div>{msg.text}</div>}
                              position="left center"
                              on="right-click"
                              offsetX={-5}
                            >
                              <div className="w-20 flex flex-col bg-blue5 items-center rounded-lg text-white">
                                <div
                                  onClick={() => editMessage(msg.text, msg._id)}
                                  className="cursor-pointer p-4 h-8 flex items-center hover:text-blue-400 delay-100"
                                >
                                  Edit
                                </div>
                                <div
                                  onClick={() => deleteMessage(msg._id)}
                                  className="cursor-pointer p-4 h-8 border-t border-t-blue-400 flex items-center hover:text-blue-400 delay-100"
                                >
                                  Delete
                                </div>
                              </div>
                            </Popup>
                          ) : (
                            <div>{msg.text}</div>
                          )
                        ) : userInfo.id === msg.sender ? (
                          <Popup
                            trigger={
                              <div className="flex items-center rounded-2xl p-1">
                                <a
                                  href={msg.url}
                                  className="flex gap-1 items-center"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {isImage ? (
                                    <FcImageFile size={30} />
                                  ) : (
                                    <FcDocument size={30} />
                                  )}
                                  <p className="font-semibold">
                                    {msg.name + "." + fileExtension}
                                  </p>
                                </a>
                              </div>
                            }
                            position={
                              userInfo.id === msg.sender
                                ? "left center"
                                : "right center"
                            }
                            on="right-click"
                            offsetX={userInfo.id !== msg.sender ? 15 : -5}
                          >
                            <div className="w-20 flex flex-col bg-blue5 items-center rounded-lg text-white">
                              <div
                                onClick={() => editFile(msg.url, msg._id)}
                                className="cursor-pointer p-4 h-8 flex items-center hover:text-blue-400 delay-100"
                              >
                                Edit
                              </div>
                              <div
                                onClick={() => deleteFile(msg.url, msg._id)}
                                className="cursor-pointer p-4 h-8 border-t border-t-blue-400 flex items-center hover:text-blue-400 delay-100"
                              >
                                Delete
                              </div>
                            </div>
                          </Popup>
                        ) : (
                          <div className="flex items-center rounded-2xl p-1">
                            <a
                              href={msg.url}
                              className="flex gap-1 items-center"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {isImage ? (
                                <FcImageFile size={30} />
                              ) : (
                                <FcDocument size={30} />
                              )}
                              <p className="font-semibold">
                                {msg.name + "." + fileExtension}
                              </p>
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
                className="flex gap-2 items-center bg-blue0 pt-2"
                onSubmit={sendMessage}
              >
                <InputEmoji
                  value={message}
                  onChange={setMessage}
                  cleanOnEnter
                  onEnter={sendMessage}
                  placeholder="Write a message ..."
                  background="#414256"
                  color="white"
                  fontSize="14px"
                />
                <label className=" text-grey cursor-pointer rounded-sm">
                  <input
                    type="file"
                    id="selectFile"
                    className="hidden"
                    onChange={sendFile}
                  />
                  <GrAttachment size={22} />
                </label>
                <button
                  type="submit"
                  className="bg-blue2 hover:bg-blue-600 delay-150 focus:bg-blue-400 focus:outline-none active:bg-blue-700 text-white border border-transparent rounded-md shadow-sm py-2 px-3 inline-block font-medium text-sm"
                >
                  <AiOutlineSend size={22} />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
