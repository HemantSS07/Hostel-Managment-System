import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiFilter,
  FiDownload,
  FiUserPlus,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiHome,
  FiRefreshCw,
  FiSlash,
  FiUsers,
  FiClock
} from 'react-icons/fi';
import { studentAPI, roomAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { useSocket } from '../../hooks/useSocket';

const REFRESH_INTERVAL = 30; // seconds

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filterBlock, setFilterBlock] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'unassigned'
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);
  const socket = useSocket();

  const [formData, setFormData] = useState({
    name: '',
    registerNumber: '',
    year: '1',
    department: '',
    hostelBlock: 'Block A',
    roomId: '',
    contactNumber: '',
    parentContact: '',
    address: ''
  });

  const blocks = ['Block A', 'Block B', 'Block C', 'PG'];
  const years = [1, 2, 3, 4];
  const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Information Technology', 'Chemical', 'Biotechnology'];

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        keyword: searchTerm,
        block: filterBlock !== 'all' ? filterBlock : undefined,
        year: filterYear !== 'all' ? filterYear : undefined,
        unassigned: filterTab === 'unassigned' ? 'true' : undefined
      };
      const { data } = await studentAPI.getAll(params);
      setStudents(data.students);
      setTotalPages(data.pages);
      setTotalStudents(data.total);
      setLastRefreshed(new Date());
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterBlock, filterYear, filterTab]);

  const fetchAvailableRooms = useCallback(async () => {
    try {
      const { data } = await roomAPI.getAvailable();
      setAvailableRooms(data);
    } catch (error) {
      console.error('Failed to fetch available rooms');
    }
  }, []);

  // Initial fetch + auto-refresh every 30s
  useEffect(() => {
    fetchStudents();
    fetchAvailableRooms();
  }, [fetchStudents, fetchAvailableRooms]);

  // Auto-refresh countdown
  useEffect(() => {
    setCountdown(REFRESH_INTERVAL);

    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return REFRESH_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);

    intervalRef.current = setInterval(() => {
      fetchStudents();
    }, REFRESH_INTERVAL * 1000);

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(countdownRef.current);
    };
  }, [fetchStudents]);

  // Listen for real-time student updates
  useEffect(() => {
    if (!socket) return;

    const handleStudentUpdated = (updatedStudent) => {
      setStudents(prev => prev.map(s => s._id === updatedStudent._id ? updatedStudent : s));
    };

    socket.on('student_updated', handleStudentUpdated);

    return () => {
      socket.off('student_updated', handleStudentUpdated);
    };
  }, [socket]);

  const handleManualRefresh = () => {
    fetchStudents();
    fetchAvailableRooms();
    setCountdown(REFRESH_INTERVAL);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await studentAPI.create(formData);
      toast.success('Student added successfully');
      setShowAddModal(false);
      resetForm();
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add student');
    }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      await studentAPI.update(selectedStudent._id, formData);
      toast.success('Student updated successfully');
      setShowEditModal(false);
      resetForm();
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update student');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentAPI.delete(id);
        toast.success('Student deleted successfully');
        fetchStudents();
      } catch (error) {
        toast.error('Failed to delete student');
      }
    }
  };

  const handleAssignRoom = async () => {
    if (!selectedRoomId) {
      toast.error('Please select a room');
      return;
    }
    setAssignLoading(true);
    try {
      const { data } = await studentAPI.assignRoom(selectedStudent._id, selectedRoomId);
      toast.success(data.message || 'Room assigned successfully!');
      setShowAssignModal(false);
      setSelectedRoomId('');
      fetchStudents();
      fetchAvailableRooms();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign room');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleRemoveRoom = async (student) => {
    if (!window.confirm(`Remove room from ${student.name}?`)) return;
    try {
      await studentAPI.removeRoom(student._id);
      toast.success('Room removed successfully');
      fetchStudents();
      fetchAvailableRooms();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove room');
    }
  };

  const openAssignModal = (student) => {
    setSelectedStudent(student);
    setSelectedRoomId('');
    setShowAssignModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      registerNumber: '',
      year: '1',
      department: '',
      hostelBlock: 'Block A',
      roomId: '',
      contactNumber: '',
      parentContact: '',
      address: ''
    });
    setSelectedStudent(null);
  };

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      registerNumber: student.registerNumber,
      year: student.year,
      department: student.department,
      hostelBlock: student.hostelBlock,
      roomId: student.roomId?._id || '',
      contactNumber: student.contactNumber || '',
      parentContact: student.parentContact || '',
      address: student.address || ''
    });
    setShowEditModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold gradient-text">Student Management</h1>
            {/* Live indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-green-600 dark:text-green-400">LIVE</span>
              <span className="text-xs text-gray-500">·{countdown}s</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {totalStudents} students total · Last updated {formatDistanceToNow(lastRefreshed, { addSuffix: true })}
            </p>
            <button onClick={handleManualRefresh}
              className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 transition-colors">
              <FiRefreshCw className="w-3 h-3" /> Refresh now
            </button>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2">
          <FiUserPlus className="w-5 h-5" />
          <span>Add Student</span>
        </motion.button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'All Students', icon: FiUsers },
          { key: 'unassigned', label: 'Needs Room', icon: FiHome }
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => { setFilterTab(key); setCurrentPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filterTab === key
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                : 'glass hover:bg-gray-100 dark:hover:bg-dark-300'
            }`}>
            <Icon className="w-4 h-4" />
            {label}
            {key === 'unassigned' && totalStudents > 0 && filterTab !== 'unassigned' && (
              <span className="w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center">
                !
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search by name or register number..."
                value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <div className="flex gap-3">
            <select value={filterBlock} onChange={(e) => { setFilterBlock(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="all">All Blocks</option>
              {blocks.map(block => <option key={block} value={block}>{block}</option>)}
            </select>
            <select value={filterYear} onChange={(e) => { setFilterYear(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="all">All Years</option>
              {years.map(year => <option key={year} value={year}>Year {year}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-300">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Register No.</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Year/Dept</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Block/Room</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fee Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Registered</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <FiUsers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">
                      {filterTab === 'unassigned' ? 'All students have rooms assigned! 🎉' : 'No students found'}
                    </p>
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <motion.tr key={student._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.contactNumber || 'No contact'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 dark:text-white font-mono">{student.registerNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 dark:text-white">Year {student.year}</p>
                      <p className="text-xs text-gray-500">{student.department}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 dark:text-white">{student.hostelBlock}</p>
                      {student.roomId ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-green-600 font-medium">Room {student.roomId.roomNumber}</span>
                          <FiCheck className="w-3 h-3 text-green-500" />
                        </div>
                      ) : (
                        <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                          <FiAlertCircle className="w-3 h-3" /> Not Assigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${student.feesStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                        {student.feesStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-500">
                        {student.createdAt ? formatDistanceToNow(new Date(student.createdAt), { addSuffix: true }) : '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        {/* Assign Room Button */}
                        {!student.roomId ? (
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={() => openAssignModal(student)}
                            title="Assign Room"
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                            <FiHome className="w-4 h-4" />
                          </motion.button>
                        ) : (
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={() => handleRemoveRoom(student)}
                            title="Remove Room"
                            className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors">
                            <FiSlash className="w-4 h-4" />
                          </motion.button>
                        )}
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          onClick={() => openEditModal(student)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <FiEdit2 className="w-4 h-4" />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteStudent(student._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <FiTrash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">Page {currentPage} of {totalPages}</p>
            <div className="flex space-x-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="px-3 py-1 glass rounded-lg disabled:opacity-50">Previous</button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="px-3 py-1 glass rounded-lg disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* ===== Assign Room Modal ===== */}
      <AnimatePresence>
        {showAssignModal && selectedStudent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-lg">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold gradient-text">Assign Room</h2>
                    <p className="text-sm text-gray-500 mt-1">Allocating room for <strong>{selectedStudent.name}</strong></p>
                  </div>
                  <button onClick={() => { setShowAssignModal(false); setSelectedRoomId(''); }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg">
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                {/* Student summary */}
                <div className="flex items-center gap-3 p-4 glass rounded-xl mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{selectedStudent.name}</p>
                    <p className="text-sm text-gray-500">{selectedStudent.registerNumber} · {selectedStudent.hostelBlock} · Year {selectedStudent.year}</p>
                  </div>
                </div>

                {/* Room selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Select Available Room</label>
                  {availableRooms.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 glass rounded-xl">
                      <FiHome className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>No rooms available at this time.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {availableRooms.map(room => (
                        <button key={room._id} type="button"
                          onClick={() => setSelectedRoomId(room._id)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                            selectedRoomId === room._id
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-200 dark:border-gray-700 glass hover:border-primary-300'
                          }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">Room {room.roomNumber}</p>
                              <p className="text-sm text-gray-500">{room.block} · Floor {room.floor} · {room.roomType}</p>
                            </div>
                            <div className="text-right">
                              <span className={`text-sm font-medium ${
                                room.occupiedCount >= room.capacity - 1 ? 'text-amber-600' : 'text-green-600'
                              }`}>
                                {room.occupiedCount}/{room.capacity} beds
                              </span>
                              {selectedRoomId === room._id && (
                                <div className="flex justify-end mt-1">
                                  <FiCheck className="w-4 h-4 text-primary-500" />
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button type="button" onClick={() => { setShowAssignModal(false); setSelectedRoomId(''); }}
                    className="flex-1 btn-secondary">Cancel</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleAssignRoom}
                    disabled={!selectedRoomId || assignLoading}
                    className="flex-1 btn-primary disabled:opacity-50">
                    {assignLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Assigning...
                      </div>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <FiHome className="w-4 h-4" /> Assign Room
                      </span>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Add / Edit Student Modal ===== */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold gradient-text">
                    {showAddModal ? 'Add New Student' : 'Edit Student'}
                  </h2>
                  <button onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg">
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={showAddModal ? handleAddStudent : handleUpdateStudent} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name</label>
                      <input type="text" required value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input-modern" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Register Number</label>
                      <input type="text" required value={formData.registerNumber}
                        onChange={(e) => setFormData({ ...formData, registerNumber: e.target.value })}
                        className="input-modern" placeholder="REG123456" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Year</label>
                      <select required value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })} className="input-modern">
                        {years.map(year => <option key={year} value={year}>Year {year}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Department</label>
                      <select required value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="input-modern">
                        <option value="">Select Department</option>
                        {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Hostel Block</label>
                      <select required value={formData.hostelBlock}
                        onChange={(e) => setFormData({ ...formData, hostelBlock: e.target.value })} className="input-modern">
                        {blocks.map(block => <option key={block} value={block}>{block}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Contact Number</label>
                      <input type="tel" value={formData.contactNumber}
                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                        className="input-modern" placeholder="+91 98765 43210" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Parent Contact</label>
                      <input type="tel" value={formData.parentContact}
                        onChange={(e) => setFormData({ ...formData, parentContact: e.target.value })}
                        className="input-modern" placeholder="+91 98765 43210" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-2">Address</label>
                      <textarea value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="input-modern" rows="3" placeholder="Enter full address" />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}
                      className="btn-secondary">Cancel</button>
                    <button type="submit" className="btn-primary">
                      {showAddModal ? 'Add Student' : 'Update Student'}
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

export default StudentManagement;