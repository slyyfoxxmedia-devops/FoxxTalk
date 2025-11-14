function TestimonialsSection({ data }) {
  return (
    <section className="testimonials-section">
      <div className="container">
        {data.title && <h2>{data.title}</h2>}
        <div className="testimonials-grid">
          {data.testimonials?.map((testimonial, index) => (
            <div key={index} className="testimonial">
              <p>"{testimonial.quote}"</p>
              <div className="testimonial-author">
                {testimonial.avatar && <img src={testimonial.avatar} alt={testimonial.name} />}
                <div>
                  <strong>{testimonial.name}</strong>
                  {testimonial.title && <span>{testimonial.title}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection