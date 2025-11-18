'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAreas, Area as ApiArea, normalizeImageUrl } from '@/lib/api';
import styles from './AreasList.module.css';
import AreaCardSkeleton from '@/components/AreaCardSkeleton';

interface Area {
  id: string;
  name: string;
  nameRu: string;
  projectsCount: number;
  image: string;
  city?: string;
  cityRu?: string;
}

const ITEMS_PER_PAGE = 20;

export default function AreasList() {
  const t = useTranslations('areas');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [allAreas, setAllAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set()); // Track failed image loads
  
  // Get current page from URL
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const totalPages = Math.ceil(allAreas.length / ITEMS_PER_PAGE);
  const validPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  
  // Get areas for current page
  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const areas = allAreas.slice(startIndex, endIndex);

  useEffect(() => {
    const loadAreas = async () => {
      setLoading(true);
      setError(null);
      try {
        // Load allowed areas from areas.json
        let allowedAreaNames = new Set<string>();
        try {
          const areasResponse = await fetch('/areas.json');
          if (areasResponse.ok) {
            const allowedAreasData = await areasResponse.json();
            allowedAreaNames = new Set(
              allowedAreasData.map((area: { name: string }) => area.name.trim())
            );
          }
        } catch (err) {
          // Silent fail - will show all areas with projects and images
        }
        
        // Clear cache to ensure fresh data
        const { clearAreasCache } = await import('@/lib/api');
        clearAreasCache();
        
        const apiAreas = await getAreas(undefined, false);
        
        if (apiAreas.length === 0) {
          console.error('❌ AreasList: No areas loaded from API!');
          setAllAreas([]);
          setLoading(false);
          return;
        }
        
        // Log full API response for "Tilal Al Ghaf" to debug
        const tilalAlGhaf = apiAreas.find(a => 
          a.nameEn?.toLowerCase().includes('tilal') || 
          a.nameEn?.toLowerCase().includes('ghaf')
        );
        if (tilalAlGhaf) {
          console.log('🔍 FULL API RESPONSE for "Tilal Al Ghaf":', JSON.stringify(tilalAlGhaf, null, 2));
        } else {
          console.warn('⚠️ "Tilal Al Ghaf" not found in API response');
          // Log first few areas to see structure
          console.log('📋 First 3 areas from API:', apiAreas.slice(0, 3).map(a => ({
            nameEn: a.nameEn,
            id: a.id,
            images: a.images,
            imagesType: typeof a.images,
            imagesIsArray: Array.isArray(a.images),
            imagesLength: Array.isArray(a.images) ? a.images.length : 'N/A',
          })));
        }
        
        const convertedAreas: Area[] = apiAreas
          .filter(area => {
            const areaName = area.nameEn?.trim();
            const isInAllowedList = allowedAreaNames.size > 0 && areaName && allowedAreaNames.has(areaName);
            
            // If area is in areas.json, always show it (don't filter by images or projects)
            if (isInAllowedList) {
              return true;
            }
            
            // For areas NOT in areas.json, apply normal filtering
            // Filter out areas with 0 projects
            const projectsCount = area.projectsCount?.total || 0;
            if (projectsCount === 0) {
              return false;
            }
            
            // After backend fix: images is now always string[] (never null)
            // Check if images array has valid URLs
            if (!Array.isArray(area.images) || area.images.length === 0) {
              return false;
            }
            
            // Check if images array has valid URLs (after migration: should be simple strings)
            const hasValidImage = area.images.some((img: any) => {
              // After migration: should be simple string with full Cloudinary URL
              if (typeof img === 'string' && img.trim().length > 0) {
                const trimmed = img.trim();
                // Validate it's a proper URL
                return trimmed.startsWith('http://') || trimmed.startsWith('https://');
              }
              // Fallback: check if it's an object with URL fields
              if (img && typeof img === 'object') {
                const url = img.url || img.src || img.imageUrl;
                return typeof url === 'string' && url.trim().length > 0;
              }
              return false;
            });
            
            if (!hasValidImage) {
              return false;
            }
            
            return true;
          })
          .map((area, index) => {
            // Get image - prioritize real images from API
            let imageUrl = '';
            
            // Check if area is in allowed list
            const isInAllowedList = allowedAreaNames.size > 0 && area.nameEn && allowedAreaNames.has(area.nameEn.trim());
            
            // After backend fix: images is now always string[] (never null)
            // Format: [] (empty array) or ["https://res.cloudinary.com/.../areas/area-name-0.jpg", ...]
            // NOTE: Some URLs may still have JSON artifacts like "\"{https://..." or "...jpg}\""
            // First priority: images array from API (real photos)
            if (Array.isArray(area.images) && area.images.length > 0) {
              // After migration: should be simple strings with full Cloudinary URLs
              // But some may still have JSON encoding artifacts that need cleaning
              for (const img of area.images) {
                if (typeof img === 'string' && img.trim().length > 0) {
                  let cleaned = img.trim();
                  
                  // Clean JSON artifacts: remove escaped quotes, braces, etc.
                  // Examples: "\"{https://..." -> "https://..." or "\"https://...\"" -> "https://..." or "...jpg}\"" -> "...jpg"
                  cleaned = cleaned
                    .replace(/^\\?"\{?/g, '') // Remove leading \", {, or \{
                    .replace(/\}?\\?"$/g, '') // Remove trailing }, \", or }\"
                    .replace(/^\\"/g, '') // Remove leading \"
                    .replace(/\\"$/g, '') // Remove trailing \"
                    .trim();
                  
                  // Try to extract URL if it's still wrapped
                  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
                    // Try to extract URL from malformed string
                    const urlMatch = cleaned.match(/https?:\/\/[^\s"{}]+/);
                    if (urlMatch) {
                      cleaned = urlMatch[0];
                    }
                  }
                  
                  // Validate it's a proper URL
                  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
                    // Check if it's a placeholder
                    const isPlaceholder = cleaned.includes('unsplash.com') ||
                      cleaned.includes('placeholder') ||
                      cleaned.includes('via.placeholder.com') ||
                      cleaned.includes('dummyimage.com') ||
                      cleaned.includes('placehold.it') ||
                      cleaned.includes('fakeimg.pl');
                    
                    if (!isPlaceholder) {
                      // Use normalizeImageUrl for Cloudinary URLs to optimize
                      // normalizeImageUrl will handle Cloudinary URLs and add transformations
                      // If it's already a Cloudinary URL, it will optimize it
                      // If it's not Cloudinary, it will return the URL as is
                      imageUrl = normalizeImageUrl(cleaned, {
                        width: 800,
                        height: 600,
                        quality: 'auto',
                        format: 'auto'
                      }) || cleaned;
                      
                      // Image found, break loop
                      break;
                    }
                  }
                } else if (img && typeof img === 'object') {
                  // Fallback: handle object format (for backward compatibility)
                  const url = (img as any).url || (img as any).src || (img as any).imageUrl;
                  if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
                    imageUrl = url.trim();
                    break;
                  }
                }
              }
            }
            
            // Second priority: other image fields (only if images array is empty)
            if (!imageUrl) {
              if (area.imageUrl && typeof area.imageUrl === 'string' && area.imageUrl.trim() !== '') {
                // If it's already a full URL, use it as is
                if (area.imageUrl.startsWith('http://') || area.imageUrl.startsWith('https://')) {
                  imageUrl = area.imageUrl.trim();
                } else {
                  imageUrl = normalizeImageUrl(area.imageUrl, {
                    width: 800,
                    height: 600,
                    quality: 'auto',
                    format: 'auto'
                  });
                }
              } else if (area.cloudinaryId && typeof area.cloudinaryId === 'string') {
                imageUrl = normalizeImageUrl(area.cloudinaryId, {
                  width: 800,
                  height: 600,
                  quality: 'auto',
                  format: 'auto'
                });
              } else if (area.publicId && typeof area.publicId === 'string') {
                imageUrl = normalizeImageUrl(area.publicId, {
                  width: 800,
                  height: 600,
                  quality: 'auto',
                  format: 'auto'
                });
              }
            }
            
            // For areas in areas.json, try to get image from other fields if no image found in images array
            if (!imageUrl && isInAllowedList) {
              // Try to use Cloudinary public_id if available
              if (area.cloudinaryId || area.publicId) {
                imageUrl = normalizeImageUrl(area.cloudinaryId || area.publicId || '', {
                  width: 800,
                  height: 600,
                  quality: 'auto',
                  format: 'auto'
                });
              }
              
              // If still no image, log warning
              if (!imageUrl) {
                console.warn(`⚠️ AreasList: Area "${area.nameEn}" from areas.json has no image URL`, {
                  hasImagesArray: area.images && Array.isArray(area.images),
                  imagesLength: area.images && Array.isArray(area.images) ? area.images.length : 0,
                  hasCloudinaryId: !!(area as any).cloudinaryId,
                  hasPublicId: !!(area as any).publicId,
                });
                
                // Only use placeholder as last resort for areas in areas.json
                // This ensures areas with real images from API are shown correctly
                imageUrl = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&h=600&fit=crop';
              }
            } else if (!imageUrl) {
              // For areas NOT in areas.json, this should not happen due to filtering
              console.warn(`⚠️ AreasList: Area "${area.nameEn}" has no valid image URL (should be filtered out)`);
            }
            
            const convertedArea = {
              id: area.id,
              name: area.nameEn,
              nameRu: area.nameRu,
              projectsCount: area.projectsCount?.total || 0,
              image: imageUrl,
              city: area.city?.nameEn || '',
              cityRu: area.city?.nameRu || '',
            };
            
            // Warn only if image URL is empty for areas that should have images
            if (!convertedArea.image && isInAllowedList) {
              console.warn(`⚠️ AreasList: Area "${convertedArea.name}" from areas.json has no image URL`, {
                hasImagesArray: Array.isArray(area.images),
                imagesLength: Array.isArray(area.images) ? area.images.length : 0,
              });
            }
            
            return convertedArea;
          });
        
        setAllAreas(convertedAreas);
        
        const filteredOut = apiAreas.length - convertedAreas.length;
        const areasWithZeroProjects = apiAreas.filter(area => (area.projectsCount?.total || 0) === 0).length;
        const areasWithoutImages = apiAreas.filter(area => {
          if (!area.images || !Array.isArray(area.images) || area.images.length === 0) {
            return true;
          }
          // After migration: check if images have valid URLs (simple strings)
          const hasValidImage = area.images.some((img: any) => {
            if (typeof img === 'string' && img.trim().length > 0) {
              const trimmed = img.trim();
              return trimmed.startsWith('http://') || trimmed.startsWith('https://');
            }
            if (img && typeof img === 'object') {
              const url = img.url || img.src || img.imageUrl;
              return typeof url === 'string' && url.trim().length > 0;
            }
            return false;
          });
          return !hasValidImage;
        }).length;
        const areasWithImagesCount = apiAreas.filter(area => {
          return Array.isArray(area.images) && area.images.length > 0;
        }).length;
        
        if (convertedAreas.length === 0) {
          console.error('❌ AreasList: No areas to display!');
        }
      } catch (err: any) {
        console.error('Failed to fetch areas:', err);
        setError(err.message || 'Failed to load areas');
      } finally {
        setLoading(false);
      }
    };
    
    loadAreas();
  }, []);
  
  // Update URL when page changes
  const handlePageChange = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage === 1) {
      params.delete('page');
    } else {
      params.set('page', newPage.toString());
    }
    
    const newUrl = params.toString() 
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    
    router.replace(newUrl, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams, router]);
  
  // Ensure page is valid when areas change
  useEffect(() => {
    if (allAreas.length > 0 && validPage > totalPages && totalPages > 0) {
      handlePageChange(1);
    }
  }, [allAreas.length, validPage, totalPages, handlePageChange]);

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  const getAreaName = (area: Area) => {
    return locale === 'ru' ? area.nameRu : area.name;
  };

  const getCityName = (area: Area) => {
    if (area.city && area.cityRu) {
      return locale === 'ru' ? area.cityRu : area.city;
    }
    return '';
  };

  // Прибираємо автоматичне прокручування при завантаженні сторінки
  useEffect(() => {
    // Вимикаємо scroll restoration в Next.js
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    
    // Скролимо вгору при монтуванні компонента
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    // Також перевіряємо, чи немає hash в URL
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
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

  if (loading) {
    return (
      <section className={styles.areasList}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
              <AreaCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.areasList}>
        <div className={styles.container}>
          <div className={styles.error}>{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.areasList} ref={sectionRef}>
      <div className={styles.container}>
        {areas.length > 0 ? (
          <>
            <div className={styles.grid}>
              {areas
                .filter(area => !failedImages.has(area.id)) // Hide areas with failed images
                .map((area, index) => {
                const hasFailed = failedImages.has(area.id);
                
                // Don't render if image has failed
                if (hasFailed) {
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
                        sizes="(max-width: 1200px) 50vw, (max-width: 900px) 100vw, 33vw"
                        unoptimized
                        priority={index < 6} // Prioritize first 6 images for faster loading
                        onError={(e) => {
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
                      <div className={styles.cardOverlayTop}></div>
                      <div className={styles.cardOverlayBottom}></div>
                      <div className={styles.cardContent}>
                        <h3 className={styles.cardTitle}>{getAreaName(area)}</h3>
                        {getCityName(area) && (
                          <p className={styles.cardCity}>{getCityName(area)}</p>
                        )}
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
              })}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.paginationButton}
                  onClick={() => handlePageChange(validPage - 1)}
                  disabled={validPage === 1}
                >
                  {t('previous') || 'Previous'}
                </button>
                <div className={styles.paginationNumbers}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= validPage - 2 && page <= validPage + 2)
                    ) {
                      return (
                        <button
                          key={page}
                          className={`${styles.paginationNumber} ${validPage === page ? styles.active : ''}`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === validPage - 3 || page === validPage + 3) {
                      return <span key={page} className={styles.paginationEllipsis}>...</span>;
                    }
                    return null;
                  })}
                </div>
                <button
                  className={styles.paginationButton}
                  onClick={() => handlePageChange(validPage + 1)}
                  disabled={validPage >= totalPages}
                >
                  {t('next') || 'Next'}
                </button>
              </div>
            )}
          </>
        ) : !loading && (
          <div className={styles.noAreas}>
            {t('noAreas')}
          </div>
        )}
      </div>
    </section>
  );
}

