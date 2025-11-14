import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import CookieBanner from '../components/CookieBanner'
import SectionRenderer from '../components/SectionRenderer'

function Landing() {
  const [featuredPosts, setFeaturedPosts] = useState([
    {id: 1, title: "Welcome to FoxxTalk", content: "This is our first blog post on FoxxTalk. We're excited to share insights about media, technology, and creative content.", image: "https://picsum.photos/300/200?random=1", author: "SlyyFoxx", authorImage: "https://picsum.photos/40/40?random=101"},
    {id: 2, title: "The Future of Digital Media", content: "Digital media is evolving rapidly. From streaming platforms to interactive content, we're seeing unprecedented changes.", image: "https://picsum.photos/300/200?random=2", author: "SlyyFoxx", authorImage: "https://picsum.photos/40/40?random=101"},
    {id: 3, title: "Building Creative Communities", content: "Community building is at the heart of successful media ventures. Learn how to engage your audience.", image: "https://picsum.photos/300/200?random=3", author: "SlyyFoxx", authorImage: "https://picsum.photos/40/40?random=101"}
  ])
  const [landingData, setLandingData] = useState({
    hero: { title: 'FoxxTalk', subtitle: 'A Blog for Every Conversation' },
    sections: []
  })

  useEffect(() => {
    // Fetch latest posts for featured section
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        const featured = data.slice(-3).reverse()
        if (featured.length > 0) {
          setFeaturedPosts(featured)
        }
      })
      .catch(err => console.log('Using mock featured posts'))
    
    // Fetch landing page data
    fetch('/api/landing')
      .then(res => {
        if (res.ok) {
          return res.json()
        }
        throw new Error('Failed to fetch')
      })
      .then(data => {
        if (data && data.hero) {
          setLandingData(data)
        }
      })
      .catch(err => {
        console.log('Using default landing data:', err)
      })
  }, [])

  return (
    <div>
      <div className="container">
        <div className="hero">
          <h1>{landingData.hero?.title || 'FoxxTalk'}</h1>
          <p>{landingData.hero?.subtitle || 'A Blog for Every Conversation'}</p>
        </div>
      </div>
      
      <section className="featured-section">
        <div className="container">
          <h2>Featured Posts</h2>
          <div className="featured-grid">
            {featuredPosts.map(post => (
              <div key={post.id} className="featured-post">
                <img src={post.image} alt={post.title} className="featured-image" />
                <h3>{post.title}</h3>
                <p>{post.content.substring(0, 120)}...</p>
                <div className="featured-author">
                  <img src={post.authorImage} alt={post.author} className="author-avatar" />
                  <span className="author-name">{post.author}</span>
                </div>
                <Link to={`/blog/${post.id}`} className="read-more">Read More</Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <SectionRenderer sections={landingData.sections} />
      
      <CookieBanner />
    </div>
  )
}

export default Landing