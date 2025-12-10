import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ParticlesBackground } from './components/common/ParticlesBackground'
import { ScrollToTop } from './components/common/ScrollToTop'
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
import { ProtectedRoute } from './components/auth/ProtectedRoute'

function App() {
    return (
        <Router>
            <ParticlesBackground />
            <ScrollToTop />
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
            </Routes>
        </Router>
    )
}

export default App
