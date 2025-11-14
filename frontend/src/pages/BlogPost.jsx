import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

function BlogPost() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  
  const mockPosts = {
    1: {id: 1, title: "Welcome to FoxxTalk", content: "This is our first blog post on FoxxTalk. We're excited to share insights about media, technology, and creative content. This platform will serve as a hub for meaningful conversations across various topics.", image: "https://picsum.photos/800/400?random=1", author: "SlyyFoxx", authorImage: "https://picsum.photos/40/40?random=101"},
    2: {id: 2, title: "The Future of Digital Media", content: "Digital media is evolving rapidly. From streaming platforms to interactive content, we're seeing unprecedented changes in how audiences consume media. The landscape continues to shift with new technologies.", image: "https://picsum.photos/800/400?random=2", author: "SlyyFoxx", authorImage: "https://picsum.photos/40/40?random=101"},
    3: {id: 3, title: "Building Creative Communities", content: "Community building is at the heart of successful media ventures. Learn how to engage your audience and create lasting connections that drive meaningful interaction and growth.", image: "https://picsum.photos/800/400?random=3", author: "SlyyFoxx", authorImage: "https://picsum.photos/40/40?random=101"}
  }

  useEffect(() => {
    const foundPost = mockPosts[id]
    if (foundPost) {
      setPost(foundPost)
    }
  }, [id])

  if (!post) {
    return (
      <div className="container">
        <div className="blog-post-page">
          <p>Post not found</p>
          <Link to="/blog">← Back to Blog</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="blog-post-page">
        <Link to="/blog" className="back-link">← Back to Blog</Link>
        <article>
          <h1>{post.title}</h1>
          <div className="post-author-header">
            <img src={post.authorImage} alt={post.author} className="author-avatar-large" />
            <div className="author-details">
              <span className="author-name-large">{post.author}</span>
              <span className="post-date">Published recently</span>
            </div>
          </div>
          {post.image && <img src={post.image} alt={post.title} className="post-hero-image" />}
          <div className="post-content">
            <p>{post.content}</p>
          </div>
        </article>
      </div>
    </div>
  )
}

export default BlogPost