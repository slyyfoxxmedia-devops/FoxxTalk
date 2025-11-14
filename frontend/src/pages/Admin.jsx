import { useState } from 'react'

function Admin() {
  const [activeTab, setActiveTab] = useState('create')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [image, setImage] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [author, setAuthor] = useState('')
  const [authorImage, setAuthorImage] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, category, tags, image, author, authorImage })
      })
      setTitle('')
      setContent('')
      setImage('')
      setTags('')
      setCategory('')
      setAuthor('')
      setAuthorImage('')
      alert('Post created!')
    } catch (err) {
      console.error(err)
    }
  }

  const uploadImage = async (file) => {
    setUploading(true)
    const formData = new FormData()
    formData.append('image', file)
    
    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      })
      const data = await response.json()
      setImage(data.url)
    } catch (err) {
      console.error('Upload failed:', err)
    }
    setUploading(false)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      uploadImage(file)
    }
  }

  const generateWithAI = async (prompt) => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Add auth for AI features
        },
        body: JSON.stringify({ prompt, currentData: { title, content, category, tags } })
      })
      const data = await response.json()
      
      if (data.title) setTitle(data.title)
      if (data.content) setContent(data.content)
      if (data.tags) setTags(data.tags)
      if (data.category) setCategory(data.category)
      if (data.image) setImage(data.image)
    } catch (err) {
      console.error('AI generation failed:', err)
    }
    setIsGenerating(false)
  }

  return (
    <div className="container admin-panel">
      <h1>Admin Panel</h1>
      
      <div className="admin-tabs">
        <button 
          className={activeTab === 'create' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('create')}
        >
          Create Post
        </button>
        <button 
          className={activeTab === 'analytics' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
        <button 
          className={activeTab === 'manage' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('manage')}
        >
          Manage Posts
        </button>
      </div>

      {activeTab === 'create' && (
        <div className="create-post-section">
          <div className="section-header">
            <h2>Create New Post</h2>
            <div className="ai-actions">
              <button type="button" className="ai-btn" onClick={() => generateWithAI('generate_ideas')} disabled={isGenerating}>
                {isGenerating ? 'Generating...' : '🤖 Generate Ideas'}
              </button>
              <button type="button" className="ai-btn" onClick={() => generateWithAI('improve_content')} disabled={isGenerating}>
                🚀 Improve Content
              </button>
              <button type="button" className="ai-btn" onClick={() => generateWithAI('complete_post')} disabled={isGenerating}>
                ✨ Complete Post
              </button>
            </div>
          </div>
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Post Title</label>
              <input
                type="text"
                placeholder="Enter an engaging title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                placeholder="Enter category (e.g., tech, business, creative)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>Tags</label>
              <input
                type="text"
                placeholder="react, javascript, tutorial (comma separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <small>Separate tags with commas</small>
            </div>
            
            <div className="form-group">
              <label>Featured Image</label>
              <div className="image-upload-section">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="upload-btn">
                  {uploading ? 'Uploading...' : '📁 Upload Image'}
                </label>
                <span className="upload-divider">or</span>
                <input
                  type="url"
                  placeholder="Paste image URL"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="url-input"
                />
              </div>
              {image && <img src={image} alt="Preview" className="image-preview" />}
            </div>
            
            <div className="form-group">
              <label>Author Name</label>
              <input
                type="text"
                placeholder="Enter author name"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Author Profile Image</label>
              <input
                type="url"
                placeholder="Paste author image URL"
                value={authorImage}
                onChange={(e) => setAuthorImage(e.target.value)}
              />
              {authorImage && <img src={authorImage} alt="Author Preview" className="author-preview" />}
            </div>
            
            <div className="form-group">
              <label>Post Content</label>
              <textarea
                placeholder="Write your blog post content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="15"
                required
              />
            </div>
            
            <div className="form-actions">
              <button type="button" className="draft-btn">Save as Draft</button>
              <button type="submit" className="publish-btn">Publish Post</button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="admin-section">
          <h2>Blog Analytics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Posts</h3>
              <p className="stat-number">3</p>
            </div>
            <div className="stat-card">
              <h3>Total Views</h3>
              <p className="stat-number">1,247</p>
            </div>
            <div className="stat-card">
              <h3>This Month</h3>
              <p className="stat-number">342</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="admin-section">
          <h2>Manage Posts</h2>
          <div className="post-list">
            <div className="post-item">
              <span>Welcome to FoxxTalk</span>
              <div>
                <button className="edit-btn">Edit</button>
                <button className="delete-btn">Delete</button>
              </div>
            </div>
            <div className="post-item">
              <span>The Future of Digital Media</span>
              <div>
                <button className="edit-btn">Edit</button>
                <button className="delete-btn">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin