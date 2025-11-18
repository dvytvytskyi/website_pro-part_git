'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  threshold?: number;
  rootMargin?: string;
}

/**
 * LazySection component - loads children only when they become visible in viewport
 * This reduces initial bundle size and improves performance
 */
export default function LazySection({ 
  children, 
  fallback = <div style={{ minHeight: '200px' }} />,
  threshold = 0.1,
  rootMargin = '50px' // Start loading 50px before element becomes visible
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('🔍 LazySection: Setting up IntersectionObserver');
    if (!sectionRef.current || shouldLoad) {
      console.log('🔍 LazySection: Skipping observer setup', { hasRef: !!sectionRef.current, shouldLoad });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          console.log('🔍 LazySection: IntersectionObserver triggered', { isIntersecting: entry.isIntersecting });
          if (entry.isIntersecting) {
            console.log('✅ LazySection: Element is visible, loading children');
            setShouldLoad(true);
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { 
        threshold,
        rootMargin 
      }
    );

    observer.observe(sectionRef.current);
    console.log('🔍 LazySection: Observer attached to element');

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
      observer.disconnect();
    };
  }, [shouldLoad, threshold, rootMargin]);

  console.log('🔍 LazySection: Rendering', { shouldLoad, isVisible });

  return (
    <div ref={sectionRef}>
      {shouldLoad ? children : fallback}
    </div>
  );
}

