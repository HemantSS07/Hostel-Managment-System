import axios from 'axios';

// API Base URL - can be configured via environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Handle server errors
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response?.data);
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// ==================== Auth APIs ====================
export const authAPI = {
  // Login user
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Register new user
  register: (userData) => api.post('/auth/register', userData),
  
  // Get current user profile
  getProfile: () => api.get('/auth/profile'),
  
  // Update user profile
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  
  // Change password
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  
  // Forgot password request
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  
  // Reset password with token
  resetPassword: (token, newPassword) => 
    api.post('/auth/reset-password', { token, newPassword }),
  
  // Verify email
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  
  // Resend verification email
  resendVerification: () => api.post('/auth/resend-verification'),
  
  // Refresh token
  refreshToken: () => api.post('/auth/refresh-token'),
  
  // Logout
  logout: () => api.post('/auth/logout'),
};

// ==================== Student APIs ====================
export const studentAPI = {
  // Get all students (paginated)
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.keyword) queryParams.append('keyword', params.keyword);
    if (params.block) queryParams.append('block', params.block);
    if (params.year) queryParams.append('year', params.year);
    if (params.department) queryParams.append('department', params.department);
    if (params.feesStatus) queryParams.append('feesStatus', params.feesStatus);
    if (params.unassigned) queryParams.append('unassigned', params.unassigned);
    
    const query = queryParams.toString();
    return api.get(`/students${query ? `?${query}` : ''}`);
  },
  
  // Get students without a room
  getUnassigned: () => api.get('/students/unassigned'),
  
  // Get single student by ID
  getById: (id) => api.get(`/students/${id}`),
  
  // Get student by register number
  getByRegisterNumber: (registerNumber) => 
    api.get(`/students/register/${registerNumber}`),
  
  // Create new student
  create: (studentData) => api.post('/students', studentData),
  
  // Update student
  update: (id, studentData) => api.put(`/students/${id}`, studentData),
  
  // Delete student
  delete: (id) => api.delete(`/students/${id}`),
  
  // Assign a room to a student
  assignRoom: (studentId, roomId) =>
    api.post(`/students/${studentId}/assign-room`, { roomId }),
  
  // Remove room from a student
  removeRoom: (studentId) =>
    api.delete(`/students/${studentId}/assign-room`),
  
  // Get students by room
  getByRoom: (roomId) => api.get(`/students/room/${roomId}`),
  
  // Get students by block
  getByBlock: (block) => api.get(`/students/block/${block}`),
  
  // Bulk import students
  bulkImport: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/students/bulk-import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  // Export students data
  exportData: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/students/export${queryParams ? `?${queryParams}` : ''}`, {
      responseType: 'blob',
    });
  },
  
  // Get student statistics
  getStats: () => api.get('/students/stats'),
};


// ==================== Room APIs ====================
export const roomAPI = {
  // Get all rooms
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.block) queryParams.append('block', params.block);
    if (params.floor) queryParams.append('floor', params.floor);
    if (params.roomType) queryParams.append('roomType', params.roomType);
    if (params.available) queryParams.append('available', params.available);
    
    const query = queryParams.toString();
    return api.get(`/rooms${query ? `?${query}` : ''}`);
  },
  
  // Get available rooms
  getAvailable: (block = null) => {
    const params = block ? { block } : {};
    return api.get('/rooms/available', { params });
  },
  
  // Get single room by ID
  getById: (id) => api.get(`/rooms/${id}`),
  
  // Get room by room number
  getByRoomNumber: (roomNumber) => api.get(`/rooms/number/${roomNumber}`),
  
  // Create new room
  create: (roomData) => api.post('/rooms', roomData),
  
  // Update room
  update: (id, roomData) => api.put(`/rooms/${id}`, roomData),
  
  // Delete room
  delete: (id) => api.delete(`/rooms/${id}`),
  
  // Get room statistics
  getStats: () => api.get('/rooms/stats'),
  
  // Get rooms by block
  getByBlock: (block) => api.get(`/rooms/block/${block}`),
  
  // Assign student to room
  assignStudent: (roomId, studentId) => 
    api.post(`/rooms/${roomId}/assign`, { studentId }),
  
  // Remove student from room
  removeStudent: (roomId, studentId) => 
    api.post(`/rooms/${roomId}/remove`, { studentId }),
  
  // Bulk create rooms
  bulkCreate: (roomsData) => api.post('/rooms/bulk', { rooms: roomsData }),
};

// ==================== Payment APIs ====================
export const paymentAPI = {
  // Get all payments
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.month) queryParams.append('month', params.month);
    if (params.year) queryParams.append('year', params.year);
    if (params.paymentMethod) queryParams.append('paymentMethod', params.paymentMethod);
    
    const query = queryParams.toString();
    return api.get(`/payments${query ? `?${query}` : ''}`);
  },
  
  // Get payments by student
  getByStudent: (studentId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/payments/student/${studentId}${queryParams ? `?${queryParams}` : ''}`);
  },
  
  // Get single payment by ID
  getById: (id) => api.get(`/payments/${id}`),
  
  // Create new payment
  create: (paymentData) => api.post('/payments', paymentData),
  
  // Create payment requests (Admin)
  createRequests: (requestData) => api.post('/payments/request', requestData),
  
  // Pay a payment request (Student)
  payRequest: (id) => api.put(`/payments/${id}/pay`),
  
  // Decline a payment request (Student)
  declineRequest: (id, reason) => api.put(`/payments/${id}/decline`, { reason }),
  
  // Update payment
  update: (id, paymentData) => api.put(`/payments/${id}`, paymentData),
  
  // Delete payment
  delete: (id) => api.delete(`/payments/${id}`),
  
  // Get payment statistics
  getStats: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/payments/stats${queryParams ? `?${queryParams}` : ''}`);
  },
  
  // Get monthly revenue
  getMonthlyRevenue: (year) => api.get(`/payments/revenue/monthly/${year}`),
  
  // Get pending payments
  getPending: () => api.get('/payments/pending'),
  
  // Generate receipt
  generateReceipt: (paymentId) => 
    api.get(`/payments/${paymentId}/receipt`, { responseType: 'blob' }),
  
  // Bulk record payments
  bulkCreate: (paymentsData) => api.post('/payments/bulk', { payments: paymentsData }),
  
  // Export payments data
  exportData: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/payments/export${queryParams ? `?${queryParams}` : ''}`, {
      responseType: 'blob',
    });
  },
};

