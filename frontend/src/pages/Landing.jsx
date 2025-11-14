import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Landing() {
  const [featuredPosts] = useState([
    {id: 1, title: "Welcome to FoxxTalk", content: "This is our first blog post on FoxxTalk. We're excited to share insights about media, technology, and creative content."},
    {id: 2, title: "The Future of Digital Media", content: "Digital media is evolving rapidly. From streaming platforms to interactive content, we're seeing unprecedented changes."},
    {id: 3, title: "Building Creative Communities", content: "Community building is at the heart of successful media ventures. Learn how to engage your audience."}
  ])

  return (
    <div>
      <div className="container">
        <div className="hero">
          <h1>FoxxTalk</h1>
          <p>A Blog for Every Conversation</p>
        </div>
      </div>
      
      <section className="featured-section">
        <div className="container">
          <h2>Featured Posts</h2>
          <div className="featured-grid">
            {featuredPosts.map(post => (
              <div key={post.id} className="featured-post">
                <h3>{post.title}</h3>
                <p>{post.content.substring(0, 120)}...</p>
                <Link to={`/blog/${post.id}`} className="read-more">Read More</Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Landing