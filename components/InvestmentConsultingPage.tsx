'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import styles from './InvestmentConsultingPage.module.css';

export default function InvestmentConsultingPage() {
  const t = useTranslations('investmentConsulting');
  const locale = useLocale();
  
  // Refs for scroll animations
  const heroRef = useRef<HTMLDivElement>(null);
  const pillarsRef = useRef<HTMLDivElement>(null);
  const advantageRef = useRef<HTMLDivElement>(null);
  const processRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  
  // Visibility states
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const [isPillarsVisible, setIsPillarsVisible] = useState(false);
  const [isAdvantageVisible, setIsAdvantageVisible] = useState(false);
  const [isProcessVisible, setIsProcessVisible] = useState(false);
  const [isContactVisible, setIsContactVisible] = useState(false);
  
  // FAQ state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: '',
    message: '',
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');
    
    // Simulate API call
    setTimeout(() => {
      setFormStatus('success');
      setFormData({ name: '', email: '', phone: '', interest: '', message: '' });
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
    observers.push(createObserver(pillarsRef, setIsPillarsVisible) as IntersectionObserver);
    observers.push(createObserver(advantageRef, setIsAdvantageVisible) as IntersectionObserver);
    observers.push(createObserver(processRef, setIsProcessVisible) as IntersectionObserver);
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

      {/* Block 2: Your Strategic Investment Pillars */}
      <div className={styles.pillarsBlock} ref={pillarsRef}>
        <div className={styles.pillarsContainer}>
          <div className={`${styles.pillarsContent} ${isPillarsVisible ? styles.visible : ''}`}>
            <h2 className={styles.pillarsTitle}>{t('pillars.title')}</h2>
            <p className={styles.pillarsDescription}>{t('pillars.description')}</p>
            
            <div className={styles.pillarsGrid}>
              {[1, 2, 3].map((num) => (
                <div key={num} className={styles.pillarCard}>
                  <div className={styles.pillarIcon}>
                    {num === 1 && (
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M5 21V7L13 2L21 7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 9V13H15V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 21V17H15V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {num === 2 && (
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 21V19C17 17.9 16.1 17 15 17H5C3.9 17 3 17.9 3 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 11C12.2 11 14 9.2 14 7C14 4.8 12.2 3 10 3C7.8 3 6 4.8 6 7C6 9.2 7.8 11 10 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M20 8V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M23 11H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {num === 3 && (
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 16L12 11L16 15L21 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 10H16V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <h3 className={styles.pillarCardTitle}>{t(`pillars.pillar${num}.title`)}</h3>
                  <p className={styles.pillarCardDescription}>{t(`pillars.pillar${num}.description`)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Block 3: The UAE Advantage */}
      <div className={styles.advantageBlock} ref={advantageRef}>
        <div className={styles.advantageContainer}>
          <div className={`${styles.advantageContent} ${isAdvantageVisible ? styles.visible : ''}`}>
            <h2 className={styles.advantageTitle}>{t('advantage.title')}</h2>
            <p className={styles.advantageSubtitle}>{t('advantage.subtitle')}</p>
            
            <div className={styles.advantageGrid}>
              {['tax', 'stability', 'governance', 'roi'].map((item) => (
                <div key={item} className={styles.advantageItem}>
                  <div className={styles.advantageIcon}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className={styles.advantageItemTitle}>{t(`advantage.${item}.title`)}</h3>
                  <p className={styles.advantageItemDescription}>{t(`advantage.${item}.description`)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Block 4: Our Advisory Process */}
      <div className={styles.processBlock} ref={processRef}>
        <div className={styles.processContainer}>
          <div className={`${styles.processContent} ${isProcessVisible ? styles.visible : ''}`}>
            <h2 className={styles.processTitle}>{t('process.title')}</h2>
            
            <div className={styles.processTimeline}>
              {[1, 2, 3, 4].map((step, index) => (
                <div key={step} className={styles.processStep}>
                  <div className={styles.processStepNumber}>{step}</div>
                  <div className={styles.processStepContent}>
                    <h3 className={styles.processStepTitle}>{t(`process.step${step}.title`)}</h3>
                    <p className={styles.processStepDescription}>{t(`process.step${step}.description`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Block 5: Connect with Our Investment Experts */}
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
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={t('contact.form.email')}
                      required
                      className={styles.formInput}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder={t('contact.form.phone')}
                      className={styles.formInput}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <select
                      name="interest"
                      value={formData.interest}
                      onChange={handleInputChange}
                      className={styles.formSelect}
                    >
                      <option value="">{t('contact.form.interest')}</option>
                      <option value="real-estate">{t('contact.form.interests.realEstate')}</option>
                      <option value="business">{t('contact.form.interests.business')}</option>
                      <option value="securities">{t('contact.form.interests.securities')}</option>
                    </select>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder={t('contact.form.message')}
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

