import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Get user from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Load cart from local storage on initial render
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  // Fetch user's cart from API if logged in
  useEffect(() => {
    if (user) {
      fetchUserCart();
    }
  }, [user]);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Normalize a product/cart item from backend or frontend product object
  const normalizeItem = (item) => ({
    ...item,
    product_id: item.product_id,
    product_name: item.product_name || item.name || 'Unnamed Product',
    price: parseFloat(item.price || item.selling_price || 0),
    selling_price: parseFloat(item.price || item.selling_price || 0),
    quantity: item.quantity || 1,
    image_url: item.image_url || item.image || '',
  });

  // Fetch user's cart from backend and normalize data
  const fetchUserCart = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await axios.get(`https://biz4293.pythonanywhere.com/api/cart/${user.user_id}`);
      if (response.data && Array.isArray(response.data)) {
        const normalizedItems = response.data.map(normalizeItem);
        setCartItems(normalizedItems);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart with full payload as backend expects
  const addToCart = async (product, quantity) => {
    const normalizedProduct = normalizeItem(product);

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product_id === normalizedProduct.product_id);
      if (existingItem) {
        return prevItems.map(item =>
          item.product_id === normalizedProduct.product_id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { ...normalizedProduct, quantity }];
      }
    });

    if (user) {
      try {
        await axios.post('https://biz4293.pythonanywhere.com/api/cart/add', {
          user_id: user.user_id,
          product_id: normalizedProduct.product_id,
          product_name: normalizedProduct.product_name,
          price: normalizedProduct.price,
          quantity,
          image_url: normalizedProduct.image_url,
        });
        await fetchUserCart();
      } catch (error) {
        console.error('Error adding item to cart on backend:', error.response || error.message);
      }
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, quantity) => {
    const cartItem = cartItems.find(item => item.product_id === productId);
    if (!cartItem) return;

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.product_id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );

    if (user && cartItem.id) {
      try {
        await axios.put(`https://biz4293.pythonanywhere.com/api/cart/update/${cartItem.id}`, {
          quantity: Math.max(1, quantity),
        });
      } catch (error) {
        console.error('Error updating cart item quantity on backend:', error);
      }
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    const cartItem = cartItems.find(item => item.product_id === productId);
    if (!cartItem) return;

    setCartItems(prevItems => prevItems.filter(item => item.product_id !== productId));

    if (user && cartItem.id) {
      try {
        await axios.delete(`https://biz4293.pythonanywhere.com/api/cart/delete/${cartItem.id}`);
      } catch (error) {
        console.error('Error removing item from cart on backend:', error);
      }
    }
  };

  // Clear entire cart for user
  const clearCart = async () => {
    setCartItems([]);
    if (user) {
      try {
        await axios.delete(`https://biz4293.pythonanywhere.com/api/cart/clear/${user.user_id}`);
      } catch (error) {
        console.error('Error clearing cart on backend:', error);
      }
    }
  };

  // Sync local cart with backend when user logs in (optional)
  const syncCartWithBackend = async () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return;
    const userObj = JSON.parse(storedUser);
    setUser(userObj);

    try {
      const localCartItems = [...cartItems];
      if (localCartItems.length > 0) {
        const addPromises = localCartItems.map(item =>
          axios.post('https://biz4293.pythonanywhere.com/api/cart/add', {
            user_id: userObj.user_id,
            product_id: item.product_id,
            product_name: item.product_name,
            price: item.price,
            quantity: item.quantity,
            image_url: item.image_url,
          })
        );
        await Promise.all(addPromises);
      }
      fetchUserCart();
    } catch (error) {
      console.error('Error syncing cart with backend:', error);
    }
  };

  // Logout and reset cart/user state
const logout = async () => {
  // Do NOT call the backend to clear cart here
  // Just clear client-side data:
  
  localStorage.removeItem('cart');
  localStorage.removeItem('user');

  setCartItems([]);
  setUser(null);
};


  // Calculate total price from cart
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.selling_price * item.quantity, 0);
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    calculateTotal,
    syncCartWithBackend,
    logout, // 🔥 exposed logout function
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
