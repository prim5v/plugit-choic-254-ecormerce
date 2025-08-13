import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Send, Search, AlertCircle, MessageSquare } from 'lucide-react';
import axios from 'axios';

const ChatPage = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // <-- Added for search input
  const messagesEndRef = useRef(null);

  const fetchAdmins = async () => {
    setLoadingAdmins(true);
    setError(null);
    try {
      const res = await axios.get('/api/admins');
      setAdmins(res.data.admins);
    } catch {
      setError('Failed to load admins');
    } finally {
      setLoadingAdmins(false);
    }
  };

  const fetchMessages = async (admin) => {
    if (!admin) return;
    setError(null);
    try {
      const res = await axios.get('https://biz4293.pythonanywhere.com/api/get_messages', {
        params: {
          user1: user.user_id,
          user2: admin.user_id,
        },
      });
      const formattedMessages = res.data.messages.map((msg, idx) => ({
        id: idx,
        sender: msg.sender_id === user.user_id ? 'user' : 'admin',
        text: msg.text,
        time: msg.time,
      }));
      setMessages(formattedMessages);
      markAdminAsRead(admin.user_id);
    } catch {
      setError('Failed to load messages');
      setMessages([]);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    if (!selectedAdmin) return;

    const interval = setInterval(() => {
      fetchMessages(selectedAdmin);
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedAdmin]);

  const selectAdmin = (admin) => {
    setSelectedAdmin(admin);
    fetchMessages(admin);
  };

  const markAdminAsRead = (adminUserId) => {
    setAdmins((prev) =>
      prev.map((a) =>
        a.user_id === adminUserId ? { ...a, unread_count: 0 } : a
      )
    );
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedAdmin) return;

    const newMsg = {
      id: messages.length + 1,
      sender: 'user',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([...messages, newMsg]);
    setMessage('');

    try {
      await axios.post('https://biz4293.pythonanywhere.com/api/send_messages', {
        sender_id: user.user_id,
        receiver_id: selectedAdmin.user_id,
        text: message,
      });
      await fetchMessages(selectedAdmin);
    } catch {
      setError('Failed to send message');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter admins based on search term (case insensitive)
  const filteredAdmins = admins.filter((admin) =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loadingAdmins) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8c5e3b]" />
      </div>
    );
  }

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
      <h2 className="text-2xl font-bold text-[#5a3921] mb-6">Chat with Sellers</h2>
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200 h-[600px] flex">
        {/* Admin list */}
        <div className="w-full md:w-1/3 border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search admins..."
                value={searchTerm}                         // <-- Controlled input
                onChange={(e) => setSearchTerm(e.target.value)} // <-- Update searchTerm
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#8c5e3b] focus:border-[#8c5e3b]"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
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
                    selectedAdmin?.user_id === admin.user_id ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => selectAdmin(admin)}
                >
                  <div className="relative">
                    <img
                      src={admin.profile_photo || 'https://randomuser.me/api/portraits/lego/1.jpg'}
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
                    <h3 className="text-sm font-medium text-gray-900 truncate">{admin.name}</h3>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat messages */}
        <div className="hidden md:flex flex-col w-2/3">
          {selectedAdmin ? (
            <>
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center">
                  <img
                    src={selectedAdmin.profile_photo || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                    alt={selectedAdmin.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">{selectedAdmin.name}</h3>
                    <p className="text-xs text-green-500">Online</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                          msg.sender === 'user'
                            ? 'bg-[#8c5e3b] text-white rounded-br-none'
                            : 'bg-white border border-gray-200 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p
                          className={`text-xs mt-1 text-right ${
                            msg.sender === 'user' ? 'text-gray-200' : 'text-gray-500'
                          }`}
                        >
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
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
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <div className="bg-gray-100 rounded-full p-6 mb-4">
                <MessageSquare size={48} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Select an admin</h3>
              <p className="text-gray-500 text-center">Choose an admin from the list to start chatting</p>
            </div>
          )}
        </div>

        {/* Mobile fallback */}
        <div className="flex flex-col items-center justify-center p-4 w-full md:hidden">
          <div className="bg-gray-100 rounded-full p-6 mb-4">
            <MessageSquare size={48} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Your Conversations</h3>
          <p className="text-gray-500 text-center">Select a chat from above to view your messages</p>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
