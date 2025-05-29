"use client"

import { FormEvent, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

// chat message interface
interface ChatMessage {
  id: string; //unique generated id
  text: string;
  timestamp: string; //message sent time
}

let socket: Socket;

export default function Home() {
  
  const [message , setMessage] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // intialiaze socket.io connection
  const socketIntializer = async () => {

    // connect to socket.io server
    socket = io("http://localhost:5000");

    socket.on("connect", () => {
      console.log("Connected to socket.io server !");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket.io server");
      setIsConnected(false);
    });

    socket.on("chat message", (msg: string) => {
      console.log("hello")
      // add message to message array
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: Date.now().toString(), text: msg, timestamp: new Date().toLocaleTimeString() }
      ]);
    });
  };



  useEffect(() => {

    socketIntializer();

    // cleanup to avoid memory leak
    return () => {
      if (socket) {
        socket.disconnect();
      }
    }
  }, []);

  const sendMessage = (e : FormEvent) => {

    e.preventDefault();
    console.log("button clicked",message)
    
    if(message.trim() && socket && isConnected){
      socket.emit("chat message",message);
      setMessage('')
    }

  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
          Chat App
        </h1>
        <p className={`text-sm text-center mb-4 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
          Status : {isConnected ? 'Connected' : 'Disconnected'}
        </p>

        {/* Message Display Area */}
        <div className="h-64 overflow-y-auto border border-gray-300 rounded-md p-3 mb-4 bg-gray-50">
          {messages.length === 0  ? (
            <p className="text-gray-500 text-center mt-8"> No messages yet. Start chatting!</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="mb-2 p-2 bg-blue-50 rounded-md text-gray-800">
                <span className="font-semibold text-blue-700">[{msg.timestamp}]</span>{msg.text}
              </div>
            ))
          )}
        </div>

        {/* Message Input Form */}
        <form onSubmit={sendMessage} className="flex gap-2">
          <input 
          type="text"
          value={message} 
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled = {!isConnected}
          className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>

          <button type="submit"
          className="bg-blue-600 text-white px-5 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled = {!isConnected || message.trim() === ''}>
            Send
          </button>
        </form>
      </div>
    </div>
  )

};
