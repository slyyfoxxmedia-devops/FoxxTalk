function FeaturesSection({ data }) {
  return (
    <section className="features-section">
      <div className="container">
        {data.title && <h2>{data.title}</h2>}
        <div className="features-grid">
          {data.features?.map((feature, index) => (
            <div key={index} className="feature">
              {feature.icon && <div className="feature-icon">{feature.icon}</div>}
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection