import React from "react";
import Avatar from "./Avatar";

const Contacts = ({id,selectedUserId,setSelectedUserId,userName,online}) => {
  return (
    <div
      key={id}
      onClick={() => setSelectedUserId(id)}
      className={
        "border-b border-blue5 text-white font-semibold flex items-center gap-2 cursor-pointer rounded-lg " +
        (selectedUserId === id ? "bg-blue1" : "bg-blue4")
      }
    >
      <div className="flex items-center gap-2 py-2 pl-4">
        <Avatar username={userName} id={id} online={online} />
        <span>{userName}</span>
      </div>
    </div>
  );
};

export default Contacts;
