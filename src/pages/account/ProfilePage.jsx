import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, AlertCircle, Check } from 'lucide-react';
import axios from 'axios';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [address, setAddress] = useState(user?.address || '');
  const [idNumber, setIdNumber] = useState(user?.id_number || '');
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Auto-set preview from backend photo if no local preview is active
  useEffect(() => {
    if (!profilePhotoFile && user?.profile_photo) {
      setPreviewPhotoUrl(`https://biz4293.pythonanywhere.com/static/images/${encodeURIComponent(user.profile_photo)}`);
    }
  }, [user, profilePhotoFile]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePhotoFile(file);
    if (file) {
      setPreviewPhotoUrl(URL.createObjectURL(file)); // Immediate local preview
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('user_id', user.user_id);
      formData.append('address', address);
      formData.append('phone_number', phone);
      formData.append('id_number', idNumber);
      formData.append('name', name);
      if (profilePhotoFile) {
        formData.append('profile_photo', profilePhotoFile);
      }

      const response = await axios.post(
        'https://biz4293.pythonanywhere.com/api/update_profile',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const updatedProfilePhoto = response.data.profile_photo || user.profile_photo;

      // Update AuthContext so photo persists after reload
      updateUser({
        ...user,
        name,
        address,
        phone_number: phone,
        id_number: idNumber,
        profile_photo: updatedProfilePhoto,
      });

      // Switch preview to backend image after save
      setPreviewPhotoUrl(
        updatedProfilePhoto
          ? `https://biz4293.pythonanywhere.com/static/images/${encodeURIComponent(updatedProfilePhoto)}`
          : null
      );

      setProfilePhotoFile(null);
      setSuccess(response.data.message || 'Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#5a3921] mb-6">My Profile</h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-md text-red-700 flex items-center">
          <AlertCircle size={18} className="mr-2" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 rounded-md text-green-700 flex items-center">
          <Check size={18} className="mr-2" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="grid grid-cols-1 gap-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center sm:items-start">
            <div className="bg-gray-100 rounded-full h-24 w-24 flex items-center justify-center mb-4 overflow-hidden">
              {previewPhotoUrl ? (
                <img
                  src={previewPhotoUrl}
                  alt="Profile"
                  className="object-cover h-full w-full"
                />
              ) : user?.name ? (
                <span className="text-2xl font-bold text-[#8c5e3b]">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User size={40} className="text-gray-400" />
              )}
            </div>
            <input
              type="file"
              name="profile_photo"
              accept="image/*"
              onChange={handleFileChange}
              className="text-[#8c5e3b] hover:text-[#5a3921] text-sm font-medium"
            />
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#8c5e3b] focus:border-[#8c5e3b]"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                disabled
                className="appearance-none block w-full pl-10 pr-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="e.g. 0712345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#8c5e3b] focus:border-[#8c5e3b]"
            />
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Address
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              placeholder="Enter your delivery address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#8c5e3b] focus:border-[#8c5e3b]"
            />
          </div>

          {/* ID Number */}
          <div>
            <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-1">
              ID Number
            </label>
            <input
              id="idNumber"
              name="idNumber"
              type="text"
              placeholder="Enter your ID number"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#8c5e3b] focus:border-[#8c5e3b]"
            />
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-[#8c5e3b] hover:bg-[#5a3921] text-white py-2 px-6 rounded-md font-medium flex items-center justify-center disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
