import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
const Footer = () => {
  return <footer className="bg-[#5a3921] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <img src="/528819492_1144764417483656_3381559210680013388_n.jpg" alt="Home Logo" className="h-10 w-10 rounded-full mr-2 bg-white" />
              <span className="font-bold text-xl">Plug.It.Choice_254</span>
            </div>
            <p className="text-sm text-gray-300 mb-4">
              Your one-stop shop for premium electronic gadgets. Quality
              products at affordable prices.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-[#d4a056]">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white hover:text-[#d4a056]">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-white hover:text-[#d4a056]">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          <div className="col-span-1">
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-1">
            <h3 className="font-semibold text-lg mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products?category=smartphones" className="text-gray-300 hover:text-white">
                  Smartphones
                </Link>
              </li>
              <li>
                <Link to="/products?category=laptops" className="text-gray-300 hover:text-white">
                  Laptops
                </Link>
              </li>
              <li>
                <Link to="/products?category=earbuds" className="text-gray-300 hover:text-white">
                  Earbuds
                </Link>
              </li>
              <li>
                <Link to="/products?category=accessories" className="text-gray-300 hover:text-white">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-1">
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Phone size={16} className="mr-2" />
                <span className="text-gray-300">+254 712 345 678</span>
              </li>
              <li className="flex items-center">
                <Mail size={16} className="mr-2" />
                <span className="text-gray-300">info@plugitchoice254.com</span>
              </li>
              <li className="flex items-start">
                <MapPin size={16} className="mr-2 mt-1" />
                <span className="text-gray-300">Nairobi, Kenya</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
          <p>
            © {new Date().getFullYear()} Plug.It.Choice_254. All rights
            reserved.
          </p>
          <p className="mt-1">powered by home</p>
        </div>
      </div>
    </footer>;
};
export default Footer;