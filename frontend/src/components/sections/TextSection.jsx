function TextSection({ data }) {
  return (
    <section className="text-section">
      <div className="container">
        {data.title && <h2>{data.title}</h2>}
        {data.content && (
          <div className="text-content">
            {data.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default TextSection