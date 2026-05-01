import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { MapProvider } from './context/MapContext'
import { Suspense, lazy } from 'react'
import LoadingScreen from './components/ui/LoadingScreen'
import MainLayout from './components/layout/MainLayout'

const SignIn = lazy(() => import('./components/auth/SignIn'))
const SignUp = lazy(() => import('./components/auth/SignUp'))
const ForgotPassword = lazy(() => import('./components/auth/ForgotPassword'))
const CampusMap = lazy(() => import('./components/map/CampusMap'))
const HomePage = lazy(() => import('./pages/HomePage'))
const EventsPage = lazy(() => import('./pages/EventsPage'))
const LostFoundPage = lazy(() => import('./pages/LostFoundPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Public route: redirect to home if already logged in
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return isAuthenticated ? <Navigate to="/home" replace /> : children
}

// Semi-public: accessible to all (guests can view)
const SemiPublicRoute = ({ children }) => {
  const { loading } = useAuth()
  if (loading) return <LoadingScreen />
  return children
}

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/login" element={<PublicRoute><SignIn /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><SignUp /></PublicRoute>} />
        <Route path="/signin" element={<Navigate to="/login" replace />} />
        <Route path="/forgot-password" element={<SemiPublicRoute><ForgotPassword /></SemiPublicRoute>} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <MainLayout>
                <HomePage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <MapProvider>
                <CampusMap />
              </MapProvider>
            </ProtectedRoute>
          }
        />

        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <MainLayout>
                <EventsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/lost-found"
          element={
            <ProtectedRoute>
              <MainLayout>
                <LostFoundPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AdminPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
