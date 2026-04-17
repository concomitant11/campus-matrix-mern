import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import { toast, ToastContainer } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Send, UserPlus, Search, MessageCircle, Info } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

const socket = io("", {
  withCredentials: true,
});

const Messages = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  
  const scrollRef = useRef();
  const typingTimeoutRef = useRef(null);

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLoggedInUser = async () => {
    try {
      const res = await axios.get("/api/auth/me", { withCredentials: true });
      setUser(res.data);
      socket.emit("addUser", res.data._id);
    } catch {
      toast.error("Failed to load user");
    }
  };

  const fetchChats = async () => {
    try {
      const res = await axios.get("/api/chat", { withCredentials: true });
      const fetchedChats = Array.isArray(res.data) ? res.data : [];
      setChats(fetchedChats);

      if (fetchedChats.length > 0 && !currentChat) {
        setCurrentChat(fetchedChats[0]);
      }
    } catch {
      toast.error("Failed to load chats");
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const res = await axios.get(`/api/messages/${chatId}`, { withCredentials: true });
      setMessages(res.data);
    } catch {
      toast.error("Failed to load messages");
    }
  };

  useEffect(() => {
    getLoggedInUser();
    fetchChats();
  }, []);

  useEffect(() => {
    if (currentChat?._id) {
      fetchMessages(currentChat._id);
      socket.emit("joinRoom", currentChat._id);
    }
  }, [currentChat]);

  useEffect(() => {
    const handleNewMessage = (msg) => {
      if (msg.chat._id === currentChat?._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
      fetchChats();
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("typing", (chatId) => {
      if (chatId === currentChat?._id) setIsTyping(true);
    });
    socket.on("stopTyping", (chatId) => {
      if (chatId === currentChat?._id) setIsTyping(false);
    });

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [currentChat]);

  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.emit("typing", currentChat._id);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", currentChat._id);
    }, 2000);
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!message.trim() || !currentChat?._id) return;

    try {
      const res = await axios.post("/api/messages/send", {
        chatId: currentChat._id,
        content: message,
      }, { withCredentials: true });

      setMessage("");
      setMessages((prev) => [...prev, res.data]);
      socket.emit("newMessage", res.data);
      socket.emit("stopTyping", currentChat._id);
    } catch {
      toast.error("Failed to send message");
    }
  };

  const startNewChat = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      const res = await axios.post("/api/chat", { email }, { withCredentials: true });
      setEmail("");
      setIsNewChatOpen(false);
      setChats((prev) => {
        const exists = prev.find((chat) => chat._id === res.data._id);
        return exists ? prev : [res.data, ...prev];
      });
      setCurrentChat(res.data);
    } catch {
      toast.error("User not found or cannot start chat");
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach((msg) => {
      const date = new Date(msg.createdAt).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  const getRelativeDate = (dateStr) => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (dateStr === today) return "Today";
    if (dateStr === yesterday) return "Yesterday";
    return dateStr;
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-slate-50 overflow-hidden font-sans">
      <ToastContainer position="top-center" />
      
      {/* Sidebar */}
      <div className="w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-200 bg-white shadow-sm z-10 shrink-0">
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
           <h2 className="text-xl font-bold text-slate-800 tracking-tight">Inbox</h2>
           <button 
             onClick={() => setIsNewChatOpen(!isNewChatOpen)}
             className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors cursor-pointer focus:outline-none"
             title="Start new chat"
           >
             <UserPlus size={18} />
           </button>
        </div>

        {/* New Chat Dropdown */}
        <AnimatePresence>
          {isNewChatOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-slate-50 border-b border-slate-200 px-4 py-3 overflow-hidden"
            >
              <form onSubmit={startNewChat} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Student email..."
                  className="flex-1 text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition cursor-pointer"
                >
                  <Search size={16} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
               <MessageCircle size={32} className="mb-2 opacity-50" />
               <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            chats.map((chat) => {
              const otherUser = chat.users.find((u) => u._id !== user?._id);
              const isSelected = currentChat?._id === chat._id;
              
              return (
                <div
                  key={chat._id}
                  onClick={() => setCurrentChat(chat)}
                  className={`cursor-pointer px-4 py-4 border-b border-slate-50 transition-all ${
                    isSelected
                      ? "bg-indigo-50 border-l-4 border-l-indigo-600"
                      : "bg-white hover:bg-slate-50 border-l-4 border-l-transparent"
                  }`}
                >
                  <div className="flex justify-between items-baseline mb-1">
                     <h3 className="font-semibold text-slate-800 text-sm truncate pr-2">
                       {otherUser?.name || "Self"}
                     </h3>
                     {chat.latestMessage && (
                       <span className="text-[10px] text-slate-400 shrink-0">
                         {formatTime(chat.latestMessage.createdAt)}
                       </span>
                     )}
                  </div>
                  <div className="text-xs text-slate-500 truncate flex items-center gap-1">
                     {chat.latestMessage ? chat.latestMessage.content : <span className="italic">No messages yet</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col bg-[#F8FAFC] relative">
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-6 border-b border-slate-200 bg-white flex items-center justify-between shadow-sm z-10 shrink-0">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                    {currentChat.users.find((u) => u._id !== user?._id)?.name?.charAt(0) || "S"}
                 </div>
                 <div>
                   <h2 className="font-semibold text-slate-800 leading-tight">
                     {currentChat.users.find((u) => u._id !== user?._id)?.name || "Self"}
                   </h2>
                   <p className="text-xs text-slate-500 flex items-center gap-1">
                     <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full"></span> Online
                   </p>
                 </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600 transition">
                 <Info size={20} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin">
              {Object.entries(groupMessagesByDate(messages)).map(([date, msgs], idx) => (
                <div key={idx} className="mb-6">
                  <div className="flex justify-center mb-4">
                     <span className="bg-slate-200/50 text-slate-500 text-xs font-medium px-3 py-1 rounded-full">
                       {getRelativeDate(date)}
                     </span>
                  </div>
                  
                  {msgs.map((msg, index) => {
                    const isSender = msg.sender === user?._id || msg.sender?._id === user?._id;
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={index}
                        className={`flex mb-3 ${isSender ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`relative max-w-[75%] sm:max-w-[60%] px-4 py-2.5 rounded-2xl shadow-sm text-sm ${
                            isSender
                              ? "bg-indigo-600 text-white rounded-br-sm"
                              : "bg-white text-slate-800 border border-slate-200 rounded-bl-sm"
                          }`}
                        >
                          <div className="whitespace-pre-wrap word-break">{msg.content}</div>
                          <div className={`text-[10px] mt-1 text-right ${isSender ? "text-indigo-200" : "text-slate-400"}`}>
                            {formatTime(msg.createdAt)}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-slate-400 text-sm ml-2" ref={scrollRef}>
                   <div className="flex gap-1.5 bg-white p-3 rounded-2xl rounded-bl-sm border border-slate-200 shadow-sm w-fit">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                   </div>
                </div>
              )}
              <div ref={scrollRef} className="h-1" />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-slate-200 flex-shrink-0">
              <form onSubmit={sendMessage} className="flex gap-2 max-w-4xl mx-auto items-center bg-slate-50 border border-slate-200 rounded-full px-2 py-1.5 shadow-inner focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                <input
                  type="text"
                  value={message}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent px-4 py-2 focus:outline-none text-slate-700 text-sm placeholder-slate-400"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white p-2.5 rounded-full transition-colors cursor-pointer flex items-center justify-center shadow-sm"
                >
                  <Send size={18} className="ml-0.5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
            <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
               <MessageCircle size={48} className="text-indigo-200" />
            </div>
            <h2 className="text-xl font-semibold text-slate-700 mb-2">Your Messages</h2>
            <p className="text-slate-500 text-sm max-w-xs text-center">
              Select a conversation from the sidebar or start a new one to connect.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
