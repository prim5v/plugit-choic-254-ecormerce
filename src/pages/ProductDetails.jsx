import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Heart, Share2, ArrowLeft, Star, Truck, Shield, RotateCw } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const baseImageUrl = 'https://biz4293.pythonanywhere.com/static/images/';

  // Helper to build correct image URL for frontend
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
    return baseImageUrl + image_url;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://biz4293.pythonanywhere.com/api/get_products_details/${productId}`
        );
        if (response.data) {
          setProduct(response.data);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

const handleBuyNow = () => {
  if (product) {
    navigate('/Buy-Now', {
      state: {
        productName: product.name,
        amount: product.selling_price * quantity, // Pass total price for quantity
        productId: product.id,
        quantity, // optional if you want BuyNow to know the qty
      },
    });
  }
};


  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product?.stock_quantity || 10)) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    if (quantity < (product?.stock_quantity || 10)) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#f8f5f1] p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8c5e3b]"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#f8f5f1] p-4">
        <h2 className="text-2xl font-bold text-[#5a3921] mb-4">Oops! Something went wrong</h2>
        <p className="text-gray-600 mb-6">{error || 'Product not found'}</p>
        <Link to="/" className="bg-[#8c5e3b] text-white px-6 py-2 rounded-md hover:bg-[#5a3921]">
          Return to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5f1] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/" className="text-[#8c5e3b] hover:text-[#5a3921] flex items-center text-sm">
            <ArrowLeft size={16} className="mr-1" /> Back to products
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Product Image */}
            <div className="flex flex-col">
              <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center h-80 mb-4">
                <img
                  src={getImageSrc(product.image_url)}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="flex justify-between">
                <button className="flex items-center text-gray-500 hover:text-[#8c5e3b]">
                  <Heart size={18} className="mr-1" /> Add to Wishlist
                </button>
                <button className="flex items-center text-gray-500 hover:text-[#8c5e3b]">
                  <Share2 size={18} className="mr-1" /> Share
                </button>
              </div>
            </div>
            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold text-[#5a3921] mb-2">{product.name}</h1>
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="ml-2 text-gray-600 text-sm">(24 reviews)</span>
              </div>
              <p className="text-2xl font-bold text-[#8c5e3b] mb-4">KES{product.selling_price}</p>
              <p className="text-gray-600 mb-6">
                {product.description ||
                  'Experience premium sound quality with these state-of-the-art electronic gadgets.'}
              </p>
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">Brand</h3>
                <p>{product.brand}</p>
              </div>
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">Availability</h3>
                <p className={product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                  {product.stock_quantity > 0
                    ? `In Stock (${product.stock_quantity} available)`
                    : 'Out of Stock'}
                </p>
              </div>
              {/* Quantity Selector */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">Quantity</h3>
                <div className="flex items-center">
                  <button
                    onClick={decrementQuantity}
                    className="bg-gray-200 px-3 py-1 rounded-l-md"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock_quantity || 10}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-16 text-center border-t border-b border-gray-300 py-1"
                  />
                  <button
                    onClick={incrementQuantity}
                    className="bg-gray-200 px-3 py-1 rounded-r-md"
                    disabled={quantity >= (product.stock_quantity || 10)}
                  >
                    +
                  </button>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-8">
                <button
                  onClick={handleAddToCart}
                  className="bg-[#8c5e3b] hover:bg-[#5a3921] text-white px-8 py-3 rounded-md font-medium flex items-center justify-center"
                  disabled={product.stock_quantity <= 0}
                >
                  <ShoppingCart size={18} className="mr-2" /> Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="bg-[#d4a056] hover:bg-[#c8a27c] text-white px-8 py-3 rounded-md font-medium text-center"
                  disabled={product.stock_quantity <= 0}
                >
                  Buy Now
                </button>
              </div>
              {/* Product Features */}
              <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <Truck size={20} className="text-[#8c5e3b] mr-2" />
                    <span className="text-sm">Free Shipping</span>
                  </div>
                  <div className="flex items-center">
                    <Shield size={20} className="text-[#8c5e3b] mr-2" />
                    <span className="text-sm">1 Year Warranty</span>
                  </div>
                  <div className="flex items-center">
                    <RotateCw size={20} className="text-[#8c5e3b] mr-2" />
                    <span className="text-sm">30-Day Returns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Product Details Tabs */}
        <div className="mt-10 bg-white rounded-lg shadow-lg p-6">
          <div className="border-b border-gray-200 mb-6">
            <div className="flex overflow-x-auto">
              <button className="px-6 py-3 border-b-2 border-[#8c5e3b] text-[#8c5e3b] font-medium">
                Description
              </button>
              <button className="px-6 py-3 text-gray-500 font-medium">Specifications</button>
              <button className="px-6 py-3 text-gray-500 font-medium">Reviews</button>
            </div>
          </div>
          <div>
            <p className="text-gray-600 mb-4">
              {product.description ||
                'Experience the ultimate in sound quality with our premium electronic gadgets.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
