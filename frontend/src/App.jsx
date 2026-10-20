import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import StudentManagement from './components/admin/StudentManagement';
import RoomManagement from './components/admin/RoomManagement';
import PaymentManagement from './components/admin/PaymentManagement';
import ComplaintManagement from './components/admin/ComplaintManagement';
import Reports from './components/admin/Reports';

// Student Components
import StudentDashboard from './components/student/StudentDashboard';
import MyProfile from './components/student/MyProfile';
import MyRoom from './components/student/MyRoom';
import MyPayments from './components/student/MyPayments';
import MyComplaints from './components/student/MyComplaints';

// Common Components
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import ProtectedRoute from './components/common/ProtectedRoute';
import { PageLoader } from './components/common/Loader';

// Styles
import './styles/global.css';
import './styles/components.css';

// Layout Components
const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <div className="flex">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 w-full transition-all duration-300 overflow-x-hidden">
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={window.location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

const StudentLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <div className="flex">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 w-full transition-all duration-300 overflow-x-hidden">
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={window.location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="glass-card p-8 max-w-md text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We're sorry, but something went wrong. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main App Content
const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  return (
    <ErrorBoundary>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute role="admin" />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<StudentManagement />} />
              <Route path="rooms" element={<RoomManagement />} />
              <Route path="payments" element={<PaymentManagement />} />
              <Route path="complaints" element={<ComplaintManagement />} />
              <Route path="reports" element={<Reports />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
          </Route>

          {/* Student Routes */}
          <Route path="/student" element={<ProtectedRoute role="student" />}>
            <Route element={<StudentLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="profile" element={<MyProfile />} />
              <Route path="room" element={<MyRoom />} />
              <Route path="payments" element={<MyPayments />} />
              <Route path="complaints" element={<MyComplaints />} />
              <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
            </Route>
          </Route>

          {/* Catch all - 404 */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center p-4">
              <div className="text-center">
                <div className="text-9xl font-bold gradient-text mb-4">404</div>
                <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  The page you're looking for doesn't exist or has been moved.
                </p>
                <button
                  onClick={() => window.history.back()}
                  className="btn-secondary mr-4"
                >
                  Go Back
                </button>
                <Link to="/" className="btn-primary">
                  Go Home
                </Link>
              </div>
            </div>
          } />
        </Routes>
      </AnimatePresence>
    </ErrorBoundary>
  );
};

// Main App Component
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          containerClassName="!z-[9999]"
          toastOptions={{
            duration: 4000,
            className: 'toast',
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
              className: 'toast-success',
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
              className: 'toast-error',
            },
            loading: {
              duration: Infinity,
              className: 'toast-info',
            },
            style: {
              background: 'transparent',
              boxShadow: 'none',
              padding: 0,
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;