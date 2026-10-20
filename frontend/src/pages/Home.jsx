import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiUsers, 
  FiHome, 
  FiDollarSign, 
  FiMessageSquare,
  FiShield,
  FiClock,
  FiCheckCircle,
  FiArrowRight,
  FiStar,
  FiTrendingUp,
  FiAward,
  FiSmile
} from 'react-icons/fi';
import { BiBuildingHouse } from 'react-icons/bi';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: FiUsers,
      title: 'Student Management',
      description: 'Efficiently manage student records, room allocations, and personal information with our comprehensive system.',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      icon: FiHome,
      title: 'Room Management',
      description: 'Track room occupancy, availability, and maintenance status in real-time with detailed analytics.',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      icon: FiDollarSign,
      title: 'Payment System',
      description: 'Handle fee collection, track payments, and generate financial reports with automated reminders.',
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
    },
    {
      icon: FiMessageSquare,
      title: 'Complaint System',
      description: 'Address student complaints quickly with our efficient ticketing and resolution system.',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      icon: FiShield,
      title: 'Secure Access',
      description: 'Role-based access control ensures data security and privacy for all users.',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    },
    {
      icon: FiClock,
      title: '24/7 Availability',
      description: 'Access the system anytime, anywhere with our reliable cloud-based solution.',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
    }
  ];

  const stats = [
    { icon: FiUsers, label: 'Students Housed', value: '2,500+' },
    { icon: FiHome, label: 'Rooms Managed', value: '500+' },
    { icon: FiSmile, label: 'Satisfaction Rate', value: '98%' },
    { icon: FiAward, label: 'Years Experience', value: '10+' }
  ];

  const testimonials = [
    {
      name: 'Dr. Rajesh Kumar',
      role: 'Hostel Warden',
      content: 'This system has transformed how we manage our hostel. Everything is streamlined and efficient.',
      rating: 5
    },
    {
      name: 'Priya Sharma',
      role: 'Student',
      content: 'Very easy to use. I can check my room details, pay fees, and file complaints all in one place.',
      rating: 5
    },
    {
      name: 'Amit Patel',
      role: 'Administrator',
      content: 'The dashboard provides excellent insights. Managing 500+ students has never been easier.',
      rating: 5
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 animated-bg opacity-10" />
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
            }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center px-4 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-6"
              >
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse mr-2" />
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  Modern Hostel Management Solution
                </span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl lg:text-6xl font-bold mb-6"
              >
                <span className="gradient-text">Streamline</span> Your
                <br />
                Hostel Operations
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-gray-600 dark:text-gray-400 mb-8"
              >
                Manage students, rooms, payments, and complaints all in one place. 
                Experience the future of hostel management with our comprehensive solution.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4"
              >
                {!user ? (
                  <>
                    <Link to="/login">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <span>Get Started</span>
                        <FiArrowRight className="w-5 h-5" />
                      </motion.button>
                    </Link>
                    
                    <Link to="/register">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-secondary"
                      >
                        Create Account
                      </motion.button>
                    </Link>
                  </>
                ) : (
                  <Link to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <span>Go to Dashboard</span>
                      <FiArrowRight className="w-5 h-5" />
                    </motion.button>
                  </Link>
                )}
              </motion.div>
              
              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 flex items-center space-x-6"
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 border-2 border-white dark:border-dark-200 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">U{i}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Trusted by 100+ institutions
                  </p>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Right Content - Stats Cards */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 glass-card p-8">
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="text-center p-6 rounded-xl bg-white/50 dark:bg-dark-300/50 hover:shadow-lg transition-all"
                    >
                      <stat.icon className="w-8 h-8 text-primary-500 mx-auto mb-3" />
                      <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Building Icon */}
                <div className="mt-8 flex justify-center">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <BiBuildingHouse className="w-24 h-24 text-primary-500 opacity-30" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-gray-50/50 dark:bg-dark-300/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Powerful <span className="gradient-text">Features</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to manage your hostel efficiently in one platform
            </p>
          </motion.div>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className={`glass-card p-6 group cursor-pointer ${feature.bgColor} hover:shadow-2xl transition-all duration-300`}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-4 flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <FiArrowRight className="w-4 h-4 ml-1" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              What Our <span className="gradient-text">Users Say</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Join thousands of satisfied users who trust our platform
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FiStar key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-purple-500/10" />
            
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute top-10 right-10 w-32 h-32 bg-primary-500 rounded-full opacity-20 blur-2xl"
            />
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute bottom-10 left-10 w-40 h-40 bg-purple-500 rounded-full opacity-20 blur-2xl"
            />
            
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Ready to Transform Your
                <br />
                <span className="gradient-text">Hostel Management?</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Join thousands of hostels that trust our platform for their daily operations
              </p>
              
              {!user ? (
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link to="/register">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-primary inline-flex items-center space-x-2"
                    >
                      <span> Get  Start</span>
                      <FiArrowRight className="w-5 h-5" />
                    </motion.button>
                  </Link>
                  <Link to="/login">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-secondary"
                    >
                      Sign In
                    </motion.button>
                  </Link>
                </div>
              ) : (
                <Link to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary inline-flex items-center space-x-2"
                  >
                    <span>Go to Dashboard</span>
                    <FiArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
              )}
              
              <div className="mt-8 flex items-center justify-center space-x-8">
                <div className="flex items-center">
                  <FiCheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Real-Time Room Allocation</span>
                </div>
                <div className="flex items-center">
                  <FiCheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Live Complaint Tracking</span>
                </div>
                <div className="flex items-center">
                  <FiCheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Smart Payment Management</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <BiBuildingHouse className="w-6 h-6 text-primary-500" />
              <span className="text-lg font-semibold gradient-text">HostelMS</span>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">About</a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">Features</a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">Pricing</a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">Contact</a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">Privacy</a>
            </div>
            
            <p className="text-sm text-gray-500 mt-4 md:mt-0">
              © 2024 HostelMS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;