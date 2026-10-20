import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiHome,
  FiUsers,
  FiGrid,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiSearch
} from 'react-icons/fi';
import { roomAPI } from '../../services/api';
import toast from 'react-hot-toast';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [stats, setStats] = useState(null);
  const [filterBlock, setFilterBlock] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    roomNumber: '',
    block: 'Block A',
    capacity: 2,
    floor: 1,
    roomType: 'Double',
    amenities: []
  });

  const blocks = ['Block A', 'Block B', 'Block C', 'PG'];
  const roomTypes = ['Single', 'Double', 'Triple', 'Dormitory'];
  const amenitiesList = ['AC', 'Attached Bathroom', 'WiFi', 'Study Table', 'Wardrobe', 'Hot Water'];

  useEffect(() => {
    fetchRooms();
    fetchStats();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const { data } = await roomAPI.getAll();
      setRooms(data);
    } catch (error) {
      toast.error('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await roomAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch room stats');
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      await roomAPI.create(formData);
      toast.success('Room added successfully');
      setShowAddModal(false);
      resetForm();
      fetchRooms();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add room');
    }
  };

  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    try {
      await roomAPI.update(selectedRoom._id, formData);
      toast.success('Room updated successfully');
      setShowEditModal(false);
      resetForm();
      fetchRooms();
      fetchStats();
    } catch (error) {
      toast.error('Failed to update room');
    }
  };

  const handleDeleteRoom = async (id) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await roomAPI.delete(id);
        toast.success('Room deleted successfully');
        fetchRooms();
        fetchStats();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete room');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      roomNumber: '',
      block: 'Block A',
      capacity: 2,
      floor: 1,
      roomType: 'Double',
      amenities: []
    });
    setSelectedRoom(null);
  };

  const openEditModal = (room) => {
    setSelectedRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      block: room.block,
      capacity: room.capacity,
      floor: room.floor,
      roomType: room.roomType,
      amenities: room.amenities || []
    });
    setShowEditModal(true);
  };

  const toggleAmenity = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const filteredRooms = rooms.filter(room => {
    const matchesBlock = filterBlock === 'all' || room.block === filterBlock;
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBlock && matchesSearch;
  });

  const getOccupancyColor = (occupied, capacity) => {
    const percentage = (occupied / capacity) * 100;
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Room Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage hostel rooms and occupancy
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus className="w-5 h-5" />
          <span>Add Room</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Rooms</p>
                <p className="text-2xl font-bold">{stats.totalRooms}</p>
              </div>
              <FiHome className="w-8 h-8 text-primary-500 opacity-50" />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Capacity</p>
                <p className="text-2xl font-bold">{stats.totalCapacity}</p>
              </div>
              <FiUsers className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Occupied</p>
                <p className="text-2xl font-bold">{stats.totalOccupied}</p>
              </div>
              <FiGrid className="w-8 h-8 text-yellow-500 opacity-50" />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
                <p className="text-2xl font-bold">{stats.availableRooms}</p>
              </div>
              <FiCheck className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by room number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          
          <select
            value={filterBlock}
            onChange={(e) => setFilterBlock(e.target.value)}
            className="px-4 py-2 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Blocks</option>
            {blocks.map(block => (
              <option key={block} value={block}>{block}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            </div>
          ))
        ) : filteredRooms.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FiAlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No rooms found</p>
          </div>
        ) : (
          filteredRooms.map((room) => (
            <motion.div
              key={room._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              className="glass-card p-6 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-medium px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                      {room.block}
                    </span>
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
                      Floor {room.floor}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">Room {room.roomNumber}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{room.roomType}</p>
                </div>
                <div className="flex space-x-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => openEditModal(room)}
                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteRoom(room._id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Occupancy Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Occupancy</span>
                  <span className="font-medium">
                    {room.occupiedCount} / {room.capacity}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(room.occupiedCount / room.capacity) * 100}%` }}
                    className={`h-full ${getOccupancyColor(room.occupiedCount, room.capacity)}`}
                  />
                </div>
              </div>

              {/* Amenities */}
              {room.amenities && room.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {room.amenities.slice(0, 3).map((amenity, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full"
                    >
                      {amenity}
                    </span>
                  ))}
                  {room.amenities.length > 3 && (
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                      +{room.amenities.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Status */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                  <span className={`badge ${
                    room.occupiedCount >= room.capacity 
                      ? 'badge-danger' 
                      : room.occupiedCount > 0 
                        ? 'badge-warning' 
                        : 'badge-success'
                  }`}>
                    {room.occupiedCount >= room.capacity 
                      ? 'Full' 
                      : room.occupiedCount > 0 
                        ? 'Occupied' 
                        : 'Available'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add/Edit Room Modal */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold gradient-text">
                    {showAddModal ? 'Add New Room' : 'Edit Room'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={showAddModal ? handleAddRoom : handleUpdateRoom} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Room Number</label>
                      <input
                        type="text"
                        required
                        value={formData.roomNumber}
                        onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                        className="input-modern"
                        placeholder="e.g., 101"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Block</label>
                      <select
                        required
                        value={formData.block}
                        onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                        className="input-modern"
                      >
                        {blocks.map(block => (
                          <option key={block} value={block}>{block}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Floor</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.floor}
                        onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                        className="input-modern"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Room Type</label>
                      <select
                        required
                        value={formData.roomType}
                        onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                        className="input-modern"
                      >
                        {roomTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Capacity</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                        className="input-modern"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Amenities</label>
                    <div className="grid grid-cols-2 gap-2">
                      {amenitiesList.map(amenity => (
                        <label key={amenity} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.amenities.includes(amenity)}
                            onChange={() => toggleAmenity(amenity)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm">{amenity}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setShowEditModal(false);
                        resetForm();
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      {showAddModal ? 'Add Room' : 'Update Room'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoomManagement;