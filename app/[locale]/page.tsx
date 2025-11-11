import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Statistics from '@/components/Statistics';
import Footer from '@/components/Footer';
import LazySection from '@/components/LazySection';

// Lazy load components that are below the fold - using dynamic import for code splitting
const Areas = dynamic(() => import('@/components/Areas'), {
  ssr: false,
});

const AboutUs = dynamic(() => import('@/components/AboutUs'), {
  ssr: false,
});

const Partners = dynamic(() => import('@/components/Partners'), {
  ssr: false,
});

const ProjectImage = dynamic(() => import('@/components/ProjectImage'), {
  ssr: false,
});

const AboutSections = dynamic(() => import('@/components/AboutSections'), {
  ssr: false,
});

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <Statistics />
      {/* Load components only when they become visible in viewport */}
      <LazySection 
        fallback={<div style={{ minHeight: '300px', padding: '40px 0' }} />}
        threshold={0.1}
        rootMargin="100px"
      >
        <AboutUs />
      </LazySection>
      <LazySection 
        fallback={<div style={{ minHeight: '200px', padding: '40px 0' }} />}
        threshold={0.1}
        rootMargin="100px"
      >
        <Partners />
      </LazySection>
      <LazySection 
        fallback={<div style={{ minHeight: '400px', padding: '40px 0' }} />}
        threshold={0.1}
        rootMargin="100px"
      >
        <Areas />
      </LazySection>
      <LazySection 
        fallback={<div style={{ minHeight: '300px', padding: '40px 0' }} />}
        threshold={0.1}
        rootMargin="100px"
      >
        <ProjectImage />
      </LazySection>
      <LazySection 
        fallback={<div style={{ minHeight: '500px', padding: '40px 0' }} />}
        threshold={0.1}
        rootMargin="100px"
      >
        <AboutSections />
      </LazySection>
      <Footer />
    </>
  );
}
