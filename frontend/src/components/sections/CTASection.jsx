function CTASection({ data }) {
  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-content">
          {data.title && <h2>{data.title}</h2>}
          {data.description && <p>{data.description}</p>}
          {data.buttonText && (
            <a 
              href={data.buttonUrl || '#'} 
              className="cta-button"
              style={{ backgroundColor: data.buttonColor || '#ff6b35' }}
            >
              {data.buttonText}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

export default CTASection