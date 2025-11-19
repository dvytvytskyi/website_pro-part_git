'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { submitFormToSheets } from '@/lib/googleSheets';
import styles from './ProjectImage.module.css';

export default function ProjectImage() {
  const t = useTranslations('projectImage');
  const locale = useLocale();
  const router = useRouter();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleReadMore = () => {
    router.push(`/${locale}/ghaff-offer`);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save form data before resetting
    const formDataToSubmit = { ...formData };
    
    // Show success message immediately
    setShowSuccess(true);
    
    // Reset form
    setFormData({ name: '', phone: '' });
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
    
    // Submit to Google Sheets in the background (don't wait for it)
    submitFormToSheets({
      formType: 'project-image-contact',
      name: formDataToSubmit.name,
      phone: formDataToSubmit.phone,
    }).catch((error) => {
      console.error('Error submitting form to Google Sheets:', error);
    });
  };

  return (
    <section className={styles.projectImage} ref={sectionRef}>
      <div 
        className={`${styles.imageWrapper} ${isVisible ? styles.visible : ''}`}
      >
        <Image
          src="/ghaf-woods-hero.jpg"
          alt="Ghaf Woods by Majid Al Futtaim"
          fill
          style={{ objectFit: 'cover' }}
          sizes="100vw"
          loading="lazy"
          unoptimized
        />
        <div className={styles.overlay}></div>
      </div>

      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.leftColumn}>
            <h2 className={styles.projectTitle}>{t('title')}</h2>
            <p className={styles.projectDescription}>{t('description')}</p>
            
            <div className={styles.features}>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6V16C3 16.5523 3.44772 17 4 17H16C16.5523 17 17 16.5523 17 16V6C17 5.44772 16.5523 5 16 5H4C3.44772 5 3 5.44772 3 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 5V3C7 2.44772 7.44772 2 8 2H12C12.5523 2 13 2.44772 13 3V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 10H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 13H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>{t('features.bedrooms')}</span>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6C4 5.44772 4.44772 5 5 5H15C15.5523 5 16 5.44772 16 6V14C16 14.5523 15.5523 15 15 15H5C4.44772 15 4 14.5523 4 14V6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 8H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="7.5" cy="11" r="0.8" fill="currentColor"/>
                    <circle cx="12.5" cy="11" r="0.8" fill="currentColor"/>
                    <path d="M10 8V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>{t('features.bathrooms')}</span>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 3C10 3 6 7 6 10C6 12.2091 7.79086 14 10 14C12.2091 14 14 12.2091 14 10C14 7 10 3 10 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 12L3 17H17L15 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 8C8 8 8.5 7.5 10 7.5C11.5 7.5 12 8 12 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    <path d="M8 10C8 10 8.5 9.5 10 9.5C11.5 9.5 12 10 12 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span>{t('features.park')}</span>
              </div>
            </div>

            <div className={styles.actions}>
              <button className={styles.readMoreButton} onClick={handleReadMore}>{t('readMore')}</button>
            </div>
          </div>

          <div className={`${styles.rightColumn} ${isVisible ? styles.visible : ''}`}>
            {showSuccess ? (
              <div className={styles.successMessage}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            ) : (
              <form className={styles.contactForm} onSubmit={handleSubmit}>
                <h3 className={styles.formTitle}>{t('form.title')}</h3>
                <p className={styles.formDescription}>{t('form.description')}</p>
                
                <input
                  type="text"
                  placeholder={t('form.name')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={styles.formInput}
                  required
                />
                <div className={styles.phoneInputWrapper}>
                  <span className={styles.phonePrefix}>+</span>
                  <input
                    type="tel"
                    placeholder={t('form.phone')}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={styles.formInput}
                    required
                  />
                </div>
                <button type="submit" className={styles.submitButton}>
                  {t('form.send')}
                </button>
                
                <p className={styles.formNote}>{t('form.note')}</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

