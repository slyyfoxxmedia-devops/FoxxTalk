import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Blog() {
  const [posts, setPosts] = useState([
    {id: 1, title: "Welcome to FoxxTalk", content: "This is our first blog post on FoxxTalk. We're excited to share insights about media, technology, and creative content.", image: "https://picsum.photos/400/200?random=1", category: "general", author: "SlyyFoxx", authorImage: "https://picsum.photos/40/40?random=101"},
    {id: 2, title: "The Future of Digital Media", content: "Digital media is evolving rapidly. From streaming platforms to interactive content, we're seeing unprecedented changes in how audiences consume media.", image: "https://picsum.photos/400/200?random=2", category: "media", author: "SlyyFoxx", authorImage: "https://picsum.photos/40/40?random=101"},
    {id: 3, title: "Building Creative Communities", content: "Community building is at the heart of successful media ventures. Learn how to engage your audience and create lasting connections.", image: "https://picsum.photos/400/200?random=3", category: "business", author: "SlyyFoxx", authorImage: "https://picsum.photos/40/40?random=101"},
    {id: 4, title: "Content Strategy Basics", content: "Learn the fundamentals of creating engaging content that resonates with your audience.", image: "https://picsum.photos/400/200?random=4", category: "business", author: "SlyyFoxx", authorImage: "https://picsum.photos/40/40?random=101"},
    {id: 5, title: "Social Media Trends", content: "Stay ahead of the curve with the latest social media trends and platform updates.", image: "https://picsum.photos/400/200?random=5", category: "tech", author: "SlyyFoxx", authorImage: "https://picsum.photos/40/40?random=101"},
    {id: 6, title: "Video Production Tips", content: "Professional video production techniques for content creators on any budget.", image: "https://picsum.photos/400/200?random=6", category: "creative", author: "SlyyFoxx", authorImage: "https://picsum.photos/40/40?random=101"}
  ])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const postsPerPage = 3
  
  // Filter posts based on search and category
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })
  
  // Calculate pagination
  const indexOfLastPost = currentPage * postsPerPage
  const indexOfFirstPost = indexOfLastPost - postsPerPage
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost)
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data)
        // Update featured posts on landing page with latest 3 posts
        const featured = data.slice(-3).reverse() // Get 3 newest posts
        // This would update a global state or context in a real app
      })
      .catch(err => console.log('Using mock data'))
  }, [])

  return (
    <div className="container">
      <div className="blog-header">
        <h1>FoxxTalk Blog</h1>
        <p>Latest insights and updates</p>
        
        <div className="blog-filters">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="search-input"
            />
          </div>
          
          <div className="category-filter">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setCurrentPage(1)
              }}
              className="category-select"
            >
              <option value="all">All Categories</option>
              <option value="general">General</option>
              <option value="tech">Technology</option>
              <option value="media">Media</option>
              <option value="creative">Creative</option>
              <option value="business">Business</option>
            </select>
          </div>
        </div>
      </div>
      <div className="blog-grid">
        {currentPosts.map(post => (
          <article key={post.id} className="blog-post">
            <img src={post.image} alt={post.title} className="blog-image" />
            <h2><Link to={`/blog/${post.id}`}>{post.title}</Link></h2>
            <p>{post.content.substring(0, 200)}...</p>
            <div className="post-meta">
              <div className="author-info">
                <img src={post.authorImage} alt={post.author} className="author-avatar" />
                <span className="author-name">{post.author}</span>
              </div>
              <Link to={`/blog/${post.id}`} className="read-more">Read Full Post</Link>
            </div>
          </article>
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="page-btn"
          >
            ← Previous
          </button>
          
          <div className="page-numbers">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={currentPage === index + 1 ? 'page-btn active' : 'page-btn'}
              >
                {index + 1}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}

export default Blog