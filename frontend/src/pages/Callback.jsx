import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Callback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      
      if (code) {
        try {
          // Exchange code for tokens
          const response = await fetch('/api/auth/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
          })
          
          const data = await response.json()
          
          if (data.access_token) {
            localStorage.setItem('authToken', data.access_token)
            navigate('/admin')
          } else {
            navigate('/')
          }
        } catch (err) {
          console.error('Auth callback error:', err)
          navigate('/')
        }
      } else {
        navigate('/')
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="container">
      <div className="auth-callback">
        <h2>Logging you in...</h2>
        <p>Please wait while we complete your authentication.</p>
      </div>
    </div>
  )
}

export default Callback