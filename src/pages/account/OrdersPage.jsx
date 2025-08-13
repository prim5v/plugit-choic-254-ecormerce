import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Package, AlertCircle, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const OrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const baseImageUrl = 'https://biz4293.pythonanywhere.com/static/images/';

  const getImageSrc = (image_url) => {
    if (!image_url) {
      return 'https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    }
    if (image_url.startsWith('http')) return image_url;
    if (image_url.startsWith('/static')) return `https://biz4293.pythonanywhere.com${image_url}`;
    return baseImageUrl + image_url;
  };

  const getOrderStatusMessage = (status) => {
    switch (status) {
      case 'Pending':
        return 'Order logistics has been created';
      case 'Processing':
        return 'Your waybill has been created';
      case 'Shipped':
        return 'Package has arrived at Fargo transportation network and is shipped to your destination';
      case 'Delivered':
        return 'Order has been delivered to customer';
      case 'Returned':
        return 'Order returned by customer';
      case 'Cancelled':
        return 'Order cancelled before shipping';
      default:
        return '';
    }
  };

  useEffect(() => {
    if (!user?.user_id) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `https://biz4293.pythonanywhere.com/api/orders?user_id=${user.user_id}`
        );

        const updatedOrders = (res.data || []).map((order) => ({
          ...order,
          items: (order.items || []).map((item) => ({
            ...item,
            image_url: getImageSrc(item.image_url),
          })),
        }));

        setOrders(updatedOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 1200000);
    return () => clearInterval(interval);
  }, [user]);

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  // Navigate directly to /track-order/:orderId
  const handleTrackOrder = (order) => {
    const orderIdToUse = order?.order_id || order?.id;
    if (!orderIdToUse) {
      alert('No order id available for tracking.');
      return;
    }
    navigate(`/track-order/${encodeURIComponent(orderIdToUse)}`);
  };

  if (loading) {
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

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-medium text-[#5a3921] mb-2">No Orders Yet</h3>
        <p className="text-gray-600">You haven't placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#5a3921] mb-6">My Orders</h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <div
              className="bg-gray-50 px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer"
              onClick={() => toggleOrderDetails(order.id)}
            >
              <div>
                <div className="flex items-center">
                  <h3 className="text-lg font-medium text-[#5a3921]">Order #{order.order_id || order.id}</h3>
                  <span
                    className={`ml-3 px-2 py-1 text-xs rounded-full ${
                      order.order_status === 'Delivered'
                        ? 'bg-green-100 text-green-800'
                        : order.order_status === 'Processing'
                        ? 'bg-blue-100 text-blue-800'
                        : order.order_status === 'Shipped'
                        ? 'bg-indigo-100 text-indigo-800'
                        : order.order_status === 'Returned'
                        ? 'bg-red-100 text-red-800'
                        : order.order_status === 'Cancelled'
                        ? 'bg-gray-300 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {order.order_status || order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Placed on {new Date(order.created_at).toLocaleDateString()}
                </p>
                <p className="mt-1 text-sm text-[#8c5e3b] italic">
                  {getOrderStatusMessage(order.order_status || order.status)}
                </p>
              </div>

              <div className="flex items-center mt-2 sm:mt-0 space-x-3">
                <span className="font-medium text-[#8c5e3b] mr-3">
                  Ksh{Number(order.total_amount).toFixed(2)}
                </span>
                {expandedOrder === order.id ? (
                  <ChevronUp size={20} className="text-gray-500" />
                ) : (
                  <ChevronDown size={20} className="text-gray-500" />
                )}
              </div>
            </div>

            {expandedOrder === order.id && (
              <div className="px-4 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-700">Order Items</h4>
                  <button
                    onClick={() => handleTrackOrder(order)}
                    className="inline-flex items-center gap-2 bg-[#d4a056] hover:bg-[#c8a27c] text-white px-3 py-1 rounded-md text-sm font-medium"
                  >
                    <MapPin size={16} />
                    Track Order
                  </button>
                </div>

                <div className="space-y-4">
                  {order.items?.map((item) => (
                    <div key={item.product_id + String(item.quantity)} className="flex items-center">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <h5 className="text-sm font-medium text-[#5a3921]">{item.product_name}</h5>
                        <p className="text-sm text-gray-500 mt-1">
                          Qty: {item.quantity} × Ksh{Number(item.price).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-[#8c5e3b]">
                          Ksh{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 mt-4 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>Ksh{(order.total_amount * 0.84).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Tax</span>
                    <span>Ksh{(order.total_amount * 0.16).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between font-medium mt-2 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-[#8c5e3b]">
                      Ksh{Number(order.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
