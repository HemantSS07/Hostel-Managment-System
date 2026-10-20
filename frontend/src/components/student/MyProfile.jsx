import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiHome,
  FiBook,
  FiHash,
  FiEdit2,
  FiSave,
  FiX,
  FiMapPin,
  FiUsers
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const MyProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    parentContact: '',
    address: '',
    email: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    if (!user?.studentId) {
      setLoading(false);
      setError('unlinked');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const studentId = typeof user.studentId === 'object' && user.studentId !== null 
        ? user.studentId._id 
        : user.studentId;

      const { data } = await studentAPI.getById(studentId);
      setProfile(data);
      setFormData({
        name: data.name || '',
        contactNumber: data.contactNumber || '',
        parentContact: data.parentContact || '',
        address: data.address || '',
        email: user.email || ''
      });
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 400 || err.response?.status === 500) {
        setError('unlinked');
      } else {
        toast.error(err.response?.data?.message || 'Failed to fetch profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const studentId = typeof user.studentId === 'object' && user.studentId !== null 
        ? user.studentId._id 
        : user.studentId;

      await studentAPI.update(studentId, formData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error === 'unlinked') {
    return (
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto glass-card p-12 text-center border-2 border-red-300/30 bg-gradient-to-br from-red-50/50 to-orange-50/50 dark:from-red-900/10 dark:to-orange-900/10"
        >
          <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiUser className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">
            Profile Not Linked
          </h2>
          <p className="text-red-700 dark:text-red-300 max-w-md mx-auto mb-8">
            You cannot view your profile because your account does not have an associated student profile in the system.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">My Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage your personal information
          </p>
        </div>
        {!isEditing && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <FiEdit2 className="w-5 h-5" />
            <span>Edit Profile</span>
          </motion.button>
        )}
      </motion.div>

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="glass-card p-6 text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                <span className="text-white text-5xl font-bold">
                  {profile?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-dark-200" />
            </div>
            
            <h2 className="text-2xl font-bold mt-4">{profile?.name}</h2>
            <p className="text-gray-600 dark:text-gray-400">{profile?.registerNumber}</p>
            
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-center space-x-2 text-sm">
                <span className={`badge ${profile?.feesStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                  Fee: {profile?.feesStatus}
                </span>
                <span className="badge badge-info">
                  Year {profile?.year}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {profile?.department}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Profile Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-6">Personal Information</h3>
            
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-modern"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-modern"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Number</label>
                  <input
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="input-modern"
                    placeholder="+91 98765 43210"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Parent Contact</label>
                  <input
                    type="tel"
                    value={formData.parentContact}
                    onChange={(e) => setFormData({ ...formData, parentContact: e.target.value })}
                    className="input-modern"
                    placeholder="+91 98765 43210"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="input-modern"
                    rows="3"
                    placeholder="Enter your address"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: profile.name,
                        contactNumber: profile.contactNumber || '',
                        parentContact: profile.parentContact || '',
                        address: profile.address || '',
                        email: user.email
                      });
                    }}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <FiX className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleUpdateProfile}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <FiSave className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3 p-3 glass rounded-xl">
                    <FiUser className="w-5 h-5 text-primary-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="font-medium">{profile?.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 glass rounded-xl">
                    <FiMail className="w-5 h-5 text-primary-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Email Address</p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 glass rounded-xl">
                    <FiHash className="w-5 h-5 text-primary-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Register Number</p>
                      <p className="font-medium">{profile?.registerNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 glass rounded-xl">
                    <FiBook className="w-5 h-5 text-primary-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Department & Year</p>
                      <p className="font-medium">{profile?.department} - Year {profile?.year}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 glass rounded-xl">
                    <FiPhone className="w-5 h-5 text-primary-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Contact Number</p>
                      <p className="font-medium">{profile?.contactNumber || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 glass rounded-xl">
                    <FiUsers className="w-5 h-5 text-primary-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Parent Contact</p>
                      <p className="font-medium">{profile?.parentContact || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 glass rounded-xl md:col-span-2">
                    <FiMapPin className="w-5 h-5 text-primary-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="font-medium">{profile?.address || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Account Information */}
          <div className="glass-card p-6 mt-6">
            <h3 className="text-xl font-semibold mb-4">Account Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 glass rounded-xl">
                <div>
                  <p className="font-medium">Account Created</p>
                  <p className="text-xs text-gray-500">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <FiUser className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="flex justify-between items-center p-3 glass rounded-xl">
                <div>
                  <p className="font-medium">Last Updated</p>
                  <p className="text-xs text-gray-500">
                    {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <FiEdit2 className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MyProfile;