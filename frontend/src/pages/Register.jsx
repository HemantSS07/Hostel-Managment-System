import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  FiMail, 
  FiLock, 
  FiUser, 
  FiEye, 
  FiEyeOff, 
  FiPhone,
  FiHash,
  FiAlertCircle,
  FiCheckCircle,
  FiUserPlus,
  FiBook,
  FiHome
} from 'react-icons/fi';
import { BiBuildingHouse } from 'react-icons/bi';
import toast from 'react-hot-toast';

const departments = [
  'Computer Science',
  'Electronics',
  'Mechanical',
  'Civil',
  'Electrical',
  'Information Technology',
  'Chemical',
  'Biotechnology'
];
const blocks = ['Block A', 'Block B', 'Block C', 'PG'];
const years = [1, 2, 3, 4];

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    registerNumber: '',
    contactNumber: '',
    year: '',
    department: '',
    hostelBlock: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    else if (formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (formData.role === 'student') {
      if (!formData.registerNumber) newErrors.registerNumber = 'Register number is required';
      if (!formData.year) newErrors.year = 'Year of study is required';
      if (!formData.department) newErrors.department = 'Department is required';
      if (!formData.hostelBlock) newErrors.hostelBlock = 'Hostel block is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);
    try {
      const registerData = { ...formData, confirmPassword: undefined };
      const result = await register(registerData);
      if (result.success) {
        toast.success('Registration successful! Please login.');
        navigate('/login');
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch (error) {
      toast.error('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '' };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[$@#&!]+/)) strength++;
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
    const colors = ['', 'red', 'yellow', 'blue', 'green', 'purple'];
    return { strength, label: labels[strength], color: colors[strength] };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 animated-bg opacity-10" />
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 right-20 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
        <motion.div
          animate={{ y: [0, 25, 0], x: [0, -15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 left-20 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="text-center mb-8"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-20 h-20 mx-auto bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary-500/25"
            >
              <BiBuildingHouse className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold gradient-text">Create Account</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Join our hostel management system</p>
          </motion.div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-600'
              }`}>1</div>
              <div className={`w-16 h-1 mx-2 ${step >= 2 ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-700'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-600'
              }`}>2</div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 ? (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input type="text" value={formData.name}
                      onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setErrors({ ...errors, name: '' }); }}
                      className={`input-modern pl-10 ${errors.name ? 'border-red-500' : ''}`} placeholder="John Doe" />
                  </div>
                  {errors.name && <p className="text-red-500 text-xs mt-1 flex items-center"><FiAlertCircle className="w-3 h-3 mr-1" />{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input type="email" value={formData.email}
                      onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
                      className={`input-modern pl-10 ${errors.email ? 'border-red-500' : ''}`} placeholder="you@example.com" />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center"><FiAlertCircle className="w-3 h-3 mr-1" />{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input type={showPassword ? 'text' : 'password'} value={formData.password}
                      onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setErrors({ ...errors, password: '' }); }}
                      className={`input-modern pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`} placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Password Strength:</span>
                        <span className={`text-xs font-medium text-${passwordStrength.color}-600`}>{passwordStrength.label}</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                          className={`h-full bg-${passwordStrength.color}-500`} />
                      </div>
                    </div>
                  )}
                  {errors.password && <p className="text-red-500 text-xs mt-1 flex items-center"><FiAlertCircle className="w-3 h-3 mr-1" />{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword}
                      onChange={(e) => { setFormData({ ...formData, confirmPassword: e.target.value }); setErrors({ ...errors, confirmPassword: '' }); }}
                      className={`input-modern pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`} placeholder="••••••••" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <p className="text-green-500 text-xs mt-1 flex items-center"><FiCheckCircle className="w-3 h-3 mr-1" />Passwords match</p>
                  )}
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 flex items-center"><FiAlertCircle className="w-3 h-3 mr-1" />{errors.confirmPassword}</p>}
                </div>

                <button type="button" onClick={handleNextStep} className="w-full btn-primary mt-6">Continue</button>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">I am a</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setFormData({ ...formData, role: 'student' })}
                      className={`p-3 rounded-xl border-2 transition-all ${formData.role === 'student' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                      <FiUser className={`w-6 h-6 mx-auto mb-1 ${formData.role === 'student' ? 'text-primary-500' : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${formData.role === 'student' ? 'text-primary-700 dark:text-primary-300' : ''}`}>Student</span>
                    </button>
                    <button type="button" onClick={() => setFormData({ ...formData, role: 'admin' })}
                      className={`p-3 rounded-xl border-2 transition-all ${formData.role === 'admin' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                      <BiBuildingHouse className={`w-6 h-6 mx-auto mb-1 ${formData.role === 'admin' ? 'text-primary-500' : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${formData.role === 'admin' ? 'text-primary-700 dark:text-primary-300' : ''}`}>Admin</span>
                    </button>
                  </div>
                </div>

                {/* Student-specific fields */}
                {formData.role === 'student' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {/* Register Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Register Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FiHash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input type="text" value={formData.registerNumber}
                          onChange={(e) => { setFormData({ ...formData, registerNumber: e.target.value }); setErrors({ ...errors, registerNumber: '' }); }}
                          className={`input-modern pl-10 ${errors.registerNumber ? 'border-red-500' : ''}`} placeholder="REG123456" />
                      </div>
                      {errors.registerNumber && <p className="text-red-500 text-xs mt-1 flex items-center"><FiAlertCircle className="w-3 h-3 mr-1" />{errors.registerNumber}</p>}
                    </div>

                    {/* Year + Block row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Year <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FiBook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                          <select value={formData.year}
                            onChange={(e) => { setFormData({ ...formData, year: e.target.value }); setErrors({ ...errors, year: '' }); }}
                            className={`input-modern pl-10 ${errors.year ? 'border-red-500' : ''}`}>
                            <option value="">Select</option>
                            {years.map(y => <option key={y} value={y}>Year {y}</option>)}
                          </select>
                        </div>
                        {errors.year && <p className="text-red-500 text-xs mt-1 flex items-center"><FiAlertCircle className="w-3 h-3 mr-1" />{errors.year}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Block <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FiHome className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                          <select value={formData.hostelBlock}
                            onChange={(e) => { setFormData({ ...formData, hostelBlock: e.target.value }); setErrors({ ...errors, hostelBlock: '' }); }}
                            className={`input-modern pl-10 ${errors.hostelBlock ? 'border-red-500' : ''}`}>
                            <option value="">Select</option>
                            {blocks.map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </div>
                        {errors.hostelBlock && <p className="text-red-500 text-xs mt-1 flex items-center"><FiAlertCircle className="w-3 h-3 mr-1" />{errors.hostelBlock}</p>}
                      </div>
                    </div>

                    {/* Department */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <select value={formData.department}
                        onChange={(e) => { setFormData({ ...formData, department: e.target.value }); setErrors({ ...errors, department: '' }); }}
                        className={`input-modern ${errors.department ? 'border-red-500' : ''}`}>
                        <option value="">Select Department</option>
                        {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                      </select>
                      {errors.department && <p className="text-red-500 text-xs mt-1 flex items-center"><FiAlertCircle className="w-3 h-3 mr-1" />{errors.department}</p>}
                    </div>
                  </motion.div>
                )}

                {/* Contact Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Number <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input type="tel" value={formData.contactNumber}
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                      className="input-modern pl-10" placeholder="+91 98765 43210" />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 btn-secondary">Back</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="submit" disabled={loading} className="flex-1 btn-primary">
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating...</span>
                      </div>
                    ) : (
                      <span className="flex items-center justify-center space-x-2">
                        <FiUserPlus className="w-4 h-4" />
                        <span>Create Account</span>
                      </span>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;