// ==================== Complaint APIs ====================
export const complaintAPI = {
  // Get all complaints (admin)
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.category) queryParams.append('category', params.category);
    if (params.priority) queryParams.append('priority', params.priority);
    if (params.since) queryParams.append('since', params.since);
    const query = queryParams.toString();
    return api.get(`/complaints${query ? `?${query}` : ''}`);
  },

  // Get complaints by student
  getByStudent: (studentId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/complaints/student/${studentId}${queryParams ? `?${queryParams}` : ''}`);
  },

  // Get single complaint by ID
  getById: (id) => api.get(`/complaints/${id}`),

  // Create new complaint
  create: (complaintData) => api.post('/complaints', complaintData),

  // Update complaint status (PUT /complaints/:id)
  updateStatus: (id, statusData) => api.put(`/complaints/${id}`, statusData),

  // Delete complaint
  delete: (id) => api.delete(`/complaints/${id}`),

  // Get complaint statistics
  getStats: () => api.get('/complaints/stats'),
};


// ==================== Dashboard APIs ====================
export const dashboardAPI = {
  // Get admin dashboard data
  getAdminDashboard: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.period) queryParams.append('period', params.period);
    
    const query = queryParams.toString();
    return api.get(`/dashboard/admin${query ? `?${query}` : ''}`);
  },
  
  // Get student dashboard data
  getStudentDashboard: () => api.get('/dashboard/student'),
  
  // Get analytics data
  getAnalytics: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/dashboard/analytics${queryParams ? `?${queryParams}` : ''}`);
  },
  
  // Get recent activities
  getRecentActivities: (limit = 10) => api.get(`/dashboard/activities?limit=${limit}`),
  
  // Get occupancy trends
  getOccupancyTrends: (months = 6) => api.get(`/dashboard/occupancy-trends?months=${months}`),
  
  // Get revenue trends
  getRevenueTrends: (months = 6) => api.get(`/dashboard/revenue-trends?months=${months}`),
  
  // Get complaint trends
  getComplaintTrends: (months = 6) => api.get(`/dashboard/complaint-trends?months=${months}`),
};

// ==================== Report APIs ====================
export const reportAPI = {
  // Generate student report
  generateStudentReport: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/reports/students${queryParams ? `?${queryParams}` : ''}`, {
      responseType: 'blob',
    });
  },
  
  // Generate room report
  generateRoomReport: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/reports/rooms${queryParams ? `?${queryParams}` : ''}`, {
      responseType: 'blob',
    });
  },
  
  // Generate payment report
  generatePaymentReport: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/reports/payments${queryParams ? `?${queryParams}` : ''}`, {
      responseType: 'blob',
    });
  },
  
  // Generate complaint report
  generateComplaintReport: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/reports/complaints${queryParams ? `?${queryParams}` : ''}`, {
      responseType: 'blob',
    });
  },
  
  // Generate comprehensive report
  generateComprehensiveReport: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/reports/comprehensive${queryParams ? `?${queryParams}` : ''}`, {
      responseType: 'blob',
    });
  },
};

// ==================== Notification APIs ====================
export const notificationAPI = {
  // Get all notifications
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.read) queryParams.append('read', params.read);
    
    const query = queryParams.toString();
    return api.get(`/notifications${query ? `?${query}` : ''}`);
  },
  
  // Get unread count
  getUnreadCount: () => api.get('/notifications/unread/count'),
  
  // Mark as read
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  
  // Mark all as read
  markAllAsRead: () => api.put('/notifications/read-all'),
  
  // Delete notification
  delete: (id) => api.delete(`/notifications/${id}`),
};

// ==================== Settings APIs ====================
export const settingsAPI = {
  // Get all settings
  getAll: () => api.get('/settings'),
  
  // Update settings
  update: (settingsData) => api.put('/settings', settingsData),
  
  // Get specific setting
  get: (key) => api.get(`/settings/${key}`),
};

// ==================== User Management APIs (Admin only) ====================
export const userAPI = {
  // Get all users
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.role) queryParams.append('role', params.role);
    
    const query = queryParams.toString();
    return api.get(`/users${query ? `?${query}` : ''}`);
  },
  
  // Get single user
  getById: (id) => api.get(`/users/${id}`),
  
  // Create user
  create: (userData) => api.post('/users', userData),
  
  // Update user
  update: (id, userData) => api.put(`/users/${id}`, userData),
  
  // Delete user
  delete: (id) => api.delete(`/users/${id}`),
  
  // Toggle user status (activate/deactivate)
  toggleStatus: (id) => api.put(`/users/${id}/toggle-status`),
  
  // Change user role
  changeRole: (id, role) => api.put(`/users/${id}/role`, { role }),
};

// Export the base api instance for custom requests
export default api;