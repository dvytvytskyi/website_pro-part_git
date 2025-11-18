'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import styles from './BusinessRegistrationPage.module.css';

export default function BusinessRegistrationPage() {
  const t = useTranslations('businessRegistration');
  const locale = useLocale();
  
  // Refs for scroll animations
  const heroRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  
  // Visibility states
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const [isServicesVisible, setIsServicesVisible] = useState(false);
  const [isComparisonVisible, setIsComparisonVisible] = useState(false);
  const [isStepsVisible, setIsStepsVisible] = useState(false);
  const [isTrustVisible, setIsTrustVisible] = useState(false);
  const [isContactVisible, setIsContactVisible] = useState(false);
  
  // FAQ state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    message: '',
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');
    
    // Simulate API call
    setTimeout(() => {
      setFormStatus('success');
      setFormData({ name: '', contact: '', message: '' });
      setTimeout(() => setFormStatus('idle'), 3000);
    }, 1000);
  };

  // Intersection Observers for scroll animations
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    const createObserver = (ref: React.RefObject<HTMLDivElement>, setVisible: (val: boolean) => void) => {
      if (!ref.current) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true);
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(ref.current);
      return observer;
    };

    observers.push(createObserver(heroRef, setIsHeroVisible) as IntersectionObserver);
    observers.push(createObserver(servicesRef, setIsServicesVisible) as IntersectionObserver);
    observers.push(createObserver(comparisonRef, setIsComparisonVisible) as IntersectionObserver);
    observers.push(createObserver(stepsRef, setIsStepsVisible) as IntersectionObserver);
    observers.push(createObserver(trustRef, setIsTrustVisible) as IntersectionObserver);
    observers.push(createObserver(contactRef, setIsContactVisible) as IntersectionObserver);

    setIsHeroVisible(true);

    return () => {
      observers.forEach(obs => obs?.disconnect());
    };
  }, []);

  return (
    <div className={styles.page}>
      {/* Block 1: Hero Section */}
      <div className={styles.hero} ref={heroRef}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContainer}>
          <div className={`${styles.heroContent} ${isHeroVisible ? styles.visible : ''}`}>
            <h1 className={styles.heroTitle}>{t('hero.title')}</h1>
            <p className={styles.heroSubtitle}>{t('hero.subtitle')}</p>
            <a href="#contact" className={styles.heroCTA}>
              {t('hero.cta')}
            </a>
          </div>
        </div>
      </div>

      {/* Block 2: All-in-One Partner */}
      <div className={styles.servicesBlock} ref={servicesRef}>
        <div className={styles.servicesContainer}>
          <div className={`${styles.servicesContent} ${isServicesVisible ? styles.visible : ''}`}>
            <h2 className={styles.servicesTitle}>{t('services.title')}</h2>
            <p className={styles.servicesDescription}>{t('services.description')}</p>
            
            <div className={styles.servicesGrid}>
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className={styles.serviceCard}>
                  <div className={styles.serviceIcon}>
                    {num === 1 && (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M5 21V7L13 2L21 7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 9V13H15V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {num === 2 && (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C5.4 2 5 2.4 5 3V21C5 21.6 5.4 22 6 22H18C18.6 22 19 21.6 19 21V7L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {num === 3 && (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 16V6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V16C2 17.1 2.9 18 4 18H20C21.1 18 22 17.1 22 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 10H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {num === 4 && (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 21V19C20 17.9 19.1 17 18 17H6C4.9 17 4 17.9 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 11C14.2 11 16 9.2 16 7C16 4.8 14.2 3 12 3C9.8 3 8 4.8 8 7C8 9.2 9.8 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <h3 className={styles.serviceCardTitle}>{t(`services.card${num}.title`)}</h3>
                  <p className={styles.serviceCardDescription}>{t(`services.card${num}.description`)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Block 3: Free Zone vs. Mainland */}
      <div className={styles.comparisonBlock} ref={comparisonRef}>
        <div className={styles.comparisonContainer}>
          <div className={`${styles.comparisonContent} ${isComparisonVisible ? styles.visible : ''}`}>
            <h2 className={styles.comparisonTitle}>{t('comparison.title')}</h2>
            <p className={styles.comparisonDescription}>{t('comparison.description')}</p>
            
            <div className={styles.comparisonTable}>
              <div className={styles.tableHeader}>
                <div className={styles.tableHeaderCell}>{t('comparison.feature')}</div>
                <div className={styles.tableHeaderCell}>{t('comparison.freeZone')}</div>
                <div className={styles.tableHeaderCell}>{t('comparison.mainland')}</div>
              </div>
              
              {['ownership', 'scope', 'tax', 'vat', 'office', 'contracts'].map((feature, index) => (
                <div key={feature} className={styles.tableRow}>
                  <div className={styles.tableCellLabel}>{t(`comparison.features.${feature}.label`)}</div>
                  <div className={styles.tableCell}>
                    {t(`comparison.features.${feature}.freeZone`)}
                  </div>
                  <div className={styles.tableCell}>
                    {t(`comparison.features.${feature}.mainland`)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Block 4: 4 Simple Steps */}
      <div className={styles.stepsBlock} ref={stepsRef}>
        <div className={styles.stepsContainer}>
          <div className={`${styles.stepsContent} ${isStepsVisible ? styles.visible : ''}`}>
            <h2 className={styles.stepsTitle}>{t('steps.title')}</h2>
            
            <div className={styles.stepsTimeline}>
              {[1, 2, 3, 4].map((step, index) => (
                <div key={step} className={styles.stepItem}>
                  <div className={styles.stepNumber}>{step}</div>
                  <div className={styles.stepContent}>
                    <h3 className={styles.stepTitle}>{t(`steps.step${step}.title`)}</h3>
                    <p className={styles.stepDescription}>{t(`steps.step${step}.description`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Block 5: Why Trust Us */}
      <div className={styles.trustBlock} ref={trustRef}>
        <div className={styles.trustContainer}>
          <div className={`${styles.trustContent} ${isTrustVisible ? styles.visible : ''}`}>
            <h2 className={styles.trustTitle}>{t('trust.title')}</h2>
            
            <div className={styles.trustStats}>
              <div className={styles.trustStat}>
                <div className={styles.trustStatNumber}>20+</div>
                <div className={styles.trustStatLabel}>{t('trust.stat1')}</div>
              </div>
              <div className={styles.trustStat}>
                <div className={styles.trustStatNumber}>90%</div>
                <div className={styles.trustStatLabel}>{t('trust.stat2')}</div>
              </div>
            </div>
            
            <div className={styles.trustFeatures}>
              {['pricing', 'expertise', 'speed', 'service'].map((feature) => (
                <div key={feature} className={styles.trustFeature}>
                  <div className={styles.trustFeatureIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className={styles.trustFeatureContent}>
                    <h3 className={styles.trustFeatureTitle}>{t(`trust.features.${feature}.title`)}</h3>
                    <p className={styles.trustFeatureDescription}>{t(`trust.features.${feature}.description`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Block 6: Contact Form + FAQ */}
      <div id="contact" className={styles.contactBlock} ref={contactRef}>
        <div className={styles.contactContainer}>
          <div className={`${styles.contactContent} ${isContactVisible ? styles.visible : ''}`}>
            <h2 className={styles.contactTitle}>{t('contact.title')}</h2>
            <p className={styles.contactDescription}>{t('contact.description')}</p>
            
            <div className={styles.contactLayout}>
              {/* Left Column - Form */}
              <div className={styles.contactFormColumn}>
                <form className={styles.contactForm} onSubmit={handleSubmit}>
                  <div className={styles.formGroup}>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={t('contact.form.name')}
                      required
                      className={styles.formInput}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <input
                      type="text"
                      name="contact"
                      value={formData.contact}
                      onChange={handleInputChange}
                      placeholder={t('contact.form.contact')}
                      required
                      className={styles.formInput}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder={t('contact.form.message')}
                      required
                      rows={4}
                      className={styles.formTextarea}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={formStatus === 'sending'}
                    className={styles.formSubmit}
                  >
                    {formStatus === 'sending' 
                      ? t('contact.form.sending')
                      : t('contact.form.submit')
                    }
                  </button>
                  
                  {formStatus === 'success' && (
                    <div className={styles.formMessage + ' ' + styles.formSuccess}>
                      {t('contact.form.success')}
                    </div>
                  )}
                  
                  {formStatus === 'error' && (
                    <div className={styles.formMessage + ' ' + styles.formError}>
                      {t('contact.form.error')}
                    </div>
                  )}
                </form>
              </div>
              
              {/* Right Column - FAQ */}
              <div className={styles.contactFaqColumn}>
                <div className={styles.faqList}>
                  {['q1', 'q2', 'q3'].map((qKey, index) => (
                    <div key={qKey} className={styles.faqItem}>
                      <button
                        className={`${styles.faqQuestion} ${openFaqIndex === index ? styles.open : ''}`}
                        onClick={() => toggleFaq(index)}
                        type="button"
                      >
                        <span className={styles.faqQuestionText}>
                          {t(`contact.faq.${qKey}.question`)}
                        </span>
                        <svg
                          className={styles.faqIcon}
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
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
                      <div
                        className={`${styles.faqAnswer} ${openFaqIndex === index ? styles.open : ''}`}
                      >
                        <p>{t(`contact.faq.${qKey}.answer`)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

