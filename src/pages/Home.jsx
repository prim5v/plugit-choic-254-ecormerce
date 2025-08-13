import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { ChevronRight, ChevronLeft } from 'lucide-react';
const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('https://biz4293.pythonanywhere.com/api/get_products');
        if (response.data && Array.isArray(response.data)) {
          // Get featured products (first 4 products)
          setFeaturedProducts(response.data.slice(0, 4));
          // Get new arrivals (next 8 products)
          setNewArrivals(response.data.slice(4, 12));
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);
  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % carouselItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  const carouselItems = [{
    id: 1,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    title: 'Premium Headphones',
    description: 'Experience crystal clear sound with our premium headphones',
    link: '/products?category=headphones'
  }, {
    id: 2,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    title: 'Smart Watches',
    description: 'Stay connected with our latest smartwatches',
    link: '/products?category=smartwatches'
  }, {
    id: 3,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    title: 'Wireless Earbuds',
    description: 'True wireless freedom with exceptional sound quality',
    link: '/products?category=earbuds'
  }];
  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % carouselItems.length);
  };
  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + carouselItems.length) % carouselItems.length);
  };
  return <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />
      {/* Custom Carousel Implementation */}
      <section className="py-8 px-4 max-w-7xl mx-auto">
        <div className="rounded-lg overflow-hidden shadow-xl relative">
          {/* Current Slide */}
          <div className="relative">
            <img src={carouselItems[currentSlide].image} alt={carouselItems[currentSlide].title} className="h-[400px] w-full object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-start justify-end p-8 text-left">
              <h2 className="text-white text-3xl font-bold mb-2">
                {carouselItems[currentSlide].title}
              </h2>
              <p className="text-white text-lg mb-4">
                {carouselItems[currentSlide].description}
              </p>
              <Link to={carouselItems[currentSlide].link} className="bg-[#d4a056] hover:bg-[#c8a27c] text-white px-6 py-2 rounded-md inline-flex items-center">
                Shop Now <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
          </div>
          {/* Navigation Buttons */}
          <button onClick={prevSlide} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 text-gray-800">
            <ChevronLeft size={24} />
          </button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 text-gray-800">
            <ChevronRight size={24} />
          </button>
          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {carouselItems.map((_, index) => <button key={index} onClick={() => setCurrentSlide(index)} className={`w-3 h-3 rounded-full ${index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'}`} />)}
          </div>
        </div>
      </section>
      {/* Featured Products */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#5a3921]">
            Featured Products
          </h2>
          <Link to="/products" className="text-[#8c5e3b] hover:text-[#5a3921] flex items-center">
            View all <ChevronRight size={16} />
          </Link>
        </div>
        {loading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>)}
          </div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => <ProductCard key={product.product_id} product={product} />)}
          </div>}
      </section>
      {/* Coffee Theme Banner */}
      <section className="py-16 coffee-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Experience Tech with a Coffee Break
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Browse our premium electronic gadgets while enjoying your favorite
            coffee. The perfect blend of technology and comfort.
          </p>
          <Link to="/products" className="bg-white text-[#5a3921] hover:bg-[#f8f5f1] px-8 py-3 rounded-md font-medium">
            Explore Our Collection
          </Link>
        </div>
      </section>
      {/* New Arrivals */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#5a3921]">New Arrivals</h2>
          <Link to="/products?sort=newest" className="text-[#8c5e3b] hover:text-[#5a3921] flex items-center">
            View all <ChevronRight size={16} />
          </Link>
        </div>
        {loading ? <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>)}
          </div> : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newArrivals.map(product => <ProductCard key={product.product_id} product={product} />)}
          </div>}
      </section>
    </div>;
};
export default Home;