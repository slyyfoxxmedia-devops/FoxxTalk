import { Link } from 'react-router-dom'
import AuthButton from './AuthButton'

function Navbar() {
  return (
    <nav>
      <div className="container">
        <Link to="/" className="brand">SlyyFoxx Media</Link>
        <div className="nav-right">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/admin">Admin</Link></li>
          </ul>
          <AuthButton />
        </div>
      </div>
    </nav>
  )
}

export default Navbar