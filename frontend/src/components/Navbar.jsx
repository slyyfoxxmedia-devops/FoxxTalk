import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import AuthButton from './AuthButton'

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken')
      setIsLoggedIn(!!token)
    }
    
    checkAuth()
    // Listen for storage changes (login/logout)
    window.addEventListener('storage', checkAuth)
    
    return () => window.removeEventListener('storage', checkAuth)
  }, [])

  return (
    <nav>
      <div className="container">
        <Link to="/" className="brand">SlyyFoxx Media</Link>
        <div className="nav-right">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            {isLoggedIn && <li><Link to="/admin">Admin</Link></li>}
          </ul>
          <AuthButton />
        </div>
      </div>
    </nav>
  )
}

export default Navbar