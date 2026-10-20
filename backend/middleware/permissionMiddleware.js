import asyncHandler from 'express-async-handler';

// Permission definitions
const PERMISSIONS = {
  // Student permissions
  VIEW_OWN_PROFILE: 'view_own_profile',
  EDIT_OWN_PROFILE: 'edit_own_profile',
  VIEW_OWN_ROOM: 'view_own_room',
  VIEW_OWN_PAYMENTS: 'view_own_payments',
  CREATE_COMPLAINT: 'create_complaint',
  VIEW_OWN_COMPLAINTS: 'view_own_complaints',
  
  // Admin permissions
  VIEW_ALL_STUDENTS: 'view_all_students',
  CREATE_STUDENT: 'create_student',
  EDIT_STUDENT: 'edit_student',
  DELETE_STUDENT: 'delete_student',
  
  VIEW_ALL_ROOMS: 'view_all_rooms',
  CREATE_ROOM: 'create_room',
  EDIT_ROOM: 'edit_room',
  DELETE_ROOM: 'delete_room',
  
  VIEW_ALL_PAYMENTS: 'view_all_payments',
  CREATE_PAYMENT: 'create_payment',
  EDIT_PAYMENT: 'edit_payment',
  
  VIEW_ALL_COMPLAINTS: 'view_all_complaints',
  RESOLVE_COMPLAINT: 'resolve_complaint',
  
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_REPORTS: 'view_reports',
  MANAGE_USERS: 'manage_users',
};

// Role-based permission mapping
const ROLE_PERMISSIONS = {
  admin: Object.values(PERMISSIONS),
  student: [
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.EDIT_OWN_PROFILE,
    PERMISSIONS.VIEW_OWN_ROOM,
    PERMISSIONS.VIEW_OWN_PAYMENTS,
    PERMISSIONS.CREATE_COMPLAINT,
    PERMISSIONS.VIEW_OWN_COMPLAINTS,
  ]
};

// Check if user has specific permission
const hasPermission = (user, requiredPermission) => {
  if (!user || !user.role) return false;
  
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  return userPermissions.includes(requiredPermission);
};

// Middleware to check role
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized - No user found' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden - Insufficient role permissions' });
    }
    
    next();
  };
};

// Middleware to check permission
const checkPermission = (...requiredPermissions) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized, no user found');
    }

    // Check if user has at least one of the required permissions
    const hasRequiredPermission = requiredPermissions.some(permission => 
      hasPermission(req.user, permission)
    );

    if (!hasRequiredPermission) {
      res.status(403);
      throw new Error('Forbidden - Insufficient permissions');
    }

    next();
  });
};

// Middleware to check if user is the owner of the resource
const checkOwnership = (resourceModel, paramIdField = 'id') => {
  return asyncHandler(async (req, res, next) => {
    const resourceId = req.params[paramIdField];
    
    if (!resourceId) {
      res.status(400);
      throw new Error('Resource ID not provided');
    }

    const resource = await resourceModel.findById(resourceId);
    
    if (!resource) {
      res.status(404);
      throw new Error('Resource not found');
    }

    // Check if user owns the resource or is admin
    const isOwner = resource.studentId && 
                    resource.studentId.toString() === req.user.studentId?.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403);
      throw new Error('Forbidden - You do not own this resource');
    }

    req.resource = resource;
    next();
  });
};

export {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  checkPermission,
  checkOwnership,
  checkRole
};