import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Blog() {
  const [posts, setPosts] = useState([
    {id: 1, title: "Welcome to FoxxTalk", content: "This is our first blog post on FoxxTalk. We're excited to share insights about media, technology, and creative content.", image: "https://via.placeholder.com/400x200/ff6b35/000000?text=Welcome"},
    {id: 2, title: "The Future of Digital Media", content: "Digital media is evolving rapidly. From streaming platforms to interactive content, we're seeing unprecedented changes in how audiences consume media.", image: "https://via.placeholder.com/400x200/ff6b35/000000?text=Digital+Media"},
    {id: 3, title: "Building Creative Communities", content: "Community building is at the heart of successful media ventures. Learn how to engage your audience and create lasting connections.", image: "https://via.placeholder.com/400x200/ff6b35/000000?text=Communities"}
  ])

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(err => console.log('Using mock data'))
  }, [])

  return (
    <div className="container">
      <div className="blog-header">
        <h1>FoxxTalk Blog</h1>
        <p>Latest insights and updates</p>
      </div>
      <div className="blog-grid">
        {posts.map(post => (
          <article key={post.id} className="blog-post">
            <img src={post.image} alt={post.title} className="blog-image" />
            <h2><Link to={`/blog/${post.id}`}>{post.title}</Link></h2>
            <p>{post.content.substring(0, 200)}...</p>
            <div className="post-meta">
              <span>Post #{post.id}</span>
              <Link to={`/blog/${post.id}`} className="read-more">Read Full Post</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default Blog