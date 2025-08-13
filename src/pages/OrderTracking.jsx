import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  AlertCircle,
  Loader,
  ClipboardList,
  Truck,
  Package,
  CheckCircle,
} from 'lucide-react';

const steps = [
  { label: 'Ordered', icon: ClipboardList },
  { label: 'Processing', icon: Package },
  { label: 'Shipped', icon: Truck },
  { label: 'Delivered', icon: CheckCircle },
];

const terminalStates = ['Cancelled', 'Returned'];

const OrderTracking = () => {
  const { order_id } = useParams();
  const [updates, setUpdates] = useState([]);
  const [status, setStatus] = useState('');
  const [loadingUpdates, setLoadingUpdates] = useState(false);
  const [updatesError, setUpdatesError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!order_id) {
      setUpdatesError('No order ID provided.');
      return;
    }

    const fetchUpdates = async () => {
      setLoadingUpdates(true);
      setUpdatesError('');
      try {
        const updatesRes = await axios.get(
          `https://biz4293.pythonanywhere.com/api/order_updates/${order_id}`
        );
        if (Array.isArray(updatesRes.data)) {
          setUpdates(updatesRes.data);
        } else if (
          updatesRes.data.success &&
          Array.isArray(updatesRes.data.updates)
        ) {
          setUpdates(updatesRes.data.updates);
        }

        const orderRes = await axios.get(
          `https://biz4293.pythonanywhere.com/api/admin_get_orders`
        );
        const foundOrder = orderRes.data.orders.find(
          (o) => o.order_id === order_id
        );
        if (foundOrder) {
          setStatus(foundOrder.order_status);
        } else {
          setUpdatesError('Order not found.');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setUpdatesError('Failed to load order data.');
      } finally {
        setLoadingUpdates(false);
      }
    };

    fetchUpdates();
  }, [order_id]);

  const currentStepIndex = steps.findIndex((s) => s.label === status);

  const getStepClass = (stepLabel) => {
    if (stepLabel === 'Ordered') return 'text-[#6f4e37] font-semibold';
    const stepIndex = steps.findIndex((s) => s.label === stepLabel);
    return stepIndex <= currentStepIndex
      ? 'text-[#6f4e37] font-semibold'
      : 'text-gray-400';
  };

  const getCircleClass = (stepLabel) => {
    const stepIndex = steps.findIndex((s) => s.label === stepLabel);
    const baseStyle =
      'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300';

    // Always highlight "Ordered"
    if (stepLabel === 'Ordered') {
      return `${baseStyle} bg-[#6f4e37] text-white`;
    }

    const completed = stepIndex < currentStepIndex;
    const current = stepIndex === currentStepIndex;

    if (completed) {
      return `${baseStyle} bg-[#6f4e37] text-white`;
    } else if (current) {
      return `${baseStyle} bg-[#6f4e37] text-white ring-4 ring-[#d3b8a3] shadow-md`;
    } else {
      return `${baseStyle} bg-[#d3b8a3] text-white`;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f5f1] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#5a3921]">Package Tracking</h1>
        </div>

        {/* Status Bar */}
        {!loadingUpdates && status && !terminalStates.includes(status) && (
          <div className="mb-12 relative flex justify-between items-center">
            {steps.map(({ label, icon: Icon }, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center relative z-10">
                  <div className={getCircleClass(label)}>
                    <Icon size={24} />
                  </div>
                  <p
                    className={`mt-2 text-sm font-handwriting ${getStepClass(label)}`}
                  >
                    {label}
                  </p>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className="absolute top-6 left-0 right-0 mx-auto"
                    style={{
                      width: 'calc(100% - 96px)',
                      left: '48px',
                      zIndex: 0,
                      height: '4px',
                    }}
                  >
                    <div className="absolute top-0 left-0 h-full w-full bg-[#d3b8a3] rounded-full" />
                    <div
                      className="absolute top-0 left-0 rounded-full transition-all duration-700 ease-in-out"
                      style={{
                        width:
                          currentStepIndex > index
                            ? '100%'
                            : currentStepIndex === index
                            ? '50%'
                            : '0%',
                        height:
                          currentStepIndex >= index ? '4px' : '2px',
                        background:
                          currentStepIndex >= index
                            ? 'linear-gradient(to right, #8c5e3b, #6f4e37)'
                            : '#d3b8a3',
                      }}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Terminal Status */}
        {!loadingUpdates && terminalStates.includes(status) && (
          <div className="mb-6 p-5 bg-red-100 text-red-700 rounded-md text-center">
            <p className="text-lg font-semibold">Order {status}</p>
          </div>
        )}

        {/* Error Message */}
        {updatesError && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md flex items-center">
            <AlertCircle size={18} className="mr-2" />
            <span>{updatesError}</span>
          </div>
        )}

        {/* Updates */}
        {loadingUpdates ? (
          <div className="mb-6 flex justify-center items-center text-[#8c5e3b]">
            <Loader size={24} className="animate-spin mr-2" />
            Loading updates...
          </div>
        ) : updates.length > 0 ? (
          <div className="space-y-4">
            {updates.map((update, idx) => (
              <div
                key={idx}
                className="bg-gray-50 p-4 rounded-md shadow-sm block"
              >
                <p className="font-medium">{update.message}</p>
                <p className="text-sm text-gray-500">
                  {new Date(update.timestamp).toLocaleString(undefined, {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No updates yet.</p>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <button
            onClick={() => navigate('/account/orders')}
            className="bg-[#8c5e3b] hover:bg-[#5a3921] text-white px-6 py-3 rounded-md font-medium"
          >
            View All Orders
          </button>
          <button
            onClick={() => navigate('/')}
            className="border border-[#8c5e3b] text-[#8c5e3b] hover:bg-[#f8f5f1] px-6 py-3 rounded-md font-medium"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
