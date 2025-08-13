import React, { useEffect, useState } from "react";
import axios from "axios";
import { AlertCircle, ChevronDown, ChevronUp, Edit, Save } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const OrderManagement = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [activeStatus, setActiveStatus] = useState("Pending");

  // Track new message input per order for posting tracking updates
  const [newMessages, setNewMessages] = useState({});
  const [postingMessage, setPostingMessage] = useState(false);

  const baseImageUrl = "https://biz4293.pythonanywhere.com/static/images/";

  const getImageSrc = (url) => {
    if (!url) return "https://via.placeholder.com/150";
    if (url.startsWith("http")) return url;
    if (url.startsWith("/static"))
      return `https://biz4293.pythonanywhere.com${url}`;
    return baseImageUrl + url;
  };

  // Sample suggestion messages for quick replies
  const suggestionMessages = [
    "Order has been received and is being processed.",
    "Your package has been packed and is ready for shipment.",
    "Order is out for delivery and will arrive soon.",
    "Payment has been confirmed successfully.",
    "Your order has been shipped.",
    "Thank you for your patience. Your order is on the way!",
  ];

  const fetchOrders = async () => {
    if (!user || user.role !== "admin") {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        "https://biz4293.pythonanywhere.com/api/admin_get_orders"
      );
      setOrders(res.data.orders || []);
    } catch (err) {
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const toggleOrderDetails = (order_id) => {
    setExpandedOrder(expandedOrder === order_id ? null : order_id);
  };

  const handleStatusUpdate = async (order_id) => {
    try {
      await axios.patch(
        `https://biz4293.pythonanywhere.com/api/update_order_status/${order_id}`,
        { status: newStatus }
      );
      setEditingStatus(null);
      fetchOrders();
    } catch {
      alert("Failed to update status");
    }
  };

  const handlePostUpdate = async (order_id) => {
    const message = newMessages[order_id];
    if (!message || message.trim() === "") {
      alert("Please enter a message");
      return;
    }
    setPostingMessage(true);
    try {
      await axios.post(
        "https://biz4293.pythonanywhere.com/api/order_updates",
        { order_id: order_id, message }
      );
      alert("Update posted successfully!");
      setNewMessages((prev) => ({ ...prev, [order_id]: "" }));
      fetchOrders();
    } catch {
      alert("Failed to post update");
    } finally {
      setPostingMessage(false);
    }
  };

  const statusTabs = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Returned",
    "Cancelled",
  ];

  const filteredOrders = orders.filter((o) => o.order_status === activeStatus);

  if (loading)
    return <div className="flex justify-center p-6">Loading...</div>;

  if (error)
    return (
      <div className="p-4 bg-red-50 rounded-md text-red-700 flex items-center">
        <AlertCircle size={20} className="mr-2" /> {error}
      </div>
    );

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#5a3921] mb-6">
        Order Management
      </h2>

      {/* Status Navbar */}
      <div className="flex gap-3 mb-6 border-b overflow-x-auto">
        {statusTabs.map((status) => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeStatus === status
                ? "border-b-2 border-[#5a3921] text-[#5a3921]"
                : "text-gray-500 hover:text-[#5a3921]"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          No orders found for "{activeStatus}".
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.order_id} className="border rounded-lg">
              <div
                className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
                onClick={() => toggleOrderDetails(order.order_id)}
              >
                <div>
                  <h3 className="text-lg font-medium text-[#5a3921]">
                    #{order.order_id} — {order.customer_name || "Unknown"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Placed on {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {editingStatus === order.order_id ? (
                    <>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                      >
                        {statusTabs.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleStatusUpdate(order.order_id)}
                        className="bg-green-500 text-white px-2 py-1 rounded flex items-center"
                      >
                        <Save size={14} className="mr-1" /> Save
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                        {order.order_status}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingStatus(order.order_id);
                          setNewStatus(order.order_status);
                        }}
                        className="text-blue-500 flex items-center text-sm"
                      >
                        <Edit size={14} className="mr-1" /> Edit
                      </button>
                    </>
                  )}
                  {expandedOrder === order.order_id ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>
              </div>

              {expandedOrder === order.order_id && (
                <div className="px-4 py-3 border-t space-y-4">
                  {/* Customer Info */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">
                      Customer Info
                    </h4>
                    <p className="text-sm">Name: {order.customer_name || "N/A"}</p>
                    <p className="text-sm">Email: {order.email || "N/A"}</p>
                    <p className="text-sm">
                      Phone: {order.user_phone || order.order_phone}
                    </p>
                    <p className="text-sm">ID number: {order.id_number || "N/A"}</p>
                    <p className="text-sm">Address: {order.address || "N/A"}</p>
                  </div>

                  {/* Items */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Items</h4>
                    {order.items?.length > 0 ? (
                      order.items.map((item) => (
                        <div
                          key={item.product_id}
                          className="flex items-center mb-2"
                        >
                          <img
                            src={getImageSrc(item.image_url)}
                            alt={item.product_name}
                            className="h-12 w-12 object-cover rounded border"
                          />
                          <div className="ml-3 flex-1">
                            <p className="text-sm">{item.product_name}</p>
                            <p className="text-xs text-gray-500">
                              Qty: {item.quantity} × Ksh{item.price}
                            </p>
                          </div>
                          <p className="text-sm font-medium text-[#8c5e3b]">
                            Ksh{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No items</p>
                    )}
                  </div>

                  {/* Transaction Info */}
                  <div>
                    <h4 className="font-medium text-gray-700">Transaction Info</h4>
                    <p className="text-sm">Payment Method: {order.payment_method}</p>
                    <p className="text-sm">
                      Transaction ID: {order.transaction_id || "N/A"}
                    </p>
                    <p className="text-sm">
                      Payment Status: {order.payment_status || "N/A"}
                    </p>
                  </div>

                  {/* Post Tracking Update */}
                  {user.role === "admin" && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-700 mb-2">
                        Post Tracking Update
                      </h4>
                      <textarea
                        rows={3}
                        className="w-full border rounded p-2 resize-none"
                        placeholder="Enter status update message"
                        value={newMessages[order.order_id] || ""}
                        onChange={(e) =>
                          setNewMessages((prev) => ({
                            ...prev,
                            [order.order_id]: e.target.value,
                          }))
                        }
                        disabled={postingMessage}
                      ></textarea>
                      {/* Suggestion messages below textarea */}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {suggestionMessages.map((msg, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() =>
                              setNewMessages((prev) => ({
                                ...prev,
                                [order.order_id]: msg,
                              }))
                            }
                            className="px-3 py-1 bg-gray-200 rounded-full text-sm hover:bg-gray-300"
                          >
                            {msg}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => handlePostUpdate(order.order_id)}
                        disabled={postingMessage}
                        className="mt-2 bg-[#5a3921] text-white px-4 py-2 rounded hover:bg-[#432a19] disabled:opacity-50"
                      >
                        {postingMessage ? "Posting..." : "Post Update"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
