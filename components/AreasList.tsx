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
  const [imagesLoading, setImagesLoading] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set()); // Track failed image loads
  
  // Initialize all images as loading
  useEffect(() => {
    if (allAreas.length > 0) {
      setImagesLoading(new Set(allAreas.map(area => area.id)));
    }
  }, [allAreas]);
  
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
          console.warn('Failed to load areas.json, showing all areas:', err);
        }
        
        const apiAreas = await getAreas();
        
        // Convert API areas to component format - allow areas without images (use placeholder)
        if (process.env.NODE_ENV === 'development') {
          console.log(`📊 AreasList: Received ${apiAreas.length} areas from API`);
          console.log(`📋 AreasList: Allowed areas from areas.json: ${allowedAreaNames.size} areas`);
          const areasWithImages = apiAreas.filter(a => a.images && Array.isArray(a.images) && a.images.length > 0).length;
          console.log(`📸 AreasList: ${areasWithImages}/${apiAreas.length} areas have images array`);
          
          if (areasWithImages > 0) {
            const sample = apiAreas.filter(a => a.images && Array.isArray(a.images) && a.images.length > 0).slice(0, 3);
            console.log('📸 AreasList: Sample areas with images:', sample.map(a => ({
              name: a.nameEn,
              imagesCount: a.images?.length || 0,
              firstImage: a.images?.[0]?.substring(0, 80) || 'N/A'
            })));
          }
        }
        
        const convertedAreas: Area[] = apiAreas
          .filter(area => {
            // Filter by allowed area names from areas.json (only if areas.json was loaded successfully)
            if (allowedAreaNames.size > 0) {
              const areaName = area.nameEn?.trim();
              if (!areaName || !allowedAreaNames.has(areaName)) {
                if (process.env.NODE_ENV === 'development') {
                  console.log(`❌ Area "${areaName}" (${area.id}) filtered out: not in areas.json`);
                }
                return false;
              }
            }
            
            // Filter out areas with 0 projects
            const projectsCount = area.projectsCount?.total || 0;
            if (projectsCount === 0) {
              if (process.env.NODE_ENV === 'development') {
                console.log(`❌ Area "${area.nameEn}" (${area.id}) filtered out: 0 projects`);
              }
              return false;
            }
            
            // Allow areas even without images - we'll use a placeholder if needed
            return true;
          })
          .map((area, index) => {
            // Get image - prioritize real images from API
            let imageUrl = '';
            
            // First priority: images array from API (real photos)
            if (area.images && Array.isArray(area.images) && area.images.length > 0) {
              const firstImage = area.images[0];
              
              if (typeof firstImage === 'string' && firstImage.trim() !== '') {
                // If it's already a full URL (reely, alnair, etc.), use it as is
                if (firstImage.startsWith('http://') || firstImage.startsWith('https://')) {
                  // Check if it's a placeholder
                  const isPlaceholder = firstImage.includes('unsplash.com') ||
                    firstImage.includes('placeholder') ||
                    firstImage.includes('via.placeholder.com') ||
                    firstImage.includes('dummyimage.com') ||
                    firstImage.includes('placehold.it') ||
                    firstImage.includes('fakeimg.pl');
                  
                  if (!isPlaceholder) {
                    imageUrl = firstImage.trim();
                  }
                } else {
                  // If it's not a full URL, use normalizeImageUrl for Cloudinary/public_id
                  const normalized = normalizeImageUrl(firstImage, {
                    width: 800,
                    height: 600,
                    quality: 'auto',
                    format: 'auto'
                  });
                  
                  if (normalized && normalized.trim() !== '') {
                    const isPlaceholder = normalized.includes('unsplash.com') ||
                      normalized.includes('placeholder') ||
                      normalized.includes('via.placeholder.com') ||
                      normalized.includes('dummyimage.com') ||
                      normalized.includes('placehold.it') ||
                      normalized.includes('fakeimg.pl');
                    
                    if (!isPlaceholder) {
                      imageUrl = normalized;
                    }
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
            
            // Fallback to a default placeholder if no valid image
            if (!imageUrl) {
              imageUrl = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&h=600&fit=crop';
              
              if (process.env.NODE_ENV === 'development' && index < 3) {
                console.warn(`⚠️ AreasList: Area "${area.nameEn}" using placeholder image`);
              }
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
            
            if (process.env.NODE_ENV === 'development' && index < 3) {
              console.log(`✅ AreasList: Converted area "${convertedArea.name}":`, {
                image: convertedArea.image.substring(0, 80),
                isPlaceholder: convertedArea.image.includes('unsplash.com'),
                isCloudinary: convertedArea.image.includes('cloudinary.com'),
              });
            }
            
            return convertedArea;
          });
        
        setAllAreas(convertedAreas);
        
        if (process.env.NODE_ENV === 'development') {
          const filteredOut = apiAreas.length - convertedAreas.length;
          const areasWithZeroProjects = apiAreas.filter(area => (area.projectsCount?.total || 0) === 0).length;
          const areasWithoutImages = apiAreas.filter(area => {
            const hasImages = area.images && Array.isArray(area.images) && area.images.length > 0;
            if (!hasImages) return true;
            const firstImage = area.images && area.images.length > 0 ? area.images[0] : null;
            if (!firstImage || typeof firstImage !== 'string' || firstImage.trim() === '') return true;
            const isPlaceholder = firstImage.includes('unsplash.com') ||
              firstImage.includes('placeholder') ||
              firstImage.includes('via.placeholder.com') ||
              firstImage.includes('dummyimage.com');
            const isValidUrl = firstImage.startsWith('http://') || firstImage.startsWith('https://');
            return isPlaceholder || !isValidUrl;
          }).length;
          
          console.log(`✅ Loaded ${convertedAreas.length} areas with projects and valid images`);
          console.log(`   Filtered out:`);
          console.log(`   - ${areasWithZeroProjects} areas with 0 projects`);
          console.log(`   - ${areasWithoutImages} areas with no images/invalid images`);
          console.log(`   Total filtered: ${filteredOut} areas`);
          
          // Log some examples of filtered areas with 0 projects
          if (areasWithZeroProjects > 0) {
            const zeroProjectAreas = apiAreas.filter(area => (area.projectsCount?.total || 0) === 0).slice(0, 10);
            console.log(`📋 Examples of areas with 0 projects (filtered out):`, zeroProjectAreas.map(a => ({
              name: a.nameEn,
              projectsCount: a.projectsCount?.total || 0
            })));
          }
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
                .map((area) => {
                const isImageLoading = imagesLoading.has(area.id);
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
                      {isImageLoading && (
                        <div className={styles.imageSkeleton}></div>
                      )}
                      <Image
                        src={area.image}
                        alt={getAreaName(area)}
                        fill
                        style={{ objectFit: 'cover', opacity: isImageLoading ? 0 : 1, transition: 'opacity 0.3s ease' }}
                        sizes="(max-width: 1200px) 50vw, (max-width: 900px) 100vw, 33vw"
                        unoptimized
                        onLoad={() => {
                          setImagesLoading(prev => {
                            const next = new Set(prev);
                            next.delete(area.id);
                            return next;
                          });
                        }}
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
                          setImagesLoading(prev => {
                            const next = new Set(prev);
                            next.delete(area.id);
                            return next;
                          });
                        }}
                        onLoadingComplete={() => {
                          setImagesLoading(prev => {
                            const next = new Set(prev);
                            next.delete(area.id);
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

