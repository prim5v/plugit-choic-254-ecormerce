import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const baseImageUrl = 'https://biz4293.pythonanywhere.com/static/images/';

  // Helper to build correct image URL
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

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link to={`/product/${product.product_id}`} className="block">
        <div className="relative h-48 overflow-hidden">
          <img
            src={getImageSrc(product.image_url)}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
          <button
            className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow hover:bg-gray-100"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Favorite functionality would go here
            }}
          >
            <Heart size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="p-4">
          <h3 className="text-[#5a3921] font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
          <p className="text-gray-500 text-sm mb-2">{product.brand}</p>
          <p className="text-[#8c5e3b] font-bold text-xl mb-3">Ksh{product.selling_price}</p>
          <div className="flex justify-between items-center">
            <button
              onClick={handleAddToCart}
              className="bg-[#8c5e3b] hover:bg-[#5a3921] text-white px-3 py-2 rounded-md flex items-center text-sm"
            >
              <ShoppingCart size={16} className="mr-1" /> Add to Cart
            </button>
            <Link
              to={`/product/${product.product_id}`}
              className="text-[#8c5e3b] hover:text-[#5a3921] text-sm font-medium"
            >
              View Details
            </Link>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
