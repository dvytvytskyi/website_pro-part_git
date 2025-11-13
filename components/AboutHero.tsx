'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import styles from './AboutHero.module.css';


export default function AboutHero() {
  const t = useTranslations('aboutUs');
  const locale = useLocale();
  const [stat1Value, setStat1Value] = useState(0);
  const [stat2Value, setStat2Value] = useState(0);
  const [stat3Value, setStat3Value] = useState(0);
  const [stat4Value, setStat4Value] = useState(0);
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
    const stat4Num = parseStat(t('stat4Number'));

    animateValue(setStat1Value, 0, stat1Num, 2000);
    animateValue(setStat2Value, 0, stat2Num, 2000);
    animateValue(setStat3Value, 0, stat3Num, 2000);
    animateValue(setStat4Value, 0, stat4Num, 2000);
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
          <p className={styles.subDescription}>
            {t('heroSubDescription')}
          </p>
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
        <div className={styles.statItem}>
          <div className={styles.statNumber}>{formatStat(stat4Value, t('stat4Number'))}</div>
          <div className={styles.statLabel}>{t('stat4Label')}</div>
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
          
          <div className={styles.milestonesGrid}>
            <div className={styles.milestoneCard}>
              <div className={styles.milestoneCardHeader}>
                <div className={styles.milestoneIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                  </svg>
                </div>
                <div className={styles.milestoneYear}>{t('milestone2022.year')}</div>
              </div>
              <div className={styles.milestoneCardContent}>
                <div className={styles.milestoneShortTitle}>{t('milestone2022.shortTitle')}</div>
                <div className={styles.milestoneBoldTitle}>{t('milestone2022.boldTitle')}</div>
                <div className={styles.milestoneDescription}>{t('milestone2022.description')}</div>
              </div>
            </div>

            <div className={styles.milestoneCard}>
              <div className={styles.milestoneCardHeader}>
                <div className={styles.milestoneIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <div className={styles.milestoneYear}>{t('milestone2023.year')}</div>
              </div>
              <div className={styles.milestoneCardContent}>
                <div className={styles.milestoneShortTitle}>{t('milestone2023.shortTitle')}</div>
                <div className={styles.milestoneBoldTitle}>{t('milestone2023.boldTitle')}</div>
                <div className={styles.milestoneDescription}>{t('milestone2023.description')}</div>
              </div>
            </div>

            <div className={styles.milestoneCard}>
              <div className={styles.milestoneCardHeader}>
                <div className={styles.milestoneIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div className={styles.milestoneYear}>{t('milestone2024.year')}</div>
              </div>
              <div className={styles.milestoneCardContent}>
                <div className={styles.milestoneShortTitle}>{t('milestone2024.shortTitle')}</div>
                <div className={styles.milestoneBoldTitle}>{t('milestone2024.boldTitle')}</div>
                <div className={styles.milestoneDescription}>{t('milestone2024.description')}</div>
              </div>
            </div>

            <div className={styles.milestoneCard}>
              <div className={styles.milestoneCardHeader}>
                <div className={styles.milestoneIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                </div>
                <div className={styles.milestoneYear}>{t('milestone2025.year')}</div>
              </div>
              <div className={styles.milestoneCardContent}>
                <div className={styles.milestoneShortTitle}>{t('milestone2025.shortTitle')}</div>
                <div className={styles.milestoneBoldTitle}>{t('milestone2025.boldTitle')}</div>
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

      {/* Team Section */}
      <TeamSection t={t} />

      {/* Office Section */}
      <OfficeSection t={t} />

      {/* Leadership Section */}
      <LeadershipSection t={t} />

      {/* FAQ Section */}
      <FAQSection t={t} />
    </div>
  );
}


export function TeamSection({ t }: { t: any }) {
  return (
    <div className={styles.teamSection}>
      <div className={styles.teamContainer}>
        <div className={styles.teamHeader}>
          <h2 className={styles.teamTitle}>{t('teamTitle')}</h2>
          <p className={styles.teamDescription}>{t('teamDescription')}</p>
        </div>
        <div className={styles.teamGrid}>
          <div className={styles.teamMember}>
            <div className={styles.teamPhotoWrapper}>
              <div className={styles.teamPhoto}>
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop"
                  alt={t('teamMembers.daniil')}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  loading="lazy"
                />
              </div>
              <div className={styles.teamOverlay}></div>
            </div>
            <div className={styles.teamInfo}>
              <div className={styles.teamName}>{t('teamMembers.daniil')}</div>
              <div className={styles.teamRole}>{t('teamMembers.daniilRole')}</div>
            </div>
          </div>
          <div className={styles.teamMember}>
            <div className={styles.teamPhotoWrapper}>
              <div className={styles.teamPhoto}>
                <Image
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop"
                  alt={t('teamMembers.angelina')}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  loading="lazy"
                />
              </div>
              <div className={styles.teamOverlay}></div>
            </div>
            <div className={styles.teamInfo}>
              <div className={styles.teamName}>{t('teamMembers.angelina')}</div>
              <div className={styles.teamRole}>{t('teamMembers.angelinaRole')}</div>
            </div>
          </div>
          <div className={styles.teamMember}>
            <div className={styles.teamPhotoWrapper}>
              <div className={styles.teamPhoto}>
                <Image
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=800&fit=crop"
                  alt={t('teamMembers.kamila')}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  loading="lazy"
                />
              </div>
              <div className={styles.teamOverlay}></div>
            </div>
            <div className={styles.teamInfo}>
              <div className={styles.teamName}>{t('teamMembers.kamila')}</div>
              <div className={styles.teamRole}>{t('teamMembers.kamilaRole')}</div>
            </div>
          </div>
          <div className={styles.teamMember}>
            <div className={styles.teamPhotoWrapper}>
              <div className={styles.teamPhoto}>
                <Image
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop"
                  alt={t('teamMembers.ekaterina')}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  loading="lazy"
                />
              </div>
              <div className={styles.teamOverlay}></div>
            </div>
            <div className={styles.teamInfo}>
              <div className={styles.teamName}>{t('teamMembers.ekaterina')}</div>
              <div className={styles.teamRole}>{t('teamMembers.ekaterinaRole')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OfficeSection({ t }: { t: any }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedSpecialist, setSelectedSpecialist] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
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
                center: [55.2708, 25.2048], // Dubai office coordinates
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

                // Add office marker
                const marker = new mapboxgl.Marker({
                  color: '#e6a165',
                })
                  .setLngLat([55.2708, 25.2048])
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log({ selectedDate, selectedTime, selectedSpecialist, name, phone, message });
  };

  // Generate time slots (9 AM to 6 PM, every hour)
  const timeSlots = [];
  for (let hour = 9; hour <= 18; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  // Get specialists list (can be from API or static)
  const specialists = [
    t('leaders.artem.name'),
    t('leaders.nikita.name'),
    t('leaders.antony.name'),
    t('leaders.gulnoza.name'),
  ];

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

              <div className={styles.formField}>
                <label>{t('officeForm.specialistLabel')}</label>
                <select
                  value={selectedSpecialist}
                  onChange={(e) => setSelectedSpecialist(e.target.value)}
                >
                  <option value="">{t('officeForm.specialistPlaceholder')}</option>
                  {specialists.map((specialist) => (
                    <option key={specialist} value={specialist}>
                      {specialist}
                    </option>
                  ))}
                </select>
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
                  alt="Olexandr Logachev"
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 900px) 100vw, 40vw"
                  loading="lazy"
                />
              </div>
              <div className={styles.leadershipTag}>
                <span>CEO & Founder</span>
              </div>
            </div>
          </div>
          
          <div className={styles.leadershipInfoColumn}>
            <div className={styles.leadershipProfile}>
              <h3 className={styles.leadershipName}>Olexandr Logachev</h3>
              <p className={styles.leadershipRole}>CEO & Managing Director at ProPart Real Estate</p>
              
              <p className={styles.leadershipBio}>
                A visionary leader with a proven track record in strategic real estate development, investment, and management. Under his leadership, ProPart Real Estate has expanded its presence across key international markets, delivering innovative property solutions with a strong focus on client satisfaction, operational excellence, and long-term value creation.
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
              <h4 className={styles.experienceTitle}>Olexandr Logachev Experience</h4>
              <p className={styles.experienceDescription}>
                With over 15 years of experience in the real estate industry, Olexandr has built a reputation for excellence in property development, strategic investments, and client relations. His expertise spans across residential, commercial, and luxury property markets in Dubai and beyond.
              </p>
              <ul className={styles.experienceList}>
                <li>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Over 15 years of experience in the real estate industry</span>
                </li>
                <li>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Successfully led expansion into key international markets</span>
                </li>
                <li>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Recognized for innovative property solutions and client satisfaction excellence</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

