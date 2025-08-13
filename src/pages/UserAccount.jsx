import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Package, MessageSquare, User, Settings, LogOut, ChevronRight } from 'lucide-react';
// Import sub-pages
import OrdersPage from './account/OrdersPage';
import ChatPage from './account/ChatPage';
import ProfilePage from './account/ProfilePage';
import SettingsPage from './account/SettingsPage';
const UserAccount = () => {
  const {
    user,
    logout
  } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigation = [{
    name: 'Orders',
    href: '/account/orders',
    icon: Package
  }, {
    name: 'Chat with Sellers',
    href: '/account/chat',
    icon: MessageSquare
  }, {
    name: 'Profile',
    href: '/account/profile',
    icon: User
  }, {
    name: 'Settings',
    href: '/account/settings',
    icon: Settings
  }];
  const isActive = path => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  return <div className="min-h-screen bg-[#f8f5f1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Mobile menu button */}
          <div className="lg:hidden mb-6">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="w-full flex items-center justify-between px-4 py-2 bg-white rounded-md shadow">
              <span className="font-medium text-[#5a3921]">Account Menu</span>
              <ChevronRight size={20} className={`transform transition-transform ${isMobileMenuOpen ? 'rotate-90' : ''}`} />
            </button>
          </div>
          {/* Sidebar for desktop / Mobile menu */}
          <div className={`lg:col-span-3 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-20">
              <div className="p-6 bg-[#5a3921] text-white">
                <h2 className="text-xl font-bold mb-1">Welcome</h2>
                <p className="text-sm opacity-90">{user?.name || 'User'}</p>
              </div>
              <nav className="mt-2 p-2">
                {navigation.map(item => <Link key={item.name} to={item.href} className={`flex items-center px-4 py-3 rounded-md text-sm font-medium ${isActive(item.href) ? 'bg-[#f8f5f1] text-[#5a3921]' : 'text-gray-700 hover:bg-gray-100'}`} onClick={() => setIsMobileMenuOpen(false)}>
                    <item.icon size={18} className="mr-3" />
                    {item.name}
                  </Link>)}
                <button onClick={logout} className="w-full flex items-center px-4 py-3 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 mt-2">
                  <LogOut size={18} className="mr-3" />
                  Logout
                </button>
              </nav>
            </div>
          </div>
          {/* Main content */}
          <div className="lg:col-span-9 mt-6 lg:mt-0">
            <div className="bg-white rounded-lg shadow-md p-6">
              <Routes>
                <Route path="/" element={<OrdersPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default UserAccount;