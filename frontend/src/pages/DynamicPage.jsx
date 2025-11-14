import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

function DynamicPage() {
  const { slug } = useParams()
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const response = await fetch(`/api/pages/${slug}`)
        if (response.ok) {
          const data = await response.json()
          setPage(data)
          // Set page title and meta description
          document.title = `${data.title} - SlyyFoxx Media`
          if (data.meta_description) {
            const metaDesc = document.querySelector('meta[name="description"]')
            if (metaDesc) {
              metaDesc.setAttribute('content', data.meta_description)
            }
          }
        } else {
          setError('Page not found')
        }
      } catch (err) {
        setError('Failed to load page')
      } finally {
        setLoading(false)
      }
    }

    fetchPage()
  }, [slug])

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">
          <h1>404 - Page Not Found</h1>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <article className="dynamic-page">
        <header className="page-header">
          <h1>{page.title}</h1>
        </header>
        <div className="page-content">
          {page.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  )
}

export default DynamicPage