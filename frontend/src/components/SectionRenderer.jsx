import VideoSection from './sections/VideoSection'
import GallerySection from './sections/GallerySection'
import CTASection from './sections/CTASection'
import TextSection from './sections/TextSection'
import TestimonialsSection from './sections/TestimonialsSection'
import FeaturesSection from './sections/FeaturesSection'
import StatsSection from './sections/StatsSection'

function SectionRenderer({ sections }) {
  const renderSection = (section) => {
    switch (section.type) {
      case 'video':
        return <VideoSection key={section.id} data={section.data} />
      case 'gallery':
        return <GallerySection key={section.id} data={section.data} />
      case 'cta':
        return <CTASection key={section.id} data={section.data} />
      case 'text':
        return <TextSection key={section.id} data={section.data} />
      case 'testimonials':
        return <TestimonialsSection key={section.id} data={section.data} />
      case 'features':
        return <FeaturesSection key={section.id} data={section.data} />
      case 'stats':
        return <StatsSection key={section.id} data={section.data} />
      case 'about':
        return <TextSection key={section.id} data={section.data} />
      case 'contact':
        return <TextSection key={section.id} data={section.data} />
      case 'team':
        return <TestimonialsSection key={section.id} data={section.data} />
      default:
        return null
    }
  }

  return (
    <>
      {sections?.map(section => renderSection(section))}
    </>
  )
}

export default SectionRenderer