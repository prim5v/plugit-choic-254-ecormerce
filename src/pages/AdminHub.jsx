import React, { useState } from 'react';
import AddProduct from './Addproduct';
import OrderManagement from './OrderManagement';  
import UserManagement from './UserManagement';
import SupportCommunication from './SupportCommunication';

const AdminHub = () => {
  const [activeSection, setActiveSection] = useState('userManagement');

  return (
    <div className="min-h-screen flex bg-[#f8f5f1]">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-[#5a3921]">Admin Hub</h1>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          <button
            onClick={() => setActiveSection('userManagement')}
            className={`w-full text-left px-4 py-3 rounded-md font-medium ${
              activeSection === 'userManagement'
                ? 'bg-[#8c5e3b] text-white'
                : 'text-[#5a3921] hover:bg-[#f0e6da]'
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveSection('orderManagement')}
            className={`w-full text-left px-4 py-3 rounded-md font-medium ${
              activeSection === 'orderManagement'
                ? 'bg-[#8c5e3b] text-white'
                : 'text-[#5a3921] hover:bg-[#f0e6da]'
            }`}
          >
            Order Management
          </button>
          <button
            onClick={() => setActiveSection('supportCommunication')}
            className={`w-full text-left px-4 py-3 rounded-md font-medium ${
              activeSection === 'supportCommunication'
                ? 'bg-[#8c5e3b] text-white'
                : 'text-[#5a3921] hover:bg-[#f0e6da]'
            }`}
          >
            Support & Communication
          </button>
          <button
            onClick={() => setActiveSection('addProduct')}
            className={`w-full text-left px-4 py-3 rounded-md font-medium ${
              activeSection === 'addProduct'
                ? 'bg-[#8c5e3b] text-white'
                : 'text-[#5a3921] hover:bg-[#f0e6da]'
            }`}
          >
            Add Products
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-grow p-10 overflow-auto">
        {activeSection === 'userManagement' && <UserManagement />}
        {activeSection === 'orderManagement' && <OrderManagement />}
        {activeSection === 'supportCommunication' && <SupportCommunication />}
        {activeSection === 'addProduct' && <AddProduct />}
      </main>
    </div>
  );
};

export default AdminHub;
