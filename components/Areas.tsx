'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { useRef, useEffect, useState } from 'react';
import styles from './Areas.module.css';
import { getAreas, Area as ApiArea, normalizeImageUrl } from '@/lib/api';

interface Area {
  id: string;
  name: string;
  nameRu: string;
  projectsCount: number;
  image: string;
}

// Target areas to display on home page (by ID)
const TARGET_AREA_IDS = [
  '7924f2dd-94bf-4ec3-b3fe-cbc5606a073a', // Business Bay
  '1b6f0f1f-0587-4d5f-96b2-5cb76844b1a3', // Downtown Dubai
  '599de105-6125-405c-9a9c-cd4e1c80bc38', // City Walk
  'a22870e9-9d1e-4dfb-aaba-9cc647afe23b', // Palm Jumeirah
  'c9f2c230-e3b5-465a-9c5f-cf7bebc35905', // Jumeirah Village Circle (JVC)
  '2a295d06-8184-40d0-a68a-18cf529173af', // Dubai Hills
];

// Area names mapping for sorting
const AREA_ORDER: { [key: string]: number } = {
  '7924f2dd-94bf-4ec3-b3fe-cbc5606a073a': 0, // Business Bay
  '1b6f0f1f-0587-4d5f-96b2-5cb76844b1a3': 1, // Downtown Dubai
  '599de105-6125-405c-9a9c-cd4e1c80bc38': 2, // City Walk
  'a22870e9-9d1e-4dfb-aaba-9cc647afe23b': 3, // Palm Jumeirah
  'c9f2c230-e3b5-465a-9c5f-cf7bebc35905': 4, // JVC
  '2a295d06-8184-40d0-a68a-18cf529173af': 5, // Dubai Hills
};

