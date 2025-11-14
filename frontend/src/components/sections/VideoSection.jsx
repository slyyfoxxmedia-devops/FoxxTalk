function VideoSection({ data }) {
  return (
    <section className="video-section">
      <div className="container">
        {data.title && <h2>{data.title}</h2>}
        {data.description && <p>{data.description}</p>}
        <div className="video-container">
          {data.videoUrl ? (
            <iframe 
              src={data.videoUrl} 
              title={data.title || 'Video'}
              frameBorder="0"
              allowFullScreen
            />
          ) : (
            <video controls>
              <source src={data.videoFile} type="video/mp4" />
            </video>
          )}
        </div>
      </div>
    </section>
  )
}

export default VideoSection