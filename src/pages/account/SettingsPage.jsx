import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, Bell, Shield, AlertCircle, Check } from 'lucide-react';
const SettingsPage = () => {
  const {
    user
  } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(true);
  const handlePasswordSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }
    try {
      // This would be an actual API call to update the password
      // For now, we'll just simulate a successful update
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      }, 1000);
    } catch (err) {
      setError('Failed to update password. Please try again.');
      setLoading(false);
    }
  };
  return <div>
      <h2 className="text-2xl font-bold text-[#5a3921] mb-6">
        Account Settings
      </h2>
      {error && <div className="mb-6 p-4 bg-red-50 rounded-md text-red-700 flex items-center">
          <AlertCircle size={18} className="mr-2" />
          <span>{error}</span>
        </div>}
      {success && <div className="mb-6 p-4 bg-green-50 rounded-md text-green-700 flex items-center">
          <Check size={18} className="mr-2" />
          <span>Password updated successfully!</span>
        </div>}
      {/* Password Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex items-center mb-4">
          <Lock size={20} className="text-[#8c5e3b] mr-2" />
          <h3 className="text-lg font-medium text-[#5a3921]">
            Change Password
          </h3>
        </div>
        <form onSubmit={handlePasswordSubmit}>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input id="currentPassword" name="currentPassword" type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#8c5e3b] focus:border-[#8c5e3b]" />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input id="newPassword" name="newPassword" type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#8c5e3b] focus:border-[#8c5e3b]" />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input id="confirmPassword" name="confirmPassword" type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#8c5e3b] focus:border-[#8c5e3b]" />
            </div>
            <div className="pt-2">
              <button type="submit" disabled={loading} className="bg-[#8c5e3b] hover:bg-[#5a3921] text-white py-2 px-4 rounded-md font-medium disabled:opacity-50">
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        </form>
      </div>
      {/* Notifications Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex items-center mb-4">
          <Bell size={20} className="text-[#8c5e3b] mr-2" />
          <h3 className="text-lg font-medium text-[#5a3921]">
            Notification Preferences
          </h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-700">
                Email Notifications
              </h4>
              <p className="text-xs text-gray-500">
                Receive order updates and shipping notifications
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#8c5e3b] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8c5e3b]"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-700">
                SMS Notifications
              </h4>
              <p className="text-xs text-gray-500">
                Receive text messages for order updates
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={smsNotifications} onChange={() => setSmsNotifications(!smsNotifications)} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#8c5e3b] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8c5e3b]"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-700">
                Marketing Emails
              </h4>
              <p className="text-xs text-gray-500">
                Receive emails about new products and offers
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={marketingEmails} onChange={() => setMarketingEmails(!marketingEmails)} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#8c5e3b] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8c5e3b]"></div>
            </label>
          </div>
        </div>
        <div className="mt-6">
          <button className="bg-[#8c5e3b] hover:bg-[#5a3921] text-white py-2 px-4 rounded-md font-medium">
            Save Preferences
          </button>
        </div>
      </div>
      {/* Privacy Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Shield size={20} className="text-[#8c5e3b] mr-2" />
          <h3 className="text-lg font-medium text-[#5a3921]">
            Privacy & Security
          </h3>
        </div>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              Two-Factor Authentication
            </h4>
            <p className="text-xs text-gray-500 mb-2">
              Add an extra layer of security to your account
            </p>
            <button className="text-[#8c5e3b] hover:text-[#5a3921] text-sm font-medium">
              Enable 2FA
            </button>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              Delete Account
            </h4>
            <p className="text-xs text-gray-500 mb-2">
              Permanently delete your account and all data
            </p>
            <button className="text-red-600 hover:text-red-700 text-sm font-medium">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>;
};
export default SettingsPage;