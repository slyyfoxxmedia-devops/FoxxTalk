import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function AuthButton() {
  const [user, setUser] = useState(null)
  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token) {
      try {
        const userData = JSON.parse(localStorage.getItem('userData'))
        setUser(userData)
      } catch (err) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('userData')
      }
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('userData', JSON.stringify(data.user))
        setUser(data.user)
        setShowLogin(false)
        window.dispatchEvent(new Event('storage')) // Trigger navbar update
        navigate('/admin')
      } else {
        alert(data.message || 'Login failed')
      }
    } catch (err) {
      alert('Login failed. Please try again.')
    }
    setLoading(false)
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    setUser(null)
    window.dispatchEvent(new Event('storage')) // Trigger navbar update
    navigate('/')
  }

  return (
    <div className="auth-section">
      {user ? (
        <div className="user-info">
          <span>Welcome, {user.email}</span>
          <button onClick={logout} className="auth-btn logout">Logout</button>
        </div>
      ) : (
        <>
          <button onClick={() => setShowLogin(true)} className="auth-btn login">Login</button>
          {showLogin && (
            <div className="login-modal">
              <div className="login-form">
                <h3>Admin Login</h3>
                <form onSubmit={handleLogin}>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div className="form-actions">
                    <button type="button" onClick={() => setShowLogin(false)}>Cancel</button>
                    <button type="submit" disabled={loading}>
                      {loading ? 'Logging in...' : 'Login'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AuthButton