import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { MapProvider } from './context/MapContext'
import { Suspense, lazy } from 'react'
import LoadingScreen from './components/ui/LoadingScreen'

const SignIn = lazy(() => import('./components/auth/SignIn'))
const SignUp = lazy(() => import('./components/auth/SignUp'))
const ForgotPassword = lazy(() => import('./components/auth/ForgotPassword'))
const CampusMap = lazy(() => import('./components/map/CampusMap'))
const EventsPage = lazy(() => import('./pages/EventsPage'))
const LostFoundPage = lazy(() => import('./pages/LostFoundPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Public route: redirect to map if already logged in
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return isAuthenticated ? <Navigate to="/map" replace /> : children
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
        <Route path="/" element={<Navigate to="/map" replace />} />
        <Route path="/login" element={<PublicRoute><SignIn /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><SignUp /></PublicRoute>} />
        <Route path="/signin" element={<Navigate to="/login" replace />} />
        <Route path="/forgot-password" element={<SemiPublicRoute><ForgotPassword /></SemiPublicRoute>} />

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
              <EventsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/lost-found"
          element={
            <ProtectedRoute>
              <LostFoundPage />
            </ProtectedRoute>
          }
        />

        <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/map" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
