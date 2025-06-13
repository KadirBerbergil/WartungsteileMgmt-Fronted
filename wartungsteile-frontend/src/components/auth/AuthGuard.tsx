import React from 'react';
import { Navigate } from 'react-router-dom';
import { userService } from '../../services/userService';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole }) => {
  const isAuthenticated = userService.isAuthenticated();
  const currentUser = userService.getCurrentUserFromStorage();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && currentUser) {
    const userRole = currentUser.role.toLowerCase();
    const required = requiredRole.toLowerCase();
    
    // Admin hat Zugriff auf alles
    if (userRole === 'admin') {
      return <>{children}</>;
    }
    
    // Techniker hat Zugriff auf Techniker und Viewer Bereiche
    if (userRole === 'technician' && (required === 'technician' || required === 'viewer')) {
      return <>{children}</>;
    }
    
    // Viewer hat nur Zugriff auf Viewer Bereiche
    if (userRole === 'viewer' && required === 'viewer') {
      return <>{children}</>;
    }
    
    // Keine ausreichenden Rechte
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;