import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Error handling for the entire app
const handleGlobalError = (error, errorInfo) => {
  console.error('Global Error:', error, errorInfo);
  // You can send this to an error tracking service
};

// Performance monitoring
const reportWebVitals = (metric) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(metric);
  }
  // You can send metrics to analytics service
};

// Initialize app with error boundary
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    // Show update notification
    if (window.confirm('New version available! Click OK to update.')) {
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  },
  onSuccess: () => {
    console.log('Service worker registered successfully');
  },
});

// Report web vitals
if (process.env.NODE_ENV === 'production') {
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(reportWebVitals);
    getFID(reportWebVitals);
    getFCP(reportWebVitals);
    getLCP(reportWebVitals);
    getTTFB(reportWebVitals);
  });
}

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
  event.preventDefault();
});

// Handle global errors
window.addEventListener('error', (event) => {
  console.error('Global Error:', event.error);
  handleGlobalError(event.error, { source: event.filename, line: event.lineno });
});