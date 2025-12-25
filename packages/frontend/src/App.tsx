import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { ParticlesBackground } from './components/common/ParticlesBackground'
import { ScrollToTop } from './components/common/ScrollToTop'
import { SessionTimeoutModal } from './components/common/SessionTimeoutModal'
import { useSessionTimeout } from './hooks/useSessionTimeout'
import { useAuthStore } from './store/authStore'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { DashboardPage } from './pages/DashboardPage'
import { AdminPage } from './pages/AdminPage'
import { AdminGuidePage } from './pages/AdminGuidePage'
import { ClassesPage } from './pages/ClassesPage'
import { ProfilePage } from './pages/ProfilePage'
import { NotificationsPage } from './pages/NotificationsPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import AddressPoolPage from './pages/AddressPoolPage'
import { TaskManagerPage } from './pages/TaskManagerPage'

function AppContent() {
    const [showWarning, setShowWarning] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    // Check if user is on a protected route
    const isProtectedRoute = !['/login', '/register', '/reset-password', '/'].includes(location.pathname);

    // Reset warning modal when route changes or user logs out
    useEffect(() => {
        setShowWarning(false);
    }, [location.pathname, isAuthenticated]);

    // Only activate session timeout on protected routes AND when authenticated
    const { resetTimer } = useSessionTimeout({
        timeoutMinutes: 2.5, // 2.5 minutes timeout
        warningMinutes: 0.5, // 30 seconds warning
        onWarning: () => {
            if (isProtectedRoute && isAuthenticated) {
                setShowWarning(true);
            }
        },
        onTimeout: () => {
            setShowWarning(false);
        },
    });

    const handleContinueSession = () => {
        setShowWarning(false);
        resetTimer();
    };

    const handleCloseSession = () => {
        // Clear warning modal first
        setShowWarning(false);
        // Clear auth store
        logout();
        // Clear tokens from localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // Navigate to login with replace to prevent back navigation
        navigate('/login', { replace: true });
    };

    return (
        <>
            <ParticlesBackground />
            <ScrollToTop />
            <SessionTimeoutModal
                isOpen={showWarning && isProtectedRoute && isAuthenticated}
                onClose={handleCloseSession}
                onContinue={handleContinueSession}
                remainingSeconds={30}
            />
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute requireUser>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/classes"
                    element={
                        <ProtectedRoute requireUser>
                            <ClassesPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/notifications"
                    element={
                        <ProtectedRoute requireUser>
                            <NotificationsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute requireUser>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute requireAdmin>
                            <AdminPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/guide"
                    element={
                        <ProtectedRoute requireAdmin>
                            <AdminGuidePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/address-pool"
                    element={
                        <ProtectedRoute requireAdmin requireSuperAdmin>
                            <AddressPoolPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/tasks"
                    element={
                        <ProtectedRoute requireAdmin>
                            <TaskManagerPage />
                        </ProtectedRoute>
                    }
                />
                {/* 404 - Catch all unmatched routes */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </>
    )
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    )
}

export default App
