'use client';

import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { getDevelopers, Developer as ApiDeveloper, normalizeImageUrls, normalizeImageUrl } from '@/lib/api';
import styles from './DevelopersList.module.css';

interface Developer {
  id: string;
  name: string;
  logo: string | null;
  description: string | null;
  images: string[] | null;
  projectsCount: number;
  createdAt?: string;
}

export default function DevelopersList() {
  const t = useTranslations('developers');
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [failedLogos, setFailedLogos] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadDevelopers = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('🔄 Loading developers...');
        const apiDevelopers = await getDevelopers();
        console.log('✅ Received developers from API:', apiDevelopers.length);
        
        if (!Array.isArray(apiDevelopers)) {
          console.error('❌ API returned non-array:', apiDevelopers);
          setError('Invalid data format from API');
          setLoading(false);
          return;
        }
        
        // Convert API developers to component format
        const convertedDevelopers: Developer[] = apiDevelopers.map(dev => {
          // Get description text (can be from description.description or description.title)
          const descriptionText = dev.description 
            ? (dev.description.description || dev.description.title || null)
            : null;
          
          // Ensure images is properly formatted and normalized
          let images: string[] | null = null;
          if (dev.images) {
            let rawImages: string[] = [];
            if (Array.isArray(dev.images)) {
              rawImages = dev.images.filter(img => img && typeof img === 'string' && img.trim().length > 0);
            } else if (typeof dev.images === 'string' && dev.images.trim().length > 0) {
              rawImages = [dev.images];
            }
            
            // Normalize image URLs for proper display
            if (rawImages.length > 0) {
              images = normalizeImageUrls(rawImages, {
                width: 800,
                height: 600,
                quality: 'auto',
                format: 'auto'
              });
              // Filter out empty or invalid URLs
              images = images.filter(img => img && img.trim().length > 0 && (img.startsWith('http://') || img.startsWith('https://')));
              if (images.length === 0) {
                images = null;
              } else if (process.env.NODE_ENV === 'development') {
                console.log(`📸 Normalized images for ${dev.name}:`, images);
              }
            }
          }
          
          // Normalize logo URL
          let normalizedLogo: string | null = null;
          if (dev.logo) {
            normalizedLogo = normalizeImageUrl(dev.logo, {
              width: 240,
              height: 240,
              quality: 'auto',
              format: 'auto'
            });
            // Check if logo URL is valid
            if (!normalizedLogo || normalizedLogo.trim().length === 0 || (!normalizedLogo.startsWith('http://') && !normalizedLogo.startsWith('https://'))) {
              normalizedLogo = null;
            }
          }
          
          return {
            id: dev.id,
            name: dev.name,
            logo: normalizedLogo,
            description: descriptionText,
            images: images,
            projectsCount: dev.projectsCount?.total || 0,
            createdAt: dev.createdAt,
          };
        });
        
        // Filter out developers without valid logos
        const developersWithLogos = convertedDevelopers.filter(d => d.logo && d.logo.trim().length > 0);
        
        console.log('✅ Converted developers:', convertedDevelopers.length);
        console.log(`✅ Developers with logos: ${developersWithLogos.length}`);
        setDevelopers(developersWithLogos);
        
        if (developersWithLogos.length > 0) {
          setSelectedDeveloper(developersWithLogos[0]);
          // Log first developer's images for debugging
          if (developersWithLogos[0].images) {
            console.log('📸 First developer images:', {
              name: developersWithLogos[0].name,
              imagesCount: developersWithLogos[0].images.length,
              images: developersWithLogos[0].images
            });
          }
        }
        
        if (process.env.NODE_ENV === 'development') {
          const developersWithImages = developersWithLogos.filter(d => d.images && Array.isArray(d.images) && d.images.length > 0).length;
          const developersWithLogo = developersWithLogos.filter(d => d.logo).length;
          console.log(`✅ Loaded ${developersWithLogos.length} developers (filtered), ${developersWithImages} with images, ${developersWithLogo} with logo`);
        }
      } catch (err: any) {
        console.error('❌ Failed to fetch developers:', err);
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
          response: err.response?.data,
        });
        setError(err.message || 'Failed to load developers');
      } finally {
        setLoading(false);
      }
    };
    
    loadDevelopers();
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

  const handleDeveloperSelect = (developer: Developer) => {
    setSelectedDeveloper(developer);
  };

  const handleImageError = (imageUrl: string, event?: any) => {
    console.error('❌ Failed to load image:', imageUrl);
    setFailedImages(prev => new Set(prev).add(imageUrl));
  };

  const handleLogoError = (logoUrl: string, event?: any) => {
    console.error('❌ Failed to load logo:', logoUrl);
    setFailedLogos(prev => new Set(prev).add(logoUrl));
    // Remove developer from list if logo failed to load
    setDevelopers(prev => {
      const filtered = prev.filter(dev => dev.logo !== logoUrl);
      // If selected developer's logo failed, select first available developer
      setSelectedDeveloper(current => {
        if (current && current.logo === logoUrl) {
          return filtered.length > 0 ? filtered[0] : null;
        }
        return current;
      });
      return filtered;
    });
  };

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US');
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <section className={styles.developersList}>
        <div className={styles.container}>
          <div className={styles.loading}>{t('loading') || 'Loading...'}</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.developersList}>
        <div className={styles.container}>
          <div className={styles.error}>{error}</div>
        </div>
      </section>
    );
  }

  if (developers.length === 0 && !loading) {
    return (
      <section className={styles.developersList}>
        <div className={styles.container}>
          <div className={styles.noDevelopers}>
            {t('noDevelopers') || 'No developers found'}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.developersList} ref={sectionRef}>
      <div className={`${styles.container} ${isVisible ? styles.visible : ''}`}>
        <div className={styles.content}>
          {/* Ліва частина - список девелоперів (60%) */}
          <div className={styles.developersGrid}>
            {developers.length > 0 ? developers.map((developer) => (
              <div
                key={developer.id}
                className={`${styles.developerCard} ${
                  selectedDeveloper?.id === developer.id ? styles.selected : ''
                }`}
                onClick={() => handleDeveloperSelect(developer)}
              >
                <div className={styles.logoWrapper}>
                  {developer.logo && !failedLogos.has(developer.logo) ? (
                    <div className={styles.logoContainer}>
                      <Image
                        src={developer.logo}
                        alt={developer.name}
                        fill
                        className={styles.logo}
                        sizes="120px"
                        unoptimized
                        onError={() => handleLogoError(developer.logo!)}
                      />
                    </div>
                  ) : (
                    <div className={styles.logoPlaceholder}>
                      <Image
                        src="/logo color.png"
                        alt="ProPart"
                        width={120}
                        height={120}
                        className={styles.logoPlaceholderImage}
                        unoptimized
                      />
                    </div>
                  )}
                </div>
                <h3 className={styles.developerName}>{developer.name}</h3>
              </div>
            )) : (
              <div className={styles.noDevelopers}>
                {t('noDevelopers') || 'No developers found'}
              </div>
            )}
          </div>

          {/* Права частина - інформація по девелоперу (40%) */}
          <div className={styles.developerDetails}>
            {selectedDeveloper ? (
              <>
                <div className={styles.detailsHeader}>
                  {selectedDeveloper.logo && !failedLogos.has(selectedDeveloper.logo) ? (
                    <div className={styles.detailsLogoContainer}>
                      <Image
                        src={selectedDeveloper.logo}
                        alt={selectedDeveloper.name}
                        width={120}
                        height={120}
                        className={styles.detailsLogo}
                        unoptimized
                        onError={() => handleLogoError(selectedDeveloper.logo!)}
                      />
                    </div>
                  ) : (
                    <div className={styles.detailsLogoPlaceholder}>
                      <Image
                        src="/logo color.png"
                        alt="ProPart"
                        width={120}
                        height={120}
                        className={styles.logoPlaceholderImage}
                        unoptimized
                      />
                    </div>
                  )}
                  <h2 className={styles.detailsName}>{selectedDeveloper.name}</h2>
                </div>

                {selectedDeveloper.description && (
                  <div className={styles.description}>
                    <p>{selectedDeveloper.description}</p>
                  </div>
                )}

                {selectedDeveloper.images && selectedDeveloper.images.length > 0 && (
                  <div className={styles.images}>
                    <h3 className={styles.imagesTitle}>{t('images')}</h3>
                    <div className={styles.imagesGrid}>
                      {selectedDeveloper.images.map((image, index) => {
                        const imageFailed = failedImages.has(image);
                        const isValidUrl = image && image.trim().length > 0 && (image.startsWith('http://') || image.startsWith('https://'));
                        
                        if (!isValidUrl || imageFailed) {
                          return (
                            <div key={index} className={styles.imageItem}>
                              <div className={styles.imagePlaceholder}>
                                <span className={styles.imagePlaceholderText}>
                                  {selectedDeveloper.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                          );
                        }
                        
                        return (
                          <div key={index} className={styles.imageItem}>
                            <Image
                              src={image}
                              alt={`${selectedDeveloper.name} - Image ${index + 1}`}
                              fill
                              style={{ objectFit: 'cover' }}
                              sizes="(max-width: 1200px) 50vw, 33vw"
                              unoptimized
                              onError={(e) => {
                                console.error(`❌ Image failed to load: ${image}`, e);
                                handleImageError(image, e);
                              }}
                              onLoad={() => {
                                if (process.env.NODE_ENV === 'development') {
                                  console.log(`✅ Image loaded: ${image}`);
                                }
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedDeveloper.createdAt && (
                  <div className={styles.meta}>
                    <p className={styles.createdAt}>
                      {t('createdAt') || 'Created'}: {formatDate(selectedDeveloper.createdAt)}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.noSelection}>
                <p>{t('noSelection')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

