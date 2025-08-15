import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Send, Search, AlertCircle, MessageSquare } from "lucide-react";
import axios from "axios";
import { io } from "socket.io-client";

const API_BASE = "https://biz4293.pythonanywhere.com";
const SOCKET_URL = API_BASE; // Change if your socket server is different

const SupportCommunication = () => {
  const { user } = useAuth(); // logged-in admin
  const [users, setUsers] = useState([]); // users who chatted with admin
  const [selectedUser, setSelectedUser] = useState(null); // selected chat user
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  // Room id helper (stable ordering so both sides join the same room)
  const roomId = selectedUser && user?.user_id
    ? [String(user.user_id), String(selectedUser.user_id)].sort().join("_")
    : null;

  // ---- API calls ----
  const fetchUsers = async () => {
    if (!user?.user_id) return;
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/api/users_chatted_with_admin`, {
        params: { admin_id: user.user_id },
      });
      setUsers(res.data.users || []);
    } catch {
      setError("Failed to load users");
    }
  };

  const fetchMessages = async (u) => {
    if (!u || !user?.user_id) return;
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/api/get_messages`, {
        params: { user1: user.user_id, user2: u.user_id },
      });
      const formatted = (res.data.messages || []).map((msg, idx) => ({
        id: idx,
        sender: msg.sender_id === user.user_id ? "admin" : "user",
        text: msg.text,
        time: msg.time,
      }));
      setMessages(formatted);
      markUserAsRead(u.user_id);
    } catch {
      setError("Failed to load messages");
      setMessages([]);
    }
  };

  // ---- Effects: initial data + polling fallback ----
  useEffect(() => {
    if (!user?.user_id) return;
    fetchUsers();
  }, [user?.user_id]);

  // Polling fallback (always keeps user list fresh; messages only when needed)
  useEffect(() => {
    if (!user?.user_id) return;

    // clear any previous interval
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    pollingRef.current = setInterval(() => {
      fetchUsers();
      if (selectedUser && !socketConnected) {
        // Only poll messages if socket is not connected (fallback mode)
        fetchMessages(selectedUser);
      }
    }, 5000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [selectedUser, user?.user_id, socketConnected]);

  // ---- Socket.IO setup ----
  useEffect(() => {
    if (!user?.user_id) return;

    // Create socket
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: false,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
      // Join current room if a user is already selected
      if (roomId) {
        socket.emit("join", { roomId, participants: [user.user_id, selectedUser.user_id] });
      }
    });

    // If your backend emits a different event name, adjust here
    socket.on("new_message", (evt) => {
      // evt expected: { roomId, sender_id, text, time }
      if (!evt) return;

      // If message belongs to current chat, append; otherwise bump unread on that user
      const isCurrentRoom = roomId && evt.roomId === roomId;
      const isFromSelected =
        selectedUser && String(evt.sender_id) === String(selectedUser.user_id);

      if (isCurrentRoom || isFromSelected) {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            sender: evt.sender_id === user.user_id ? "admin" : "user",
            text: evt.text,
            time: evt.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      } else if (evt.sender_id) {
        // Increase unread count for that sender in the list
        setUsers((prev) =>
          prev.map((u) =>
            String(u.user_id) === String(evt.sender_id)
              ? { ...u, unread_count: (u.unread_count || 0) + 1 }
              : u
          )
        );
      }
    });

    socket.on("disconnect", () => setSocketConnected(false));
    socket.on("connect_error", () => setSocketConnected(false));

    return () => {
      try {
        socket.disconnect();
      } catch {
        /* ignore */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id]); // init once per user

  // Join/leave room when selected user changes
  useEffect(() => {
    if (!socketRef.current) return;
    if (selectedUser && roomId) {
      socketRef.current.emit("join", {
        roomId,
        participants: [user.user_id, selectedUser.user_id],
      });
      // Also fetch the latest history upon switching
      fetchMessages(selectedUser);
    }
    // Leaving is handled automatically by server or on disconnect;
    // if you have a "leave" event, you can emit it here in a cleanup.
    // return () => { socketRef.current?.emit('leave', { roomId }); }
  }, [selectedUser, roomId]); // eslint-disable-line

  // ---- Helpers ----
  const selectUser = (u) => {
    setSelectedUser(u);
  };

  const markUserAsRead = (userId) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) =>
        String(u.user_id) === String(userId) ? { ...u, unread_count: 0 } : u
      )
    );
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser || !user?.user_id) return;

    const localMsg = {
      id: messages.length + 1,
      sender: "admin",
      text: message,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, localMsg]);
    const outgoing = message;
    setMessage("");

    // Try socket first for realtime delivery
    const socket = socketRef.current;
    const payload = {
      roomId,
      sender_id: user.user_id,
      receiver_id: selectedUser.user_id,
      text: outgoing,
      time: localMsg.time,
    };

    let sentViaSocket = false;
    try {
      if (socket && socketConnected) {
        socket.emit("send_message", payload);
        sentViaSocket = true;
      }
    } catch {
      // ignore and fall back to HTTP
    }

    // Fallback: HTTP POST to your API
    if (!sentViaSocket) {
      try {
        await axios.post(`${API_BASE}/api/send_messages`, {
          sender_id: user.user_id,
          receiver_id: selectedUser.user_id,
          text: outgoing,
        });
      } catch {
        setError("Failed to send message");
      }
    }
  };

  // Autoscroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Filter users by search term
  const filteredUsers = users.filter((u) =>
    (u.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-md text-red-700 flex items-center">
        <AlertCircle size={20} className="mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  // Reusable chat bits (to avoid duplicating desktop/mobile)
  const ChatHeader = ({ peer, onBack }) => (
    <div className="p-4 border-b border-gray-200 flex items-center">
      {onBack && (
        <button
          onClick={onBack}
          className="mr-3 text-gray-500 hover:text-gray-700"
          aria-label="Back"
        >
          ← Back
        </button>
      )}
      <img
        src={peer.profile_photo || "https://randomuser.me/api/portraits/lego/1.jpg"}
        alt={peer.name}
        className="w-10 h-10 rounded-full object-cover"
      />
      <div className="ml-3">
        <h3 className="font-medium text-gray-900">{peer.name}</h3>
        <p className="text-xs text-green-500">
          {socketConnected ? "Online" : "Connecting..."}
        </p>
      </div>
    </div>
  );

  const MessageList = ({ items }) => (
    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
      {items.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">No messages yet.</div>
      ) : (
        <div className="space-y-4">
          {items.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                  msg.sender === "admin"
                    ? "bg-[#8c5e3b] text-white rounded-br-none"
                    : "bg-white border border-gray-200 rounded-bl-none"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p
                  className={`text-xs mt-1 text-right ${
                    msg.sender === "admin" ? "text-gray-200" : "text-gray-500"
                  }`}
                >
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );

  const MessageInput = () => (
    <div className="p-4 border-t border-gray-200">
      <form onSubmit={sendMessage} className="flex items-center">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 rounded-l-md py-2 px-4 focus:outline-none focus:ring-1 focus:ring-[#8c5e3b] focus:border-[#8c5e3b]"
        />
        <button
          type="submit"
          className="bg-[#8c5e3b] text-white p-2 rounded-r-md hover:bg-[#5a3921]"
          aria-label="Send"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#5a3921] mb-6">Chat with Users</h2>
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200 h-[600px] flex">
        {/* Users sidebar (visible on all screens; becomes the main list on mobile) */}
        <div className="w-full md:w-1/3 border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#8c5e3b] focus:border-[#8c5e3b]"
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
            </div>
          </div>
          <div>
            {filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageSquare size={40} className="mx-auto mb-2" />
                No users found.
              </div>
            ) : (
              filteredUsers.map((u) => (
                <div
                  key={u.user_id}
                  className={`flex items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedUser?.user_id === u.user_id ? "bg-gray-100" : ""
                  }`}
                  onClick={() => selectUser(u)}
                >
                  <div className="relative">
                    <img
                      src={
                        u.profile_photo ||
                        "https://randomuser.me/api/portraits/lego/1.jpg"
                      }
                      alt={u.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {u.unread_count > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                        {u.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {u.name}
                    </h3>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Desktop chat area */}
        <div className="hidden md:flex flex-col w-2/3">
          {selectedUser ? (
            <>
              <ChatHeader peer={selectedUser} />
              <MessageList items={messages} />
              <MessageInput />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <div className="bg-gray-100 rounded-full p-6 mb-4">
                <MessageSquare size={48} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Select a user
              </h3>
              <p className="text-gray-500 text-center">
                Choose a user from the list to start chatting
              </p>
            </div>
          )}
        </div>

        {/* Mobile chat view (full feature parity) */}
        <div className="flex flex-col w-full md:hidden">
          {selectedUser ? (
            <>
              <ChatHeader peer={selectedUser} onBack={() => setSelectedUser(null)} />
              <MessageList items={messages} />
              <MessageInput />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <div className="bg-gray-100 rounded-full p-6 mb-4">
                <MessageSquare size={48} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Your Conversations
              </h3>
              <p className="text-gray-500 text-center">
                Select a chat from the list (left/top) to view your messages
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportCommunication;
