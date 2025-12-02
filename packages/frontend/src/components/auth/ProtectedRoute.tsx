import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
    requireAdmin?: boolean;
    requireUser?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requireAdmin = false,
    requireUser = false,
}) => {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && user?.role === 'USER') {
        return <Navigate to="/dashboard" replace />;
    }

    if (requireUser && (user?.role === 'SUBADMIN' || user?.role === 'SUPERADMIN')) {
        return <Navigate to="/admin" replace />;
    }

    return <>{children}</>;
};
