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
  const [landingData, setLandingData] = useState({
    hero: { title: 'FoxxTalk', subtitle: 'A Blog for Every Conversation', backgroundColor: '#000000', show: true },
    featuredPosts: { title: 'Featured Posts', count: 3, show: true },
    sections: []
  })
  const [blogSettings, setBlogSettings] = useState({
    headerTitle: 'FoxxTalk Blog',
    headerSubtitle: 'Latest insights and updates',
    backgroundColor: '#000000',
    postsPerPage: 12,
    showSearch: true,
    showCategories: true,
    categories: 'general,tech,media,creative,business',
    showPagination: true,
    paginationStyle: 'numbers'
  })
  const [globalSettings, setGlobalSettings] = useState({
    siteTitle: 'SlyyFoxx Media',
    siteTagline: '',
    logoUrl: '',
    primaryColor: '#ff6b35',
    secondaryColor: '#ff8c42',
    backgroundColor: '#000000',
    textColor: '#ff6b35',
    borderColor: '#ff6b35',
    primaryFont: 'Orbitron',
    headingFontSize: 2.5,
    bodyFontSize: 1,
    fontWeight: '700',
    containerMaxWidth: 1200,
    sectionPadding: 4,
    borderRadius: 8,
    contactEmail: 'contact@slyyfoxxmedia.com',
    phoneNumber: '',
    address: '',
    socialTwitter: '',
    socialInstagram: '',
    socialLinkedIn: '',
    socialYouTube: '',
    socialFacebook: '',
    analyticsId: '',
    geminiApiKey: '',
    enableAI: true,
    enableAnalytics: true,
    metaDescription: '',
    metaKeywords: '',
    siteLanguage: 'en',
    footerText: '© 2024 SlyyFoxx Media. All rights reserved.',
    showSocialInFooter: true,
    customCSS: '',
    customJS: ''
  })
  const [posts, setPosts] = useState([])
  const [analytics, setAnalytics] = useState({ totalPosts: 0, totalViews: 0, monthlyViews: 0 })

  const handleLandingSubmit = async (e) => {
    e.preventDefault()
    try {
      await fetch('/api/landing', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(landingData)
      })
      alert('Landing page saved!')
    } catch (err) {
      console.error('Failed to save landing page:', err)
    }
  }

  const loadLandingData = async () => {
    try {
      const response = await fetch('/api/landing')
      if (response.ok) {
        const data = await response.json()
        setLandingData(data)
      }
    } catch (err) {
      console.error('Failed to load landing data:', err)
    }
  }

  const handleBlogSubmit = async (e) => {
    e.preventDefault()
    try {
      await fetch('/api/blog-settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(blogSettings)
      })
      alert('Blog settings saved!')
    } catch (err) {
      console.error('Failed to save blog settings:', err)
    }
  }

  const loadBlogSettings = async () => {
    try {
      const response = await fetch('/api/blog-settings')
      if (response.ok) {
        const data = await response.json()
        setBlogSettings(data)
      }
    } catch (err) {
      console.error('Failed to load blog settings:', err)
    }
  }

  const handleGlobalSubmit = async (e) => {
    e.preventDefault()
    try {
      await fetch('/api/global-settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(globalSettings)
      })
      alert('Global settings saved!')
    } catch (err) {
      console.error('Failed to save global settings:', err)
    }
  }

  useEffect(() => {
    if (activeTab === 'forms') {
      loadLandingData().catch(console.error)
      loadBlogSettings().catch(console.error)
    }
    // Temporarily disabled
    // if (activeTab === 'manage') {
    //   loadPosts()
    // }
    // if (activeTab === 'analytics') {
    //   loadAnalytics()
    // }
  }, [activeTab])

  const loadPosts = async () => {
    try {
      const response = await fetch('/api/posts')
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (err) {
      console.error('Failed to load posts:', err)
    }
  }

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (err) {
      console.error('Failed to load analytics:', err)
    }
  }

  const deletePost = async (postId) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await fetch(`/api/posts/${postId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        })
        loadPosts()
        alert('Post deleted successfully')
      } catch (err) {
        console.error('Failed to delete post:', err)
      }
    }
  }

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

  const handleAuthorImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setUploading(true)
    const formData = new FormData()
    formData.append('image', file)
    
    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      })
      const data = await response.json()
      setAuthorImage(data.url)
    } catch (err) {
      console.error('Author image upload failed:', err)
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

  const generateAIImage = async (prompt) => {
    if (!prompt.trim()) {
      alert('Please enter a description for the image')
      return
    }
    
    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ prompt })
      })
      const data = await response.json()
      
      if (data.imageUrl) {
        setImage(data.imageUrl)
      } else {
        alert('Failed to generate image')
      }
    } catch (err) {
      console.error('AI image generation failed:', err)
      alert('Failed to generate image')
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
          </div>
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Post Title</label>
              <div className="field-with-ai">
                <input
                  type="text"
                  placeholder="Enter an engaging title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <button type="button" className="field-ai-btn" onClick={() => generateWithAI('generate_title')} disabled={isGenerating}>
                  🤖
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label>Category</label>
              <div className="field-with-ai">
                <input
                  type="text"
                  placeholder="Enter category (e.g., tech, business, creative)"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
                <button type="button" className="field-ai-btn" onClick={() => generateWithAI('generate_category')} disabled={isGenerating}>
                  🤖
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label>Tags</label>
              <div className="field-with-ai">
                <input
                  type="text"
                  placeholder="react, javascript, tutorial (comma separated)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
                <button type="button" className="field-ai-btn" onClick={() => generateWithAI('generate_tags')} disabled={isGenerating}>
                  🤖
                </button>
              </div>
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
                <div className="field-with-ai">
                  <input
                    type="url"
                    placeholder="Paste image URL"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="url-input"
                  />
                  <button type="button" className="field-ai-btn" onClick={() => generateWithAI('generate_image')} disabled={isGenerating}>
                    🤖
                  </button>
                </div>
                <span className="upload-divider">or</span>
                <div className="ai-image-section">
                  <input
                    type="text"
                    placeholder="Describe the image you want AI to generate..."
                    className="ai-prompt-input"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        generateAIImage(e.target.value)
                      }
                    }}
                  />
                  <button 
                    type="button" 
                    className="ai-generate-btn"
                    onClick={(e) => {
                      const input = e.target.previousElementSibling
                      generateAIImage(input.value)
                    }}
                    disabled={isGenerating}
                  >
                    {isGenerating ? '🔄 Generating...' : '🎨 Generate AI Image'}
                  </button>
                </div>
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
              <div className="author-image-section">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAuthorImageUpload}
                  className="file-input"
                  id="author-image-upload"
                />
                <label htmlFor="author-image-upload" className="upload-btn">
                  {uploading ? 'Uploading...' : '📁 Upload Image'}
                </label>
                <span className="upload-divider">or</span>
                <input
                  type="url"
                  placeholder="Paste author image URL"
                  value={authorImage}
                  onChange={(e) => setAuthorImage(e.target.value)}
                  className="url-input"
                />
              </div>
              {authorImage && <img src={authorImage} alt="Author Preview" className="author-preview" />}
            </div>
            
            <div className="form-group">
              <label>Post Content</label>
              <div className="field-with-ai">
                <textarea
                  placeholder="Write your blog post content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows="15"
                  required
                />
                <button type="button" className="field-ai-btn textarea-ai-btn" onClick={() => generateWithAI('generate_content')} disabled={isGenerating}>
                  🤖
                </button>
              </div>
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
              <p className="stat-number">{analytics.totalPosts}</p>
            </div>
            <div className="stat-card">
              <h3>Total Views</h3>
              <p className="stat-number">{analytics.totalViews.toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <h3>This Month</h3>
              <p className="stat-number">{analytics.monthlyViews.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="admin-section">
          <h2>Manage Posts</h2>
          <div className="post-list">
            {posts.length === 0 ? (
              <p>No posts found. Create your first post!</p>
            ) : (
              posts.map(post => (
                <div key={post.id} className="post-item">
                  <div>
                    <span>{post.title}</span>
                    <small>{post.published ? 'Published' : 'Draft'} - {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'No date'}</small>
                  </div>
                  <div>
                    <button className="edit-btn" onClick={() => {
                      // Load post data into create form
                      setTitle(post.title)
                      setContent(post.content)
                      setCategory(post.category)
                      setTags(post.tags)
                      setImage(post.image)
                      setAuthor(post.author)
                      setAuthorImage(post.authorImage)
                      setActiveTab('create')
                    }}>Edit</button>
                    <button className="delete-btn" onClick={() => deletePost(post.id)}>Delete</button>
                  </div>
                </div>
              ))
            )}
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
              <form className="admin-form" onSubmit={handleLandingSubmit}>
                {/* Hero Section */}
                <div className="section-editor">
                  <div className="section-header">
                    <h4>Hero Section</h4>
                    <div className="section-controls">
                      <label className="toggle-label">
                        <input type="checkbox" defaultChecked /> Show
                      </label>
                      <button type="button" className="delete-section-btn">×</button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Hero Title</label>
                    <input 
                      type="text" 
                      value={landingData.hero.title}
                      onChange={(e) => setLandingData(prev => ({
                        ...prev,
                        hero: { ...prev.hero, title: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Hero Subtitle</label>
                    <input 
                      type="text" 
                      value={landingData.hero.subtitle}
                      onChange={(e) => setLandingData(prev => ({
                        ...prev,
                        hero: { ...prev.hero, subtitle: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Background Color</label>
                    <input 
                      type="color" 
                      value={landingData.hero.backgroundColor}
                      onChange={(e) => setLandingData(prev => ({
                        ...prev,
                        hero: { ...prev.hero, backgroundColor: e.target.value }
                      }))}
                    />
                  </div>
                </div>

                {/* Featured Posts Section */}
                <div className="section-editor">
                  <div className="section-header">
                    <h4>Featured Posts Section</h4>
                    <div className="section-controls">
                      <label className="toggle-label">
                        <input type="checkbox" defaultChecked /> Show
                      </label>
                      <button type="button" className="delete-section-btn">×</button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Section Title</label>
                    <input type="text" defaultValue="Featured Posts" />
                  </div>
                  <div className="form-group">
                    <label>Number of Posts</label>
                    <input type="number" defaultValue="3" min="1" max="6" />
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
              <form className="admin-form" onSubmit={handleBlogSubmit}>
                {/* Blog Header Section */}
                <div className="section-editor">
                  <h4>Blog Header</h4>
                  <div className="form-group">
                    <label>Header Title</label>
                    <input 
                      type="text" 
                      value={blogSettings.headerTitle}
                      onChange={(e) => setBlogSettings(prev => ({ ...prev, headerTitle: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Header Subtitle</label>
                    <input 
                      type="text" 
                      value={blogSettings.headerSubtitle}
                      onChange={(e) => setBlogSettings(prev => ({ ...prev, headerSubtitle: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Header Background Color</label>
                    <input 
                      type="color" 
                      value={blogSettings.backgroundColor}
                      onChange={(e) => setBlogSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Blog Settings */}
                <div className="section-editor">
                  <h4>Blog Settings</h4>
                  <div className="form-group">
                    <label>Posts Per Page</label>
                    <input 
                      type="number" 
                      value={blogSettings.postsPerPage}
                      onChange={(e) => setBlogSettings(prev => ({ ...prev, postsPerPage: parseInt(e.target.value) }))}
                      min="1" max="20" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Show Search Bar</label>
                    <input 
                      type="checkbox" 
                      checked={blogSettings.showSearch}
                      onChange={(e) => setBlogSettings(prev => ({ ...prev, showSearch: e.target.checked }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Show Category Filter</label>
                    <input 
                      type="checkbox" 
                      checked={blogSettings.showCategories}
                      onChange={(e) => setBlogSettings(prev => ({ ...prev, showCategories: e.target.checked }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Available Categories</label>
                    <input 
                      type="text" 
                      value={blogSettings.categories}
                      onChange={(e) => setBlogSettings(prev => ({ ...prev, categories: e.target.value }))}
                      placeholder="Comma separated" 
                    />
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
              <form className="admin-form" onSubmit={handleGlobalSubmit}>
                {/* Site Identity */}
                <div className="section-editor">
                  <h4>Site Identity</h4>
                  <div className="form-group">
                    <label>Site Title</label>
                    <input 
                      type="text" 
                      value={globalSettings.siteTitle}
                      onChange={(e) => setGlobalSettings(prev => ({ ...prev, siteTitle: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Site Tagline</label>
                    <input 
                      type="text" 
                      value={globalSettings.siteTagline}
                      onChange={(e) => setGlobalSettings(prev => ({ ...prev, siteTagline: e.target.value }))}
                      placeholder="Your creative media partner" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Logo</label>
                    <div className="logo-upload-section">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="file-input"
                        id="logo-upload"
                      />
                      <label htmlFor="logo-upload" className="upload-btn">
                        {uploading ? 'Uploading...' : '📁 Upload Logo'}
                      </label>
                      <span className="upload-divider">or</span>
                      <input
                        type="url"
                        placeholder="Paste logo URL"
                        value={globalSettings.logoUrl || ''}
                        onChange={(e) => setGlobalSettings(prev => ({ ...prev, logoUrl: e.target.value }))}
                        className="url-input"
                      />
                    </div>
                    {globalSettings.logoUrl && <img src={globalSettings.logoUrl} alt="Logo Preview" className="logo-preview" />}
                  </div>
                  <div className="form-group">
                    <label>Favicon</label>
                    <input type="file" accept="image/x-icon,image/png" />
                  </div>
                </div>

                {/* Color System */}
                <div className="section-editor">
                  <h4>Color System</h4>
                  <div className="form-group">
                    <label>Primary Color</label>
                    <input type="color" defaultValue="#ff6b35" />
                  </div>
                  <div className="form-group">
                    <label>Secondary Color</label>
                    <input type="color" defaultValue="#ff8c42" />
                  </div>
                  <div className="form-group">
                    <label>Background Color</label>
                    <input type="color" defaultValue="#000000" />
                  </div>
                  <div className="form-group">
                    <label>Text Color</label>
                    <input type="color" defaultValue="#ff6b35" />
                  </div>
                  <div className="form-group">
                    <label>Border Color</label>
                    <input type="color" defaultValue="#ff6b35" />
                  </div>
                </div>

                {/* Typography */}
                <div className="section-editor">
                  <h4>Typography</h4>
                  <div className="form-group">
                    <label>Primary Font</label>
                    <select defaultValue="Orbitron">
                      <option value="Orbitron">Orbitron</option>
                      <option value="Arial">Arial</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Times New Roman">Times New Roman</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Heading Font Size (rem)</label>
                    <input type="number" defaultValue="2.5" min="1" max="5" step="0.1" />
                  </div>
                  <div className="form-group">
                    <label>Body Font Size (rem)</label>
                    <input type="number" defaultValue="1" min="0.8" max="2" step="0.1" />
                  </div>
                  <div className="form-group">
                    <label>Font Weight</label>
                    <select defaultValue="700">
                      <option value="300">Light (300)</option>
                      <option value="400">Normal (400)</option>
                      <option value="700">Bold (700)</option>
                      <option value="900">Black (900)</option>
                    </select>
                  </div>
                </div>

                {/* Layout Options */}
                <div className="section-editor">
                  <h4>Layout Options</h4>
                  <div className="form-group">
                    <label>Container Max Width (px)</label>
                    <input type="number" defaultValue="1200" min="800" max="1600" />
                  </div>
                  <div className="form-group">
                    <label>Section Padding (rem)</label>
                    <input type="number" defaultValue="4" min="1" max="8" step="0.5" />
                  </div>
                  <div className="form-group">
                    <label>Border Radius (px)</label>
                    <input type="number" defaultValue="8" min="0" max="20" />
                  </div>
                </div>

                {/* Contact & Social */}
                <div className="section-editor">
                  <h4>Contact & Social</h4>
                  <div className="form-group">
                    <label>Contact Email</label>
                    <input type="email" defaultValue="contact@slyyfoxxmedia.com" />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" placeholder="+1 (555) 123-4567" />
                  </div>
                  <div className="form-group">
                    <label>Address</label>
                    <textarea rows="2" placeholder="123 Main St, City, State 12345"></textarea>
                  </div>
                  <div className="form-group">
                    <label>Social Media Links</label>
                    <input type="url" placeholder="Twitter URL" />
                    <input type="url" placeholder="Instagram URL" />
                    <input type="url" placeholder="LinkedIn URL" />
                    <input type="url" placeholder="YouTube URL" />
                    <input type="url" placeholder="Facebook URL" />
                  </div>
                </div>

                {/* API Configuration */}
                <div className="section-editor">
                  <h4>API Configuration</h4>
                  <div className="form-group">
                    <label>Google Analytics Tracking ID</label>
                    <input type="text" placeholder="G-XXXXXXXXXX" />
                  </div>
                  <div className="form-group">
                    <label>Gemini AI API Key</label>
                    <input type="password" placeholder="Your Gemini API key" />
                  </div>
                  <div className="form-group">
                    <label>Enable AI Features</label>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="form-group">
                    <label>Enable Analytics Tracking</label>
                    <input type="checkbox" defaultChecked />
                  </div>
                </div>

                {/* SEO Settings */}
                <div className="section-editor">
                  <h4>SEO Settings</h4>
                  <div className="form-group">
                    <label>Meta Description</label>
                    <textarea rows="2" placeholder="Site description for search engines"></textarea>
                  </div>
                  <div className="form-group">
                    <label>Meta Keywords</label>
                    <input type="text" placeholder="keyword1, keyword2, keyword3" />
                  </div>
                  <div className="form-group">
                    <label>Site Language</label>
                    <select defaultValue="en">
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>
                </div>

                {/* Footer */}
                <div className="section-editor">
                  <h4>Footer Settings</h4>
                  <div className="form-group">
                    <label>Footer Text</label>
                    <textarea rows="2" defaultValue="© 2024 SlyyFoxx Media. All rights reserved."></textarea>
                  </div>
                  <div className="form-group">
                    <label>Show Social Links in Footer</label>
                    <input type="checkbox" defaultChecked />
                  </div>
                </div>

                {/* Advanced */}
                <div className="section-editor">
                  <h4>Advanced</h4>
                  <div className="form-group">
                    <label>Custom CSS</label>
                    <textarea rows="4" placeholder="/* Custom CSS rules */"></textarea>
                  </div>
                  <div className="form-group">
                    <label>Custom JavaScript</label>
                    <textarea rows="4" placeholder="// Custom JavaScript code"></textarea>
                  </div>
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
                  const userData = JSON.parse(localStorage.getItem('userData') || '{}')
                  userData.email = newEmail
                  localStorage.setItem('userData', JSON.stringify(userData))
                  window.location.reload()
                } else {
                  const data = await response.json()
                  alert(data.detail || 'Failed to change email')
                }
              } catch (err) {
                console.error('Email change error:', err)
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
                console.error('Password change error:', err)
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