import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/authState'

export function ProtectedRoute() {
  const { loading, user } = useAuth()

  if (loading) {
    return <div className="loading-screen">Loading secure workspace...</div>
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />
}
