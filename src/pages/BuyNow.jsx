import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { CreditCard, Phone, Check, AlertCircle } from "lucide-react";

const BuyNow = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { productName, amount, productId } = location.state || {};

  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const subtotal = amount || 0;
  const shipping = subtotal * 0.06;
  const total = subtotal + shipping;

  // Redirect if not logged in
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8f5f1] py-12">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#5a3921] mb-4">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please login to your account to proceed with purchase.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="bg-[#8c5e3b] hover:bg-[#5a3921] text-white px-6 py-3 rounded-md font-medium"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Poll payment status
  useEffect(() => {
    if (!checkoutRequestId) return;
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(
          `https://biz4293.pythonanywhere.com/api/order-status/${checkoutRequestId}`
        );
        const status = res.data.status;
        setPaymentStatus(status);
        if (status === "Failed" || status === "Paid") {
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Error fetching payment status:", err);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [checkoutRequestId]);

  // Redirect after success
  useEffect(() => {
    if (paymentStatus === "Paid") {
      const timer = setTimeout(() => {
        navigate("/account/orders");
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPaymentStatus(null);
    setCheckoutRequestId(null);
    setLoading(true);

    if (!phoneNumber.match(/^(?:254|\+254|0)?(7[0-9]{8}|1[0-9]{8})$/)) {
      setError("Please enter a valid phone number");
      setLoading(false);
      return;
    }

    try {
      let formattedPhone = phoneNumber.startsWith("0")
        ? "254" + phoneNumber.slice(1)
        : phoneNumber.startsWith("+254")
        ? phoneNumber.slice(1)
        : phoneNumber.startsWith("254")
        ? phoneNumber
        : "254" + phoneNumber;

      const formData = new FormData();
      formData.append("phone", formattedPhone);
      formData.append("amount", Math.round(total));
      formData.append("user_id", user.user_id);
      if (productId) formData.append("product_id", productId);

      const response = await axios.post(
        "https://biz4293.pythonanywhere.com/api/mpesa_payment",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.mpesa_response?.CheckoutRequestID) {
        setCheckoutRequestId(response.data.mpesa_response.CheckoutRequestID);
        setPaymentStatus("Pending");
      } else {
        setError(response.data.message || "Payment initiation failed.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed.");
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentStatusMessage = () => {
    if (!paymentStatus) return null;
    if (paymentStatus === "Paid") {
      return (
        <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-md flex items-center">
          <Check size={18} className="mr-2" />
          <span>Payment successful! Redirecting to your orders in 10 seconds...</span>
        </div>
      );
    }
    if (paymentStatus === "Failed") {
      return (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-md flex items-center">
          <AlertCircle size={18} className="mr-2" />
          <span>Payment failed. Please try again.</span>
        </div>
      );
    }
    if (paymentStatus === "Pending") {
      return (
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-md">
          Status: Payment pending...
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f5f1] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[#5a3921] mb-8">Buy Now</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold text-[#5a3921] mb-6">Payment Details</h2>

                {error && (
                  <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-md flex items-center">
                    <AlertCircle size={18} className="mr-2" />
                    <span>{error}</span>
                  </div>
                )}

                {renderPaymentStatusMessage()}

                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-[#5a3921]">M-Pesa Payment</h3>
                      <div className="flex items-center">
                        <CreditCard size={20} className="text-[#8c5e3b] mr-2" />
                        <span className="text-sm text-gray-600">Secure Payment</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-6">
                      Enter your phone number below to receive an M-Pesa payment prompt.
                    </p>
                    <div className="mb-6">
                      <label
                        htmlFor="phoneNumber"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone size={18} className="text-gray-400" />
                        </div>
                        <input
                          id="phoneNumber"
                          type="tel"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="e.g. 0712345678"
                          className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#8c5e3b] focus:border-[#8c5e3b]"
                          disabled={loading || (checkoutRequestId && paymentStatus === "Pending")}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Enter your phone number in the format 0712345678 or 254712345678
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-6">
                    <button
                      type="submit"
                      disabled={loading || (checkoutRequestId && paymentStatus === "Pending")}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md font-medium flex items-center justify-center disabled:opacity-50"
                    >
                      {loading ? "Processing..." : "Pay with M-Pesa"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-lg font-bold text-[#5a3921] mb-6">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">{productName || "Product"}</span>
                  <span className="font-medium">KES {subtotal.toFixed(2)}</span>
                </div>
                {/* <div className="flex justify-between">
                  <span className="text-gray-600">Tax (16%)</span>
                  <span className="font-medium">KES {tax.toFixed(2)}</span>
                </div> */}
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping (6%)</span>
                  <span className="font-medium">KES {shipping.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-[#5a3921]">Total</span>
                    <span className="text-lg font-bold text-[#8c5e3b]">KES {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BuyNow;
