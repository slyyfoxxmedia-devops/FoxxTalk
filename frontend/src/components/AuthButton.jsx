import { useState, useEffect } from 'react'

function AuthButton() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const COGNITO_DOMAIN = process.env.REACT_APP_COGNITO_DOMAIN || 'https://foxxtalk.auth.us-east-1.amazoncognito.com'
  const CLIENT_ID = process.env.REACT_APP_COGNITO_CLIENT_ID || 'your-client-id'
  const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI || 'http://localhost:3000/callback'

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser({ email: payload.email, name: payload.name })
      } catch (err) {
        localStorage.removeItem('authToken')
      }
    }
    setLoading(false)
  }, [])

  const login = () => {
    const loginUrl = `${COGNITO_DOMAIN}/login?client_id=${CLIENT_ID}&response_type=code&scope=email+openid+profile&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
    window.location.href = loginUrl
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    setUser(null)
    const logoutUrl = `${COGNITO_DOMAIN}/logout?client_id=${CLIENT_ID}&logout_uri=${encodeURIComponent(window.location.origin)}`
    window.location.href = logoutUrl
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="auth-section">
      {user ? (
        <div className="user-info">
          <span>Welcome, {user.email}</span>
          <button onClick={logout} className="auth-btn logout">Logout</button>
        </div>
      ) : (
        <button onClick={login} className="auth-btn login">Login</button>
      )}
    </div>
  )
}

export default AuthButton