export default function Areas() {
  const t = useTranslations('areas');
  const locale = useLocale();
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardsWrapperRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set()); // Track failed image loads

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  const getAreaName = (area: Area) => {
    return locale === 'ru' ? area.nameRu : area.name;
  };

  // Load areas from API - оптимізовано: використовуємо кеш, фільтруємо тільки потрібні areas
  useEffect(() => {
    const loadAreas = async () => {
      setLoading(true);
      try {
        const apiAreas = await getAreas(undefined, true); // Використовуємо кеш
        
        console.log(`📦 Areas component: Loaded ${apiAreas.length} areas from API/cache, filtering ${TARGET_AREA_IDS.length} target areas`);
        console.log(`📋 Target area IDs:`, TARGET_AREA_IDS);
        console.log(`📋 First 10 API area IDs:`, apiAreas.slice(0, 10).map((a: ApiArea) => ({ id: a.id, nameEn: a.nameEn })));
        
        // Filter only target areas by ID, prefer areas with real images
        const filteredAreas: Area[] = apiAreas
          .filter((apiArea: ApiArea) => {
            // Filter by target IDs
            const isTargetArea = TARGET_AREA_IDS.includes(apiArea.id);
            if (!isTargetArea) {
              return false;
            }
            
            console.log(`✅ Found target area: ${apiArea.nameEn} (${apiArea.id})`);
            
            // Allow areas even without images - we'll use a placeholder if needed
            return true;
          })
          .map((apiArea: ApiArea) => {
            // Get image - use the same extractUrl approach as in getAreas
            let imageUrl = '';
            
            // Helper function to extract URL from various formats (same as in getAreas)
            const extractUrl = (item: any): string | null => {
              if (!item) return null;
              
              // If it's already a string, return it
              if (typeof item === 'string' && item.trim().length > 0) {
                return item.trim();
              }
              
              // If it's an object, try to extract URL from common fields
              if (typeof item === 'object' && item !== null) {
                const urlFields = ['url', 'src', 'imageUrl', 'image', 'photo'];
                for (const field of urlFields) {
                  if (item[field] && typeof item[field] === 'string' && item[field].trim().length > 0) {
                    return item[field].trim();
                  }
                }
                
                // If no URL field found, try Object.values to find string values
                const values = Object.values(item);
                for (const value of values) {
                  if (typeof value === 'string' && value.trim().length > 0) {
                    return value.trim();
                  }
                }
              }
              
              return null;
            };
            
            // Check images array first (can be string[] or object[])
            if (apiArea.images && Array.isArray(apiArea.images) && apiArea.images.length > 0) {
              const firstImage = apiArea.images[0];
              const extractedUrl = extractUrl(firstImage);
              
              if (extractedUrl) {
                // Check if it's a full URL (reelly, alnair, etc.) - return as is
                if (extractedUrl.startsWith('http://') || extractedUrl.startsWith('https://')) {
                  if (extractedUrl.includes('reely') || extractedUrl.includes('alnair')) {
                    imageUrl = extractedUrl;
                  } else {
                    // Use normalizeImageUrl for Cloudinary URLs
                    imageUrl = normalizeImageUrl(extractedUrl, {
                      width: 800,
                      height: 600,
                      quality: 'auto',
                      format: 'auto'
                    }) || extractedUrl;
                  }
                } else {
                  // Not a full URL, use normalizeImageUrl (might be a public_id)
                  imageUrl = normalizeImageUrl(extractedUrl, {
                    width: 800,
                    height: 600,
                    quality: 'auto',
                    format: 'auto'
                  });
                }
              }
            }
            
            // Also check for other image fields (cloudinaryId, publicId, imageUrl, etc.)
            if (!imageUrl) {
              if (apiArea.imageUrl && typeof apiArea.imageUrl === 'string') {
                const extractedUrl = extractUrl(apiArea.imageUrl);
                if (extractedUrl) {
                  if (extractedUrl.startsWith('http://') || extractedUrl.startsWith('https://')) {
                    if (extractedUrl.includes('reely') || extractedUrl.includes('alnair')) {
                      imageUrl = extractedUrl;
                    } else {
                      imageUrl = normalizeImageUrl(extractedUrl, {
                        width: 800,
                        height: 600,
                        quality: 'auto',
                        format: 'auto'
                      }) || extractedUrl;
                    }
                  } else {
                    imageUrl = normalizeImageUrl(extractedUrl, {
                      width: 800,
                      height: 600,
                      quality: 'auto',
                      format: 'auto'
                    });
                  }
                }
              } else if (apiArea.cloudinaryId && typeof apiArea.cloudinaryId === 'string') {
                imageUrl = normalizeImageUrl(apiArea.cloudinaryId, {
                  width: 800,
                  height: 600,
                  quality: 'auto',
                  format: 'auto'
                });
              } else if (apiArea.publicId && typeof apiArea.publicId === 'string') {
                imageUrl = normalizeImageUrl(apiArea.publicId, {
                  width: 800,
                  height: 600,
                  quality: 'auto',
                  format: 'auto'
                });
              }
            }
            
            // Fallback to a default placeholder if no valid image
            if (!imageUrl) {
              imageUrl = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&h=600&fit=crop';
            }
            
            // Generate slug from nameEn
            const slug = (apiArea.nameEn || '')
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, '');
            
            return {
              id: slug || apiArea.id,
              name: apiArea.nameEn || '',
              nameRu: apiArea.nameRu || apiArea.nameEn || '',
              projectsCount: apiArea.projectsCount?.total || 0,
              image: imageUrl,
              areaId: apiArea.id, // Keep original ID for sorting
            };
          })
          .sort((a, b) => {
            // Sort by AREA_ORDER
            const aOrder = AREA_ORDER[(a as any).areaId] ?? 999;
            const bOrder = AREA_ORDER[(b as any).areaId] ?? 999;
            return aOrder - bOrder;
          })
          .map(({ areaId, ...area }) => area); // Remove areaId from final result
        
        console.log(`✅ Areas component: Filtered ${filteredAreas.length} areas from ${apiAreas.length} total`);
        console.log(`📋 Filtered areas:`, filteredAreas.map(a => ({ id: a.id, name: a.name, hasImage: !!a.image })));
        
        setAreas(filteredAreas);
      } catch (error) {
        console.error('Failed to load areas:', error);
        setAreas([]);
      } finally {
        setLoading(false);
      }
    };

    loadAreas();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current && cardsWrapperRef.current) {
      const firstCard = cardsWrapperRef.current.firstElementChild as HTMLElement;
      if (firstCard) {
        const cardWidth = firstCard.offsetWidth;
        const gap = 24; // gap between cards
        const scrollAmount = cardWidth + gap;
        
        scrollRef.current.scrollBy({
          left: direction === 'left' ? -scrollAmount : scrollAmount,
          behavior: 'smooth',
        });
      }
    }
  };

  return (
    <section className={styles.areas} ref={sectionRef}>
      <div className={`${styles.container} ${isVisible ? styles.visible : ''}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('title')}</h2>
          <div className={styles.descriptionWrapper}>
            <p className={styles.description}>{t('description')}</p>
            <div className={styles.scrollButtons}>
              <button 
                className={`${styles.scrollButton} ${styles.left}`}
                onClick={() => scroll('left')}
                aria-label="Scroll left"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button 
                className={`${styles.scrollButton} ${styles.right}`}
                onClick={() => scroll('right')}
                aria-label="Scroll right"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div className={styles.scrollWrapper}>
          <div className={styles.scrollContainer} ref={scrollRef}>
            <div className={styles.cardsWrapper} ref={cardsWrapperRef}>
              {loading ? (
                <div className={styles.loading}>Loading areas...</div>
              ) : areas.length === 0 ? (
                <div className={styles.noAreas}>No areas found</div>
              ) : (
                areas
                  .filter(area => !failedImages.has(area.id)) // Hide areas with failed images
                  .map((area) => {
                    // Don't render if image has failed
                    if (failedImages.has(area.id)) {
                      return null;
                    }
                    
                    return (
                      <Link
                        key={area.id}
                        href={getLocalizedPath(`/areas/${area.id}`)}
                        className={styles.card}
                      >
                        <div className={styles.cardImage}>
                          <Image
                            src={area.image}
                            alt={getAreaName(area)}
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 1200px) 33vw, (max-width: 900px) 50vw, 25vw"
                            loading="lazy"
                            unoptimized
                            onError={() => {
                              // If image fails to load, mark it as failed and hide the area card
                              if (process.env.NODE_ENV === 'development') {
                                console.error(`❌ Failed to load image for area "${area.name}" (${area.id}):`, area.image);
                              }
                              setFailedImages(prev => {
                                const next = new Set(prev);
                                next.add(area.id);
                                return next;
                              });
                            }}
                          />
                          <div className={styles.cardOverlay}></div>
                          <div className={styles.cardContent}>
                            <h3 className={styles.cardTitle}>{getAreaName(area)}</h3>
                            <div className={styles.cardInfo}>
                              <span className={styles.projectsCount}>{area.projectsCount}</span>
                              <span className={styles.projectsLabel}>{t('projects')}</span>
                            </div>
                          </div>
                          <div className={styles.cardArrow}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9 5L16 12L9 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </Link>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

