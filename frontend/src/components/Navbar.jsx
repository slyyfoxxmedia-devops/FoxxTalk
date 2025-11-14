import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav>
      <div className="container">
        <Link to="/" className="brand">SlyyFoxx Media</Link>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/blog">Blog</Link></li>
          <li><Link to="/admin">Admin</Link></li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar