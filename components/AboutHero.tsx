'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { submitFormToSheets } from '@/lib/googleSheets';
import styles from './AboutHero.module.css';


export default function AboutHero() {
  const t = useTranslations('aboutUs');
  const locale = useLocale();
  const [stat1Value, setStat1Value] = useState(0);
  const [stat2Value, setStat2Value] = useState(0);
  const [stat3Value, setStat3Value] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);
  const milestonesRef = useRef<HTMLDivElement>(null);
  const topSectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMilestonesVisible, setIsMilestonesVisible] = useState(false);
  const [isTopSectionVisible, setIsTopSectionVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isTopSectionVisible) {
            setIsTopSectionVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (topSectionRef.current) {
      observer.observe(topSectionRef.current);
    }

    return () => {
      if (topSectionRef.current) {
        observer.unobserve(topSectionRef.current);
      }
    };
  }, [isTopSectionVisible]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isMilestonesVisible) {
            setIsMilestonesVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (milestonesRef.current) {
      observer.observe(milestonesRef.current);
    }

    return () => {
      if (milestonesRef.current) {
        observer.unobserve(milestonesRef.current);
      }
    };
  }, [isMilestonesVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const animateValue = (
      setter: (value: number) => void,
      start: number,
      end: number,
      duration: number,
      suffix: string = ''
    ) => {
      const startTime = Date.now();
      const endTime = startTime + duration;

      const animate = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (end - start) * easeOutQuart);
        
        setter(current);

        if (now < endTime) {
          requestAnimationFrame(animate);
        } else {
          setter(end);
        }
      };

      animate();
    };

    // Parse numbers from stat strings
    const parseStat = (stat: string): number => {
      if (stat.includes('%')) {
        return parseInt(stat.replace('%', ''));
      }
      if (stat.includes('+')) {
        return parseInt(stat.replace('+', ''));
      }
      return parseInt(stat);
    };

    const stat1Num = parseStat(t('stat1Number'));
    const stat2Num = parseStat(t('stat2Number'));
    const stat3Num = parseStat(t('stat3Number'));

    animateValue(setStat1Value, 0, stat1Num, 2000);
    animateValue(setStat2Value, 0, stat2Num, 2000);
    animateValue(setStat3Value, 0, stat3Num, 2000);
  }, [isVisible, t]);

  const formatStat = (value: number, original: string): string => {
    if (original.includes('%')) {
      return `${value}%`;
    }
    if (original.includes('+')) {
      return `${value}+`;
    }
    return value.toString().padStart(2, '0');
  };

  return (
    <div className={styles.container}>
      {/* Top Section */}
      <div 
        className={`${styles.topSection} ${isTopSectionVisible ? styles.visible : ''}`}
        ref={topSectionRef}
      >
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            {t('heroTitle1')}
            <br />
            {t('heroTitle2')}
          </h1>
        </div>
        <div className={styles.descriptionSection}>
          <p className={styles.description}>
            {t('heroDescription')}
          </p>
          {t('heroSubDescription') && (
            <p className={styles.subDescription}>
              {t('heroSubDescription')}
            </p>
          )}
        </div>
      </div>

      {/* Statistics Section */}
      <div className={styles.statsSection} ref={statsRef}>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>{formatStat(stat1Value, t('stat1Number'))}</div>
          <div className={styles.statLabel}>{t('stat1Label')}</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>{formatStat(stat2Value, t('stat2Number'))}</div>
          <div className={styles.statLabel}>{t('stat2Label')}</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>{formatStat(stat3Value, t('stat3Number'))}</div>
          <div className={styles.statLabel}>{t('stat3Label')}</div>
        </div>
      </div>

      {/* Milestones Section */}
      <div 
        className={`${styles.milestonesSection} ${isMilestonesVisible ? styles.visible : ''}`}
        ref={milestonesRef}
      >
        <div className={styles.milestonesContainer}>
          <div className={styles.milestonesHeader}>
            <h2 className={styles.milestonesTitle}>{t('milestonesTitle')}</h2>
            <p className={styles.milestonesDescription}>{t('milestonesDescription')}</p>
          </div>
          
          <div className={styles.milestonesTimeline}>
            <div className={styles.timelineLine}></div>
            
            <div className={styles.milestoneItem}>
              <div className={styles.milestoneDot}></div>
              <div className={styles.milestoneContent}>
                <div className={styles.milestoneYear}>{t('milestone2022.year')}</div>
                <div className={styles.milestoneTitle}>{t('milestone2022.boldTitle')}</div>
                <div className={styles.milestoneDescription}>{t('milestone2022.description')}</div>
              </div>
            </div>

            <div className={styles.milestoneItem}>
              <div className={styles.milestoneDot}></div>
              <div className={styles.milestoneContent}>
                <div className={styles.milestoneYear}>{t('milestone2023.year')}</div>
                <div className={styles.milestoneTitle}>{t('milestone2023.boldTitle')}</div>
                <div className={styles.milestoneDescription}>{t('milestone2023.description')}</div>
              </div>
            </div>

            <div className={styles.milestoneItem}>
              <div className={styles.milestoneDot}></div>
              <div className={styles.milestoneContent}>
                <div className={styles.milestoneYear}>{t('milestone2024.year')}</div>
                <div className={styles.milestoneTitle}>{t('milestone2024.boldTitle')}</div>
                <div className={styles.milestoneDescription}>{t('milestone2024.description')}</div>
              </div>
            </div>

            <div className={styles.milestoneItem}>
              <div className={styles.milestoneDot}></div>
              <div className={styles.milestoneContent}>
                <div className={styles.milestoneYear}>{t('milestone2025.year')}</div>
                <div className={styles.milestoneTitle}>{t('milestone2025.boldTitle')}</div>
                <div className={styles.milestoneDescription}>{t('milestone2025.description')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Partners Section */}
      <div className={styles.partnersSection}>
        <div className={styles.partnersContainer}>
          <h2 className={styles.partnersTitle}>{t('partnersTitle')}</h2>
          <div className={styles.partnersScroll}>
            <div className={styles.partnersList}>
              {/* Placeholder logos - will be replaced with actual logos */}
              <div className={styles.partnerLogo}>Emaar</div>
              <div className={styles.partnerLogo}>Damac</div>
              <div className={styles.partnerLogo}>Nakheel</div>
              <div className={styles.partnerLogo}>Dubai Properties</div>
              <div className={styles.partnerLogo}>Meraas</div>
              <div className={styles.partnerLogo}>Sobha</div>
              <div className={styles.partnerLogo}>MAG</div>
              <div className={styles.partnerLogo}>Azizi</div>
              {/* Duplicate for seamless infinite loop */}
              <div className={styles.partnerLogo}>Emaar</div>
              <div className={styles.partnerLogo}>Damac</div>
              <div className={styles.partnerLogo}>Nakheel</div>
              <div className={styles.partnerLogo}>Dubai Properties</div>
              <div className={styles.partnerLogo}>Meraas</div>
              <div className={styles.partnerLogo}>Sobha</div>
              <div className={styles.partnerLogo}>MAG</div>
              <div className={styles.partnerLogo}>Azizi</div>
            </div>
          </div>
        </div>
      </div>

      {/* Office Section */}
      <OfficeSection t={t} />

      {/* Leadership Section */}
      <LeadershipSection t={t} />

      {/* FAQ Section */}
      <FAQSection t={t} />
    </div>
  );
}


export function OfficeSection({ t }: { t: any }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Lazy load Mapbox only when map container becomes visible (оптимізація: не завантажуємо Mapbox до появи в viewport)
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Use Intersection Observer to load Mapbox only when visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !mapRef.current) {
            // Map container is visible, load Mapbox
            const loadMapbox = async () => {
              if (process.env.NODE_ENV === 'development') {
                console.log('🗺️ Loading Mapbox (map container is now visible)');
              }
              
              const mapboxgl = (await import('mapbox-gl')).default;
              // CSS is imported globally in app/globals.css
              
              const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

              if (!token) {
                console.warn('Mapbox token is not set');
                return;
              }

              mapboxgl.accessToken = token;

              const map = new mapboxgl.Map({
                container: mapContainerRef.current!,
                style: 'mapbox://styles/abiespana/cmcxiep98004r01quhxspf3w9',
                center: [55.1503, 25.0745], // Jumeirah Bay X3, Cluster X, JLT
                zoom: 15,
                interactive: true,
                // Optimize Mapbox loading - обмежуємо область та zoom для зменшення кількості тайлів
                maxZoom: 18,
                minZoom: 10,
                maxBounds: [
                  [54.0, 24.0], // Southwest coordinates (Dubai area)
                  [56.0, 26.0], // Northeast coordinates (Dubai area)
                ],
              });

              map.on('load', () => {
                map.addControl(new mapboxgl.NavigationControl(), 'top-right');

                // Add office marker with custom style
                const officeCoordinates: [number, number] = [55.1503, 25.0745]; // Jumeirah Bay X3, Cluster X, JLT
                const el = document.createElement('div');
                el.className = 'office-marker';
                el.style.cssText = `
                  background: #0055aa;
                  color: #ffffff;
                  padding: 6px 10px;
                  border-radius: 6px;
                  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                  font-size: 12px;
                  font-weight: 600;
                  line-height: 1.2;
                  white-space: nowrap;
                  cursor: pointer;
                  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                  border: 2px solid #ffffff;
                `;
                el.textContent = 'Office';
                
                const marker = new mapboxgl.Marker({
                  element: el,
                  anchor: 'center',
                })
                  .setLngLat(officeCoordinates)
                  .addTo(map);

                markerRef.current = marker;
                
                if (process.env.NODE_ENV === 'development') {
                  console.log('✅ Mapbox loaded successfully');
                }
              });

              mapRef.current = map;
            };

            loadMapbox();
            
            // Unobserve after loading to avoid reloading
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 } // Load when 10% of map container is visible
    );

    observer.observe(mapContainerRef.current);

    return () => {
      observer.disconnect();
      if (markerRef.current) {
        markerRef.current.remove();
      }
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show success message immediately
    setShowSuccess(true);
    
    // Reset form
    const formDataToSubmit = {
      name,
      phone,
      email: '',
      message,
      date: selectedDate,
      time: selectedTime,
    };
    
    setSelectedDate('');
    setSelectedTime('');
    setName('');
    setPhone('');
    setMessage('');
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
    
    // Submit to Google Sheets in the background (don't wait for it)
    submitFormToSheets({
      formType: 'schedule-meeting',
      name: formDataToSubmit.name,
      phone: formDataToSubmit.phone,
      email: formDataToSubmit.email,
      message: formDataToSubmit.message,
      additionalData: {
        date: formDataToSubmit.date,
        time: formDataToSubmit.time,
      },
    }).catch((error) => {
      console.error('Error submitting form to Google Sheets:', error);
    });
  };

  // Generate time slots (9 AM to 6 PM, every hour)
  const timeSlots = [];
  for (let hour = 9; hour <= 18; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  return (
    <div className={styles.officeSection}>
      <div className={styles.officeContainer}>
        <div className={styles.officeContent}>
          <div className={styles.officeMapContainer}>
            <div ref={mapContainerRef} className={styles.officeMap} />
          </div>
          <div className={styles.officeFormContainer}>
            <h2 className={styles.officeTitle}>{t('officeTitle')}</h2>
            <p className={styles.officeDescription}>{t('officeDescription')}</p>
            {showSuccess ? (
              <div className={styles.successMessage}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p>{t('officeForm.success')}</p>
              </div>
            ) : (
              <form className={styles.officeForm} onSubmit={handleSubmit}>
              <h3 className={styles.formTitle}>{t('officeForm.title')}</h3>
              
              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label>{t('officeForm.dateLabel')}</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className={styles.formField}>
                  <label>{t('officeForm.timeLabel')}</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    required
                  >
                    <option value="">{t('officeForm.timeLabel')}</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label>{t('officeForm.nameLabel')}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('officeForm.namePlaceholder')}
                    required
                  />
                </div>
                <div className={styles.formField}>
                  <label>{t('officeForm.phoneLabel')}</label>
                  <div className={styles.phoneInputWrapper}>
                    <span className={styles.phonePrefix}>+</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t('officeForm.phonePlaceholder')}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formField}>
                <label>{t('officeForm.messageLabel')}</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('officeForm.messagePlaceholder')}
                  rows={4}
                />
              </div>

              <button type="submit" className={styles.submitButton}>
                {t('officeForm.submitButton')}
              </button>
            </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FAQSection({ t }: { t: any }) {
  const faqRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (faqRef.current) {
      observer.observe(faqRef.current);
    }

    return () => {
      if (faqRef.current) {
        observer.unobserve(faqRef.current);
      }
    };
  }, [isVisible]);

  const faqItems = t.raw('faq') || [];

  return (
    <div 
      className={`${styles.faqSection} ${isVisible ? styles.visible : ''}`}
      ref={faqRef}
    >
      <div className={styles.faqContainer}>
        <h2 className={styles.faqTitle}>{t('faqTitle')}</h2>
        <div className={styles.faqList}>
          {faqItems.map((item: any, index: number) => (
            <div 
              key={index}
              className={`${styles.faqItem} ${openIndex === index ? styles.open : ''}`}
            >
              <button
                className={styles.faqQuestion}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span>{item.question}</span>
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.faqIcon}
                >
                  <path 
                    d="M6 9L12 15L18 9" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div className={styles.faqAnswer}>
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LeadershipSection({ t }: { t: any }) {
  return (
    <div className={styles.leadershipSection}>
      <div className={styles.leadershipContainer}>
        <div className={styles.leadershipContent}>
          <div className={styles.leadershipPhotoColumn}>
            <div className={styles.leadershipPhotoWrapper}>
              <div className={styles.leadershipPhoto}>
                <Image
                  src="https://res.cloudinary.com/dgv0rxd60/image/upload/v1763019357/photo_2025-03-22_22-48-51_fm2kpr.jpg"
                  alt={t('leaders.olexandr.name')}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 900px) 100vw, 40vw"
                  loading="lazy"
                />
              </div>
              <div className={styles.leadershipTag}>
                <span>{t('leaders.olexandr.tag')}</span>
              </div>
            </div>
          </div>
          
          <div className={styles.leadershipInfoColumn}>
            <div className={styles.leadershipProfile}>
              <h3 className={styles.leadershipName}>{t('leaders.olexandr.name')}</h3>
              <p className={styles.leadershipRole}>{t('leaders.olexandr.role')}</p>
              
              <p className={styles.leadershipBio}>
                {t('leaders.olexandr.bio')}
              </p>
              
              <div className={styles.leadershipSocial}>
                <a href="https://www.youtube.com/@logachev_alexsandr" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="YouTube">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a href="https://www.instagram.com/pro.part.ae?igsh=MWxqemdyMm56cG1lYw%3D%3D" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="https://t.me/pro_partUAE" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Telegram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div className={styles.leadershipExperience}>
              <h4 className={styles.experienceTitle}>{t('leaders.olexandr.experienceTitle')}</h4>
              <p className={styles.experienceDescription}>
                {t('leaders.olexandr.experienceDescription')}
              </p>
              <ul className={styles.experienceList}>
                <li>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>{t('leaders.olexandr.experience1')}</span>
                </li>
                <li>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>{t('leaders.olexandr.experience2')}</span>
                </li>
                <li>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>{t('leaders.olexandr.experience3')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

