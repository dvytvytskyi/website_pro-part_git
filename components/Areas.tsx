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

// Target areas to display on home page (by name from areas.json)
// Selected 6 popular areas
const TARGET_AREA_NAMES = [
  'Business Bay',
  'Downtown Dubai',
  'Palm Jumeirah',
  'Dubai Marina',
  'Dubai Hills',
  'Jumeirah Village Circle (JVC)',
];

// Area names mapping for sorting
const AREA_ORDER: { [key: string]: number } = {
  'Business Bay': 0,
  'Downtown Dubai': 1,
  'Palm Jumeirah': 2,
  'Dubai Marina': 3,
  'Dubai Hills': 4,
  'Jumeirah Village Circle (JVC)': 5,
};

export default function Areas() {
  console.log('🎬 Areas component: Component is rendering!');
  
  const t = useTranslations('areas');
  const locale = useLocale();
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardsWrapperRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set()); // Track failed image loads
  
  // Debug: log areas state changes
  useEffect(() => {
    console.log(`🔄 Areas state updated: ${areas.length} areas`, areas.map(a => a.name));
  }, [areas]);
  
  // Log when component mounts
  useEffect(() => {
    console.log('🎬 Areas component: Component mounted!');
    return () => {
      console.log('🎬 Areas component: Component unmounting!');
    };
  }, []);

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  const getAreaName = (area: Area) => {
    return locale === 'ru' ? area.nameRu : area.name;
  };

  // Load areas from API - оптимізовано: використовуємо кеш, фільтруємо тільки потрібні areas
  useEffect(() => {
    const loadAreas = async () => {
      console.log('🚀 Areas component: Starting to load areas...');
      setLoading(true);
      try {
        // Clear cache first to ensure fresh data after migration
        const { clearAreasCache } = await import('@/lib/api');
        clearAreasCache();
        console.log('🗑️ Areas cache cleared');
        
        const apiAreas = await getAreas(undefined, false); // Don't use cache to get fresh data
        
        console.log(`📦 Areas component: Loaded ${apiAreas.length} areas from API/cache, filtering ${TARGET_AREA_NAMES.length} target areas`);
        console.log(`📋 Target area names:`, TARGET_AREA_NAMES);
        console.log(`📋 First 10 API areas:`, apiAreas.slice(0, 10).map((a: ApiArea) => ({ id: a.id, nameEn: a.nameEn })));
        
        if (apiAreas.length === 0) {
          console.error('❌ No areas loaded from API!');
          setAreas([]);
          setLoading(false);
          return;
        }
        
        // Filter only target areas by name, prefer areas with real images
        const filteredAreas: Area[] = apiAreas
          .filter((apiArea: ApiArea) => {
            // Filter by target names - use case-insensitive comparison
            const areaName = apiArea.nameEn?.trim();
            if (!areaName) {
              return false;
            }
            
            // Case-insensitive comparison
            const isTargetArea = TARGET_AREA_NAMES.some(targetName => 
              areaName.toLowerCase() === targetName.toLowerCase()
            );
            
            if (!isTargetArea) {
              console.log(`⏭️ Skipping area: "${areaName}" (not in target list)`);
              return false;
            }
            
            console.log(`✅ Found target area: ${areaName} (${apiArea.id})`);
            
            // Allow areas even without images - we'll use a placeholder if needed
            return true;
          })
          .map((apiArea: ApiArea) => {
            // Get image - use the same extractUrl approach as in getAreas
            let imageUrl = '';
            
            // Helper function to extract and clean URL from various formats
            const extractUrl = (item: any): string | null => {
              if (!item) return null;
              
              let rawUrl: string | null = null;
              
              // If it's already a string, use it
              if (typeof item === 'string' && item.trim().length > 0) {
                rawUrl = item.trim();
              }
              // If it's an object, try to extract URL from common fields
              else if (typeof item === 'object' && item !== null) {
                const urlFields = ['url', 'src', 'imageUrl', 'image', 'photo'];
                for (const field of urlFields) {
                  if (item[field] && typeof item[field] === 'string' && item[field].trim().length > 0) {
                    rawUrl = item[field].trim();
                    break;
                  }
                }
                
                // If no URL field found, try Object.values to find string values
                if (!rawUrl) {
                const values = Object.values(item);
                for (const value of values) {
                  if (typeof value === 'string' && value.trim().length > 0) {
                      rawUrl = value.trim();
                      break;
                    }
                  }
                }
              }
              
              if (!rawUrl) return null;
              
              // Clean the URL - remove JSON artifacts, decode, extract actual URL
              let cleanUrl = rawUrl;
              
              // First, try to extract URL directly if it's embedded in encoded string
              // Handle cases like %22%7Bhttps://... or "{https://...
              const directUrlMatch = cleanUrl.match(/https?:\/\/[^\s"{}%]+/);
              if (directUrlMatch) {
                cleanUrl = directUrlMatch[0];
                // Remove any trailing encoded characters
                cleanUrl = cleanUrl.replace(/[%"]+$/, '');
              } else {
                // Try to decode URL-encoded strings (multiple times if needed)
                let decoded = cleanUrl;
                let lastDecoded = '';
                let attempts = 0;
                while (decoded !== lastDecoded && attempts < 3) {
                  lastDecoded = decoded;
                  try {
                    decoded = decodeURIComponent(decoded);
                    attempts++;
                  } catch (e) {
                    break;
                  }
                }
                cleanUrl = decoded;
                
                // Remove JSON string quotes and braces
                cleanUrl = cleanUrl.replace(/^["{]+|["}]+$/g, '');
                
                // If it looks like a JSON string, try to parse it
                if (cleanUrl.startsWith('"{') || cleanUrl.startsWith('"https') || cleanUrl.startsWith('{https')) {
                  try {
                    const parsed = JSON.parse(cleanUrl);
                    if (typeof parsed === 'string') {
                      cleanUrl = parsed;
                    } else if (typeof parsed === 'object' && parsed !== null) {
                      const url = parsed.url || parsed.src || parsed.imageUrl;
                      if (typeof url === 'string') {
                        cleanUrl = url;
                      } else {
                        // Try to extract URL from stringified object
                        const urlMatch = cleanUrl.match(/https?:\/\/[^\s"{}]+/);
                        if (urlMatch) {
                          cleanUrl = urlMatch[0];
                        } else {
                          return null;
                        }
                      }
                    }
                  } catch (e) {
                    // If parsing fails, try to extract URL directly
                    const urlMatch = cleanUrl.match(/https?:\/\/[^\s"{}]+/);
                    if (urlMatch) {
                      cleanUrl = urlMatch[0];
                    } else {
              return null;
                    }
                  }
                }
                
                // Final cleanup - remove any remaining quotes and encoded characters
                cleanUrl = cleanUrl.replace(/^["'{]+|["'}]+$/g, '').trim();
                
                // Try one more time to extract URL if it's still embedded
                const finalUrlMatch = cleanUrl.match(/https?:\/\/[^\s"{}%]+/);
                if (finalUrlMatch) {
                  cleanUrl = finalUrlMatch[0];
                }
              }
              
              // Validate it's a proper URL or non-empty string
              if (cleanUrl.length === 0) return null;
              
              return cleanUrl;
            };
            
            // After migration: images are now clean string[] with Cloudinary URLs
            // Just use the first image directly if it's a valid URL
            if (apiArea.images && Array.isArray(apiArea.images) && apiArea.images.length > 0) {
              const firstImage = apiArea.images[0];
              
              // After migration: should be a simple string with full URL
              if (typeof firstImage === 'string' && firstImage.trim().length > 0) {
                const trimmed = firstImage.trim();
                // Validate it's a proper URL
                if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
                  // Use normalizeImageUrl for Cloudinary URLs to optimize
                  imageUrl = normalizeImageUrl(trimmed, {
                      width: 800,
                      height: 600,
                      quality: 'auto',
                      format: 'auto'
                  }) || trimmed;
                  }
                } else {
                // Fallback: try to extract URL from object format (for backward compatibility)
                const extractedUrl = extractUrl(firstImage);
                if (extractedUrl && (extractedUrl.startsWith('http://') || extractedUrl.startsWith('https://'))) {
                  imageUrl = normalizeImageUrl(extractedUrl, {
                    width: 800,
                    height: 600,
                    quality: 'auto',
                    format: 'auto'
                  }) || extractedUrl;
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
            
            // Use the real API area ID instead of generating a slug
            // This ensures the link matches what getAreaById expects
            return {
              id: apiArea.id,
              name: apiArea.nameEn || '',
              nameRu: apiArea.nameRu || apiArea.nameEn || '',
              projectsCount: apiArea.projectsCount?.total || 0,
              image: imageUrl,
            };
          })
          .sort((a, b) => {
            // Sort by AREA_ORDER using area name
            const aOrder = AREA_ORDER[a.name] ?? 999;
            const bOrder = AREA_ORDER[b.name] ?? 999;
            return aOrder - bOrder;
          })
        
        console.log(`✅ Areas component: Filtered ${filteredAreas.length} areas from ${apiAreas.length} total`);
        console.log(`📋 Filtered areas:`, filteredAreas.map(a => ({ id: a.id, name: a.name, hasImage: !!a.image, imageUrl: a.image?.substring(0, 100) })));
        
        // Log each area's image URL to debug
        filteredAreas.forEach((area, index) => {
          console.log(`📍 Area ${index + 1}/${filteredAreas.length}: "${area.name}" (${area.id})`, {
            imageUrl: area.image,
            imageUrlLength: area.image?.length,
            hasValidUrl: area.image && (area.image.startsWith('http://') || area.image.startsWith('https://')),
            projectsCount: area.projectsCount
          });
        });
        
        if (filteredAreas.length !== TARGET_AREA_NAMES.length) {
          console.warn(`⚠️ Expected ${TARGET_AREA_NAMES.length} areas but got ${filteredAreas.length}`);
          const foundNames = filteredAreas.map(a => a.name);
          const missingNames = TARGET_AREA_NAMES.filter(name => !foundNames.some(found => found.toLowerCase() === name.toLowerCase()));
          if (missingNames.length > 0) {
            console.warn(`⚠️ Missing areas:`, missingNames);
            console.warn(`⚠️ All API area names:`, apiAreas.map(a => a.nameEn).filter(Boolean));
          }
        }
        
        if (filteredAreas.length === 0) {
          console.error('❌ No areas matched the filter criteria!');
          console.error('❌ This might be because:');
          console.error('   1. Area names in API don\'t match TARGET_AREA_NAMES');
          console.error('   2. API returned empty or invalid data');
          console.error('   3. Areas don\'t have images');
        }
        
        console.log(`🎯 Setting ${filteredAreas.length} areas to state`);
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
                areas.map((area, index) => {
                    const hasFailedImage = failedImages.has(area.id);
                    let imageSrc = hasFailedImage 
                      ? 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&h=600&fit=crop'
                      : area.image;
                    
                    // Additional validation: if image URL is malformed, use placeholder immediately
                    let usePlaceholder = false;
                    if (imageSrc && !hasFailedImage) {
                      // Check if URL is malformed (contains encoded quotes or braces at the start)
                      if (imageSrc.includes('%22') || imageSrc.includes('%7B') || imageSrc.startsWith('"') || imageSrc.startsWith('{')) {
                        if (process.env.NODE_ENV === 'development') {
                          console.warn(`⚠️ Malformed image URL for area "${area.name}":`, imageSrc);
                        }
                        usePlaceholder = true;
                        imageSrc = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&h=600&fit=crop';
                      }
                      // Check if URL doesn't start with http/https
                      else if (!imageSrc.startsWith('http://') && !imageSrc.startsWith('https://') && !imageSrc.startsWith('/')) {
                        if (process.env.NODE_ENV === 'development') {
                          console.warn(`⚠️ Invalid image URL format for area "${area.name}":`, imageSrc);
                        }
                        usePlaceholder = true;
                        imageSrc = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&h=600&fit=crop';
                      }
                    }
                    
                    // If no image URL at all, use placeholder
                    if (!imageSrc) {
                      usePlaceholder = true;
                      imageSrc = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&h=600&fit=crop';
                    }
                    
                    if (process.env.NODE_ENV === 'development') {
                      console.log(`🎴 [${index + 1}/${areas.length}] Rendering area card: "${area.name}" (${area.id})`, {
                        imageSrc: imageSrc?.substring(0, 80),
                        usePlaceholder,
                        hasFailedImage
                      });
                    }
                    
                    return (
                      <Link
                        key={`area-${area.id}-${index}`}
                        href={getLocalizedPath(`/areas/${area.id}`)}
                        className={styles.card}
                        style={{ display: 'block' }}
                      >
                        <div className={styles.cardImage}>
                          {usePlaceholder || hasFailedImage ? (
                            <img
                              src={imageSrc}
                              alt={getAreaName(area)}
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover',
                                display: 'block'
                              }}
                              onError={() => {
                                if (process.env.NODE_ENV === 'development') {
                                  console.error(`❌ Failed to load placeholder for area "${area.name}"`);
                                }
                              }}
                            />
                          ) : (
                          <Image
                              src={imageSrc}
                            alt={getAreaName(area)}
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 1200px) 33vw, (max-width: 900px) 50vw, 25vw"
                            loading="lazy"
                            unoptimized
                            onError={() => {
                                // If image fails to load, mark it as failed and use placeholder
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
                          )}
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


