import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Search,
  LogOut,
  Package,
  MessageSquare,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Navbar = () => {
  const { user, logout: authLogout } = useAuth();       // renamed
  const { cartItems, logout: cartLogout } = useCart();  // renamed

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const accountDropdownRef = useRef(null);
  const navigate = useNavigate();

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const handleClickOutside = event => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
        setIsAccountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleAccountDropdown = () => {
    setIsAccountDropdownOpen(!isAccountDropdownOpen);
  };

  const handleLogout = async () => {
    await authLogout();
    await cartLogout();
    setIsAccountDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img
                src="/528819492_1144764417483656_3381559210680013388_n.jpg"
                alt="Home Logo"
                className="h-8 w-8 rounded-full mr-2"
              />
              <span className="text-[#5a3921] font-bold text-xl">Plug.It.Choice_254</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link to="/" className="text-[#8c5e3b] hover:text-[#5a3921] px-3 py-2 rounded-md text-sm font-medium">Home</Link>
            <Link to="/products" className="text-[#8c5e3b] hover:text-[#5a3921] px-3 py-2 rounded-md text-sm font-medium">Products</Link>
            {user?.role === 'admin' && (
              <Link to="/admin-hub" className="text-[#8c5e3b] hover:text-[#5a3921] px-3 py-2 rounded-md text-sm font-medium">
                Admin Hub
              </Link>
            )}
            <Link to="/about" className="text-[#8c5e3b] hover:text-[#5a3921] px-3 py-2 rounded-md text-sm font-medium">About</Link>
            <Link to="/contact" className="text-[#8c5e3b] hover:text-[#5a3921] px-3 py-2 rounded-md text-sm font-medium">Contact</Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            {/* Search (desktop) */}
            <div className="hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="bg-gray-100 rounded-full py-1 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#8c5e3b] w-48"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>

            {/* Account Dropdown */}
            <div className="relative" ref={accountDropdownRef}>
              <button onClick={toggleAccountDropdown} className="flex items-center text-[#8c5e3b] hover:text-[#5a3921] focus:outline-none">
                <User size={20} className="mr-1" />
                <span className="hidden md:inline text-sm font-medium">{user ? user.name : 'Account'}</span>
              </button>
              {isAccountDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  {user ? (
                    <>
                      <Link
                        to="/account/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => setIsAccountDropdownOpen(false)}
                      >
                        <Package size={16} className="mr-2" />
                        User Hub
                      </Link>
                      {/* <Link
                        to="/track-order"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => setIsAccountDropdownOpen(false)}
                      >
                        <MapPin size={16} className="mr-2" />
                        Track Order
                      </Link> */}
                      {/* <Link
                        to="/account/chat"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => setIsAccountDropdownOpen(false)}
                      >
                        <MessageSquare size={16} className="mr-2" />
                        Chat with Sellers
                      </Link> */}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <LogOut size={16} className="mr-2" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      className="block px-4 py-2 text-sm text-white bg-green-500 hover:bg-green-600 text-center rounded-md mx-2"
                      onClick={() => setIsAccountDropdownOpen(false)}
                    >
                      Login
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <Link to="/cart" className="text-[#8c5e3b] hover:text-[#5a3921] relative">
              <ShoppingCart size={20} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button onClick={toggleMenu} className="md:hidden text-[#8c5e3b] hover:text-[#5a3921] focus:outline-none">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-[#8c5e3b] hover:text-[#5a3921] hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/products" className="block px-3 py-2 rounded-md text-base font-medium text-[#8c5e3b] hover:text-[#5a3921] hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Products</Link>
          {/* {user?.role === 'admin' && (
            <Link to="/add-product" className="block px-3 py-2 rounded-md text-base font-medium text-[#8c5e3b] hover:text-[#5a3921] hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Add Products</Link>
          )}
          <Link to="/track-order" className="block px-3 py-2 rounded-md text-base font-medium text-[#8c5e3b] hover:text-[#5a3921] hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Track Order</Link> */}
          <Link to="/about" className="block px-3 py-2 rounded-md text-base font-medium text-[#8c5e3b] hover:text-[#5a3921] hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>About us</Link>
          <Link to="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-[#8c5e3b] hover:text-[#5a3921] hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Contact</Link>
          <div className="relative mt-3 px-3">
            <input
              type="text"
              placeholder="Search products..."
              className="bg-gray-100 rounded-full py-2 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#8c5e3b] w-full"
            />
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
