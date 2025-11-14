import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    setIsAuthenticated(!!token)
  }, [])

  if (isAuthenticated === null) {
    return <div className="container">Loading...</div>
  }

  return isAuthenticated ? children : <Navigate to="/" replace />
}

export default ProtectedRoute