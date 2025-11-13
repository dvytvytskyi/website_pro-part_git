'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import styles from './AboutUs.module.css';

export default function AboutUs() {
  const t = useTranslations('aboutUs');
  const locale = useLocale();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.2 }
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

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  return (
    <section className={styles.aboutUs} ref={sectionRef}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.textColumn}>
            <div className={styles.header}>
              <span className={styles.headerText}>{t('header')}</span>
            </div>

            <h2 className={`${styles.title} ${isVisible ? styles.fadeIn : ''}`}>
              {t('title')}
            </h2>

            <p className={`${styles.description} ${isVisible ? styles.fadeIn : ''}`}>
              {t('description1')}
            </p>

            <p className={`${styles.description} ${isVisible ? styles.fadeIn : ''}`}>
              {t('description2')}
            </p>

            <div className={styles.buttonsRow}>
              <Link 
                href={getLocalizedPath('/about')}
                className={`${styles.ctaButton} ${styles.primaryButton} ${isVisible ? styles.fadeIn : ''}`}
              >
                {t('cta')}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link 
                href={getLocalizedPath('/properties')}
                className={`${styles.ctaButton} ${styles.secondaryButton} ${isVisible ? styles.fadeIn : ''}`}
              >
                View Properties
              </Link>
            </div>

            <div className={styles.statsRow}>
              <div className={`${styles.statCard} ${isVisible ? styles.fadeInUp : ''}`}>
                <div className={styles.statValue}>100%</div>
                <div className={styles.statLabel}>{t('stat1')}</div>
              </div>
              <div className={`${styles.statCard} ${isVisible ? styles.fadeInUp : ''}`}>
                <div className={styles.statValue}>12+</div>
                <div className={styles.statLabel}>{t('stat2')}</div>
              </div>
              <div className={`${styles.statCard} ${isVisible ? styles.fadeInUp : ''}`}>
                <div className={styles.statValue}>500+</div>
                <div className={styles.statLabel}>Premium Properties</div>
              </div>
            </div>
          </div>

          <div className={styles.visualColumn}>
            <div className={styles.portraitWrapper}>
              <div className={`${styles.portraitImage} ${isVisible ? styles.revealImage : ''}`}>
                <Image
                  src="https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=1000&fit=crop"
                  alt={t('image1Alt')}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 900px) 100vw, 40vw"
                  loading="lazy"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


