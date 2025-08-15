import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Send, Search, AlertCircle, MessageSquare } from "lucide-react";
import axios from "axios";
import { io } from "socket.io-client";

const API_BASE = "https://biz4293.pythonanywhere.com"; // change if needed
const SOCKET_URL = API_BASE; // change if your socket server is different

const ChatPage = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  // stable room id for user <-> admin rooms
  const roomId =
    selectedAdmin && user?.user_id
      ? [String(user.user_id), String(selectedAdmin.user_id)].sort().join("_")
      : null;

  // ----- API calls -----
  const fetchAdmins = async () => {
    setLoadingAdmins(true);
    setError(null);
    try {
      // Adjust this endpoint to your backend
      const res = await axios.get("/api/admins");
      setAdmins(res.data?.admins || []);
    } catch {
      setError("Failed to load admins");
    } finally {
      setLoadingAdmins(false);
    }
  };

  const fetchMessages = async (admin) => {
    if (!admin || !user?.user_id) return;
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/api/get_messages`, {
        params: {
          user1: user.user_id,
          user2: admin.user_id,
        },
      });
      const formatted = (res.data?.messages || []).map((msg, idx) => ({
        id: idx,
        sender: msg.sender_id === user.user_id ? "user" : "admin",
        text: msg.text,
        time: msg.time,
      }));
      setMessages(formatted);
      markAdminAsRead(admin.user_id);
    } catch {
      setError("Failed to load messages");
      setMessages([]);
    }
  };

  // ----- initial admins load -----
  useEffect(() => {
    fetchAdmins();
  }, []);

  // ----- polling fallback (admins always, messages only when socket is down) -----
  useEffect(() => {
    // clear previous
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(() => {
      fetchAdmins();
      if (selectedAdmin && !socketConnected) {
        fetchMessages(selectedAdmin);
      }
    }, 5000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [selectedAdmin, socketConnected]);

  // ----- Socket.IO setup -----
  useEffect(() => {
    if (!user?.user_id) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: false,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
      if (roomId) {
        socket.emit("join", {
          roomId,
          participants: [user.user_id, selectedAdmin?.user_id],
        });
      }
    });

    // Adjust event name/payload if your server differs
    socket.on("new_message", (evt) => {
      // expected: { roomId, sender_id, text, time }
      if (!evt) return;
      const isCurrentRoom = roomId && evt.roomId === roomId;
      const isFromSelected =
        selectedAdmin &&
        String(evt.sender_id) === String(selectedAdmin.user_id);

      if (isCurrentRoom || isFromSelected) {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            sender: evt.sender_id === user.user_id ? "user" : "admin",
            text: evt.text,
            time:
              evt.time ||
              new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
          },
        ]);
      } else if (evt.sender_id) {
        // bump unread for that admin in the list
        setAdmins((prev) =>
          prev.map((a) =>
            String(a.user_id) === String(evt.sender_id)
              ? { ...a, unread_count: (a.unread_count || 0) + 1 }
              : a
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
  }, [user?.user_id]); // init once per logged-in user

  // Join room + fetch history when switching admin
  useEffect(() => {
    if (!selectedAdmin || !roomId) return;
    const socket = socketRef.current;
    socket?.emit("join", {
      roomId,
      participants: [user.user_id, selectedAdmin.user_id],
    });
    fetchMessages(selectedAdmin);
  }, [selectedAdmin, roomId]); // eslint-disable-line

  // ----- helpers -----
  const selectAdmin = (admin) => {
    setSelectedAdmin(admin);
  };

  const markAdminAsRead = (adminUserId) => {
    setAdmins((prev) =>
      prev.map((a) =>
        String(a.user_id) === String(adminUserId)
          ? { ...a, unread_count: 0 }
          : a
      )
    );
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedAdmin || !user?.user_id) return;

    const localTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Optimistic UI
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, sender: "user", text: message, time: localTime },
    ]);

    const outgoing = message;
    setMessage("");

    // Try socket first
    const socket = socketRef.current;
    const payload = {
      roomId,
      sender_id: user.user_id,
      receiver_id: selectedAdmin.user_id,
      text: outgoing,
      time: localTime,
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

    if (!sentViaSocket) {
      try {
        await axios.post(`${API_BASE}/api/send_messages`, {
          sender_id: user.user_id,
          receiver_id: selectedAdmin.user_id,
          text: outgoing,
        });
      } catch {
        setError("Failed to send message");
      }
    }
  };

  // autoscroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // search filter (defensive on name)
  const filteredAdmins = admins.filter((admin) =>
    (admin.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // if (loadingAdmins) {
  //   return (
  //     <div className="flex justify-center items-center h-64">
  //       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8c5e3b]" />
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-md text-red-700 flex items-center">
        <AlertCircle size={20} className="mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  // Reusable parts to avoid duplicating desktop/mobile chat UIs
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
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                  msg.sender === "user"
                    ? "bg-[#8c5e3b] text-white rounded-br-none"
                    : "bg-white border border-gray-200 rounded-bl-none"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p
                  className={`text-xs mt-1 text-right ${
                    msg.sender === "user" ? "text-gray-200" : "text-gray-500"
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
      <h2 className="text-2xl font-bold text-[#5a3921] mb-6">Chat with Sellers</h2>
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200 h-[600px] flex">
        {/* Admin list (visible on all screens; acts as main list on mobile) */}
        <div className="w-full md:w-1/3 border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search admins..."
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
            {filteredAdmins.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageSquare size={40} className="mx-auto mb-2" />
                No admins found.
              </div>
            ) : (
              filteredAdmins.map((admin) => (
                <div
                  key={admin.user_id}
                  className={`flex items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedAdmin?.user_id === admin.user_id ? "bg-gray-100" : ""
                  }`}
                  onClick={() => selectAdmin(admin)}
                >
                  <div className="relative">
                    <img
                      src={
                        admin.profile_photo ||
                        "https://randomuser.me/api/portraits/lego/1.jpg"
                      }
                      alt={admin.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {admin.unread_count > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                        {admin.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {admin.name}
                    </h3>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Desktop chat area */}
        <div className="hidden md:flex flex-col w-2/3">
          {selectedAdmin ? (
            <>
              <ChatHeader peer={selectedAdmin} />
              <MessageList items={messages} />
              <MessageInput />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <div className="bg-gray-100 rounded-full p-6 mb-4">
                <MessageSquare size={48} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Select an admin
              </h3>
              <p className="text-gray-500 text-center">
                Choose an admin from the list to start chatting
              </p>
            </div>
          )}
        </div>

        {/* Mobile chat view (full parity) */}
        <div className="flex flex-col w-full md:hidden">
          {selectedAdmin ? (
            <>
              <ChatHeader
                peer={selectedAdmin}
                onBack={() => setSelectedAdmin(null)}
              />
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
                Select a chat from the list to view your messages
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
