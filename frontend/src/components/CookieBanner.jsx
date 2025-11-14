import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookieConsent')
    if (!cookieConsent) {
      setShowBanner(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted')
    setShowBanner(false)
  }

  const declineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="cookie-banner">
      <div className="cookie-content">
        <p>We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.</p>
        <div className="cookie-actions">
          <button onClick={acceptCookies} className="accept-btn">Accept</button>
          <button onClick={declineCookies} className="decline-btn">Decline</button>
          <Link to="/cookies" className="cookie-link">Learn More</Link>
        </div>
      </div>
    </div>
  )
}

export default CookieBanner