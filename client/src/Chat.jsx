import React from "react";

const Chat = () => {
  return (
    <div className="flex h-screen">
      <div className="bg-pink-200 w-1/3">Contacts</div>
      <div className="bg-pink-300 w-2/3 p-2 flex flex-col">
        <div className="flex-grow">Particular Message</div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type a Message"
            className="p-2 flex-grow rounded-sm"
          />
          <button className="bg-pink-500 text-white p-2 rounded-sm">
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
        </div>
      </div>
    </div>
  );
};

export default Chat;
