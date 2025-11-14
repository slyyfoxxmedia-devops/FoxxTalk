function StatsSection({ data }) {
  return (
    <section className="stats-section">
      <div className="container">
        {data.title && <h2>{data.title}</h2>}
        <div className="stats-grid">
          {data.stats?.map((stat, index) => (
            <div key={index} className="stat">
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatsSection