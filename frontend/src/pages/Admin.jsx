import { useState, useEffect } from 'react'

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
  const [activeSubTab, setActiveSubTab] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, category, tags, image, author, authorImage, published: true })
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

        <button 
          className={activeTab === 'forms' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('forms')}
        >
          Forms
        </button>
        <button 
          className={activeTab === 'settings' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('settings')}
        >
          Settings
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
              <button type="button" className="draft-btn" onClick={async (e) => {
                e.preventDefault()
                const form = e.target.closest('form')
                const formData = new FormData(form)
                try {
                  await fetch('/api/posts', {
                    method: 'POST',
                    headers: { 
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    },
                    body: JSON.stringify({ 
                      title, content, category, tags, image, author, authorImage, 
                      published: false 
                    })
                  })
                  alert('Draft saved!')
                  // Reset form
                  setTitle(''); setContent(''); setImage(''); setTags(''); setCategory(''); setAuthor(''); setAuthorImage('')
                } catch (err) {
                  console.error(err)
                }
              }}>Save as Draft</button>
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

      {activeTab === 'forms' && (
        <div className="admin-section">
          <h2>Content Forms</h2>
          
          <div className="forms-tabs">
            <button 
              className={activeTab === 'forms' && !activeSubTab ? 'tab active' : 'tab'}
              onClick={() => setActiveSubTab('')}
            >
              Landing Page
            </button>
            <button 
              className={activeSubTab === 'blog' ? 'tab active' : 'tab'}
              onClick={() => setActiveSubTab('blog')}
            >
              Blog Settings
            </button>
            <button 
              className={activeSubTab === 'global' ? 'tab active' : 'tab'}
              onClick={() => setActiveSubTab('global')}
            >
              Global Settings
            </button>
          </div>

          {!activeSubTab && (
            <div className="form-section">
              <h3>Landing Page Editor</h3>
              <form className="admin-form">
                {/* Hero Section */}
                <div className="section-editor">
                  <h4>Hero Section</h4>
                  <div className="form-group">
                    <label>Hero Title</label>
                    <input type="text" defaultValue="FoxxTalk" />
                  </div>
                  <div className="form-group">
                    <label>Hero Subtitle</label>
                    <input type="text" defaultValue="A Blog for Every Conversation" />
                  </div>
                  <div className="form-group">
                    <label>Background Color</label>
                    <input type="color" defaultValue="#000000" />
                  </div>
                </div>

                {/* Featured Posts Section */}
                <div className="section-editor">
                  <h4>Featured Posts Section</h4>
                  <div className="form-group">
                    <label>Section Title</label>
                    <input type="text" defaultValue="Featured Posts" />
                  </div>
                  <div className="form-group">
                    <label>Number of Posts</label>
                    <input type="number" defaultValue="3" min="1" max="6" />
                  </div>
                  <div className="form-group">
                    <label>Show Section</label>
                    <input type="checkbox" defaultChecked />
                  </div>
                </div>

                {/* Add New Section */}
                <div className="add-section">
                  <button type="button" className="draft-btn">+ Add New Section</button>
                  <select className="section-type">
                    <option value="text">Text Section</option>
                    <option value="video">Video Section</option>
                    <option value="gallery">Image Gallery</option>
                    <option value="cta">Call to Action</option>
                    <option value="testimonials">Testimonials</option>
                    <option value="features">Features Grid</option>
                    <option value="about">About Section</option>
                    <option value="contact">Contact Section</option>
                    <option value="stats">Stats/Numbers</option>
                    <option value="team">Team Section</option>
                  </select>
                </div>

                <button type="submit" className="publish-btn">Save Landing Page</button>
              </form>
            </div>
          )}

          {activeSubTab === 'blog' && (
            <div className="form-section">
              <h3>Blog Page Settings</h3>
              <form className="admin-form">
                {/* Blog Header Section */}
                <div className="section-editor">
                  <h4>Blog Header</h4>
                  <div className="form-group">
                    <label>Header Title</label>
                    <input type="text" defaultValue="FoxxTalk Blog" />
                  </div>
                  <div className="form-group">
                    <label>Header Subtitle</label>
                    <input type="text" defaultValue="Latest insights and updates" />
                  </div>
                  <div className="form-group">
                    <label>Header Background Color</label>
                    <input type="color" defaultValue="#000000" />
                  </div>
                </div>

                {/* Blog Settings */}
                <div className="section-editor">
                  <h4>Blog Settings</h4>
                  <div className="form-group">
                    <label>Posts Per Page</label>
                    <input type="number" defaultValue="12" min="1" max="20" />
                  </div>
                  <div className="form-group">
                    <label>Show Search Bar</label>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="form-group">
                    <label>Show Category Filter</label>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="form-group">
                    <label>Available Categories</label>
                    <input type="text" defaultValue="general,tech,media,creative,business" placeholder="Comma separated" />
                  </div>
                </div>

                {/* Pagination Settings */}
                <div className="section-editor">
                  <h4>Pagination</h4>
                  <div className="form-group">
                    <label>Show Pagination</label>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="form-group">
                    <label>Pagination Style</label>
                    <select defaultValue="numbers">
                      <option value="numbers">Page Numbers</option>
                      <option value="simple">Previous/Next Only</option>
                      <option value="load-more">Load More Button</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="publish-btn">Save Blog Settings</button>
              </form>
            </div>
          )}

          {activeSubTab === 'global' && (
            <div className="form-section">
              <h3>Global Settings</h3>
              <form className="admin-form">
                <div className="form-group">
                  <label>Site Title</label>
                  <input type="text" placeholder="SlyyFoxx Media" />
                </div>
                <div className="form-group">
                  <label>Primary Color</label>
                  <input type="color" defaultValue="#ff6b35" />
                </div>
                <div className="form-group">
                  <label>Logo</label>
                  <input type="file" accept="image/*" />
                </div>
                <div className="form-group">
                  <label>Contact Email</label>
                  <input type="email" placeholder="contact@slyyfoxxmedia.com" />
                </div>
                <div className="form-group">
                  <label>Social Media Links</label>
                  <input type="url" placeholder="Twitter URL" />
                  <input type="url" placeholder="Instagram URL" />
                  <input type="url" placeholder="LinkedIn URL" />
                </div>
                <div className="form-group">
                  <label>Footer Text</label>
                  <textarea rows="2" placeholder="Footer copyright text"></textarea>
                </div>
                <button type="submit" className="publish-btn">Save Global Settings</button>
              </form>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="admin-section">
          <h2>Settings</h2>
          <div className="user-info-display">
            <h3>Account Information</h3>
            <p><strong>User ID:</strong> {JSON.parse(localStorage.getItem('userData') || '{}').id || 'N/A'}</p>
            <p><strong>Email:</strong> {JSON.parse(localStorage.getItem('userData') || '{}').email || 'N/A'}</p>
          </div>
          <div className="settings-form">
            <h3>Change Email</h3>
            <form onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              const newEmail = formData.get('newEmail')
              
              try {
                const response = await fetch('/api/auth/change-email', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                  },
                  body: JSON.stringify({ newEmail })
                })
                
                if (response.ok) {
                  alert('Email changed successfully')
                  // Update stored user data
                  const userData = JSON.parse(localStorage.getItem('userData'))
                  userData.email = newEmail
                  localStorage.setItem('userData', JSON.stringify(userData))
                  window.location.reload()
                } else {
                  const data = await response.json()
                  alert(data.detail || 'Failed to change email')
                }
              } catch (err) {
                alert('Failed to change email')
              }
            }}>
              <div className="form-group">
                <label>New Email</label>
                <input type="email" name="newEmail" required />
              </div>
              <button type="submit" className="publish-btn">Change Email</button>
            </form>
            
            <h3>Change Password</h3>
            <form onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              const currentPassword = formData.get('currentPassword')
              const newPassword = formData.get('newPassword')
              const confirmPassword = formData.get('confirmPassword')
              
              if (newPassword !== confirmPassword) {
                alert('New passwords do not match')
                return
              }
              
              try {
                const response = await fetch('/api/auth/change-password', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                  },
                  body: JSON.stringify({ currentPassword, newPassword })
                })
                
                if (response.ok) {
                  alert('Password changed successfully')
                  e.target.reset()
                } else {
                  const data = await response.json()
                  alert(data.detail || 'Failed to change password')
                }
              } catch (err) {
                alert('Failed to change password')
              }
            }}>
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" name="currentPassword" required />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" name="newPassword" required />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" name="confirmPassword" required />
              </div>
              <button type="submit" className="publish-btn">Change Password</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin