import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Send, Search, AlertCircle, MessageSquare } from 'lucide-react';
import axios from 'axios';

const SupportCommunication = () => {
  const { user } = useAuth(); // logged-in admin
  const [users, setUsers] = useState([]); // users who chatted with admin
  const [selectedUser, setSelectedUser] = useState(null); // selected chat user
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // <-- Added search state
  const messagesEndRef = useRef(null);

  const fetchUsers = async () => {
    setError(null);
    try {
      const res = await axios.get('https://biz4293.pythonanywhere.com/api/users_chatted_with_admin', {
        params: { admin_id: user.user_id },
      });
      setUsers(res.data.users);
    } catch {
      setError('Failed to load users');
    }
  };

  const fetchMessages = async (u) => {
    if (!u) return;
    setError(null);
    try {
      const res = await axios.get('https://biz4293.pythonanywhere.com/api/get_messages', {
        params: { user1: user.user_id, user2: u.user_id },
      });
      const formattedMessages = res.data.messages.map((msg, idx) => ({
        id: idx,
        sender: msg.sender_id === user.user_id ? 'admin' : 'user',
        text: msg.text,
        time: msg.time,
      }));
      setMessages(formattedMessages);
      markUserAsRead(u.user_id);
    } catch {
      setError('Failed to load messages');
      setMessages([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user.user_id]);

  // Refresh users and messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUsers();
      if (selectedUser) {
        fetchMessages(selectedUser);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedUser, user.user_id]);

  const selectUser = (u) => {
    setSelectedUser(u);
    fetchMessages(u);
  };

  const markUserAsRead = (userId) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) =>
        u.user_id === userId ? { ...u, unread_count: 0 } : u
      )
    );
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser) return;

    const newMsg = {
      id: messages.length + 1,
      sender: 'admin',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([...messages, newMsg]);
    setMessage('');

    try {
      await axios.post('https://biz4293.pythonanywhere.com/api/send_messages', {
        sender_id: user.user_id,
        receiver_id: selectedUser.user_id,
        text: message,
      });
      await fetchMessages(selectedUser);
    } catch {
      setError('Failed to send message');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter users by search term (case-insensitive)
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-md text-red-700 flex items-center">
        <AlertCircle size={20} className="mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#5a3921] mb-6">Chat with Users</h2>
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200 h-[600px] flex">
        {/* Users sidebar */}
        <div className="w-full md:w-1/3 border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}                          // <-- Controlled input value
                onChange={(e) => setSearchTerm(e.target.value)} // <-- Update search term
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#8c5e3b] focus:border-[#8c5e3b]"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
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
                    selectedUser?.user_id === u.user_id ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => selectUser(u)}
                >
                  <div className="relative">
                    <img
                      src={u.profile_photo || 'https://randomuser.me/api/portraits/lego/1.jpg'}
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
                    <h3 className="text-sm font-medium text-gray-900 truncate">{u.name}</h3>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="hidden md:flex flex-col w-2/3">
          {selectedUser ? (
            <>
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center">
                  <img
                    src={selectedUser.profile_photo || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                    alt={selectedUser.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">{selectedUser.name}</h3>
                    <p className="text-xs text-green-500">Online</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-10">
                    No messages yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                            msg.sender === 'admin'
                              ? 'bg-[#8c5e3b] text-white rounded-br-none'
                              : 'bg-white border border-gray-200 rounded-bl-none'
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <p
                            className={`text-xs mt-1 text-right ${
                              msg.sender === 'admin' ? 'text-gray-200' : 'text-gray-500'
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

              <div className="p-4 border-t border-gray-200">
                <form onSubmit={sendMessage} className="flex items-center">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 border border-gray-300 rounded-l-md py-2 px-4 focus:outline-none focus:ring-1 focus:ring-[#8c5e3b] focus:border-[#8c5e3b]"
                  />
                  <button type="submit" className="bg-[#8c5e3b] text-white p-2 rounded-r-md hover:bg-[#5a3921]">
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <div className="bg-gray-100 rounded-full p-6 mb-4">
                <MessageSquare size={48} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Select a user</h3>
              <p className="text-gray-500 text-center">Choose a user from the list to start chatting</p>
            </div>
          )}
        </div>

        {/* Mobile fallback */}
        <div className="flex flex-col items-center justify-center p-4 w-full md:hidden">
          {/* Mobile view */}
<div className="flex flex-col w-full md:hidden">
  {selectedUser ? (
    <>
      {/* Chat header */}
      <div className="p-4 border-b border-gray-200 flex items-center">
        <button
          onClick={() => setSelectedUser(null)}
          className="mr-3 text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>
        <img
          src={selectedUser.profile_photo || 'https://randomuser.me/api/portraits/lego/1.jpg'}
          alt={selectedUser.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="ml-3">
          <h3 className="font-medium text-gray-900">{selectedUser.name}</h3>
          <p className="text-xs text-green-500">Online</p>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            No messages yet.
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs rounded-lg p-3 ${
                    msg.sender === 'admin'
                      ? 'bg-[#8c5e3b] text-white rounded-br-none'
                      : 'bg-white border border-gray-200 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p
                    className={`text-xs mt-1 text-right ${
                      msg.sender === 'admin' ? 'text-gray-200' : 'text-gray-500'
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

      {/* Chat input */}
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
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </>
  ) : (
    <>
      {/* User list (same as desktop sidebar) */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#8c5e3b] focus:border-[#8c5e3b]"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
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
              className="flex items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
              onClick={() => selectUser(u)}
            >
              <div className="relative">
                <img
                  src={u.profile_photo || 'https://randomuser.me/api/portraits/lego/1.jpg'}
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
                <h3 className="text-sm font-medium text-gray-900 truncate">{u.name}</h3>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )}
</div>

        </div>
      </div>
    </div>
  );
};

export default SupportCommunication;
