import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

const Cart = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    calculateTotal,
    clearCart,   // <-- clearCart function
  } = useCart();

  const total = calculateTotal();

  const baseImageUrl = 'https://biz4293.pythonanywhere.com/static/images/';

  // Helper to build correct image URL for cart item images
  const getImageSrc = (image_url) => {
    if (!image_url) {
      return 'https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    }
    if (image_url.startsWith('http')) {
      return image_url;
    }
    if (image_url.startsWith('/static')) {
      return `https://biz4293.pythonanywhere.com${image_url}`;
    }
    // treat as filename
    return baseImageUrl + image_url;
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8f5f1] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-gray-100 rounded-full p-4">
                <ShoppingBag size={48} className="text-gray-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-[#5a3921] mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Link
              to="/"
              className="bg-[#8c5e3b] hover:bg-[#5a3921] text-white px-6 py-3 rounded-md font-medium inline-flex items-center"
            >
              Continue Shopping <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5f1] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[#5a3921] mb-8">Your Shopping Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                {cartItems.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex flex-col sm:flex-row items-center py-6 border-b border-gray-200 last:border-b-0"
                  >
                    {/* Product Image */}
                    <div className="sm:w-24 h-24 flex-shrink-0 mb-4 sm:mb-0">
                      <img
                        src={getImageSrc(item.image_url)}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    {/* Product Info */}
                    <div className="sm:ml-6 flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-[#5a3921]">{item.name}</h3>
                          <p className="text-sm text-gray-500">{item.brand}</p>
                        </div>
                        <p className="text-lg font-bold text-[#8c5e3b] mt-2 sm:mt-0">
                          KES{item.selling_price}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between items-center mt-4">
                        {/* Quantity Selector */}
                        <div className="flex items-center mb-4 sm:mb-0">
                          <span className="text-gray-600 mr-3">Quantity:</span>
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button
                              onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="px-3 py-1 text-center w-10">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="flex items-center text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} className="mr-1" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-lg font-bold text-[#5a3921] mb-6">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Subtotal ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} items)
                  </span>
                  <span className="font-medium">KES{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">KES{(total * 0.16).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-[#5a3921]">Total</span>
                    <span className="text-lg font-bold text-[#8c5e3b]">KES{(total * 1.16).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Link
                to="/checkout"
                className="mt-6 w-full bg-[#8c5e3b] hover:bg-[#5a3921] text-white py-3 px-4 rounded-md font-medium flex items-center justify-center"
              >
                Proceed to Checkout <ArrowRight size={16} className="ml-2" />
              </Link>

              {/* Clear Cart Button */}
              <button
                onClick={clearCart}
                className="mt-4 w-full bg-[#5a3921] hover:bg-[#3d2e19] text-white py-3 px-4 rounded-md font-medium flex items-center justify-center"
              >
                Clear Cart
              </button>

              <Link
                to="/"
                className="mt-4 w-full text-[#8c5e3b] hover:text-[#5a3921] py-3 px-4 rounded-md font-medium flex items-center justify-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
