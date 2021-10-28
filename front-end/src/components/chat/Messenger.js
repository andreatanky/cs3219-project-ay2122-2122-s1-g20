import React, { useState, useEffect, useRef } from "react";
import StudyHeader from "../header/StudyHeader";
import ChatBubble from "../bubble/ChatBubble";
import { socket } from "./Socket";

const Messenger = ({ account, displayChat, enable }) => {
  const [message, setMessage] = useState("");
  const [oldMessages, setOldMessages] = useState([]);
  const [toggle, setToggle] = useState(false); //update receiving of message whenever someone else send

  const username = account.username;
  const profilePic = account.profilePic;
  const group = displayChat._id;

  /*
  socket.once("connect", () => {
    console.log(socket.id);
  });
  */
  useEffect(() => {
    socket.on("receive-message", (messageFromSocket) => {
      console.log("receive by client");
      console.log(messageFromSocket);
      const newMessage = {
        group_id: group,
        sender: messageFromSocket.sender,
        profilePic: messageFromSocket.profilePic,
        timestamp: Date.now(),
        content: messageFromSocket.content,
      };
      setOldMessages((prevState) => prevState.concat(newMessage));
    });
    socket.io.on("reconnect", () => {
      console.log("reconnected");
      socket.emit("join-room", group);
    });
    return () => {
      socket.removeAllListeners("receive-message");
      socket.removeAllListeners("join-room");
    };
  }, []);

  const handleSendMessage = async () => {
    if (message.trim().length != 0) {
      const messageForSocket = {
        sender: username,
        profilePic: profilePic,
        content: message,
      };
      socket.emit("send-message", messageForSocket, group);
      const newMessage = {
        group_id: group,
        sender: username,
        email: account.email,
        timestamp: Date.now(),
        profilePic: profilePic,
        content: message,
      };
      setMessage("");
      setOldMessages(oldMessages.concat(newMessage));

      const res = await fetch("http://localhost:9000/api/messages", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(newMessage),
      });
      console.log(res);
      //update last modified
      try {
        const res = await fetch(`http://localhost:9000/api/groups/${group}`, {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(newMessage),
        });
        console.log(res);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [oldMessages]);

  useEffect(() => {
    const getOldMessages = async () => {
      const res = await fetch(`http://localhost:9000/api/messages/${group}`);
      const data = await res.json();
      console.log(data.messages);
      setOldMessages(data.messages);
    };
    getOldMessages();
    setToggle(!toggle);
  }, [displayChat]);

  const setMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const checkSender = (sdr) => {
    if (sdr == account.email) {
      return "right";
    } else {
      return "left";
    }
  };
  return (
    <div>
      {displayChat.length == 0 ? (
        " "
      ) : (
        <div className="flex flex-col h-screen relative pb-16  md:w-auto">
          <StudyHeader group={displayChat} />
          <div className="pr-10 pl-2 overflow-y-auto">
            {oldMessages.map((message, index) => (
              <ChatBubble
                key={index}
                message={message}
                pic={message.profilePic}
                toggle={checkSender(message.email)}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
          {enable ? (
            <div className="absolute inset-x-0 bottom-0 flex flex-row h-16">
              <input
                onChange={setMessageChange}
                value={message}
                placeholder="Write a message"
                className="w-full placeholder-white bg-purple border-black border-2 pl-2 text-lg"
              ></input>
              <button className="pl-2 pr-2 bg-grey" onClick={handleSendMessage}>
                Send
              </button>
            </div>
          ) : (
            <div className="absolute inset-x-0 bottom-0 flex flex-row h-16 pt-4 bg-purple justify-center">
              Join the group to start chatting
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Messenger;
