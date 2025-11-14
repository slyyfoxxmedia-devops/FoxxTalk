function GallerySection({ data }) {
  return (
    <section className="gallery-section">
      <div className="container">
        {data.title && <h2>{data.title}</h2>}
        {data.description && <p>{data.description}</p>}
        <div className="gallery-grid">
          {data.images?.map((image, index) => (
            <div key={index} className="gallery-item">
              <img src={image.url} alt={image.alt || `Gallery image ${index + 1}`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default GallerySection