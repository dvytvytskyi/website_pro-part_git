'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import styles from './TrademarkRegistrationPage.module.css';

export default function TrademarkRegistrationPage() {
  const t = useTranslations('trademarkRegistration');
  const locale = useLocale();
  
  // Refs for scroll animations
  const heroRef = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);
  const processRef = useRef<HTMLDivElement>(null);
  const factsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  
  // Visibility states
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const [isBenefitsVisible, setIsBenefitsVisible] = useState(false);
  const [isProcessVisible, setIsProcessVisible] = useState(false);
  const [isFactsVisible, setIsFactsVisible] = useState(false);
  const [isContactVisible, setIsContactVisible] = useState(false);
  
  // FAQ state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    contact: '',
    trademark: '',
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
      setFormData({ name: '', company: '', contact: '', trademark: '', message: '' });
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
    observers.push(createObserver(benefitsRef, setIsBenefitsVisible) as IntersectionObserver);
    observers.push(createObserver(processRef, setIsProcessVisible) as IntersectionObserver);
    observers.push(createObserver(factsRef, setIsFactsVisible) as IntersectionObserver);
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

      {/* Block 2: Why Trademark Registration is a Business Essential */}
      <div className={styles.benefitsBlock} ref={benefitsRef}>
        <div className={styles.benefitsContainer}>
          <div className={`${styles.benefitsContent} ${isBenefitsVisible ? styles.visible : ''}`}>
            <h2 className={styles.benefitsTitle}>{t('benefits.title')}</h2>
            <p className={styles.benefitsSubtitle}>{t('benefits.subtitle')}</p>
            
            <div className={styles.benefitsGrid}>
              {['rights', 'prevent', 'value', 'foundation'].map((item) => (
                <div key={item} className={styles.benefitCard}>
                  <div className={styles.benefitIcon}>
                    {item === 'rights' && (
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {item === 'prevent' && (
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {item === 'value' && (
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 16L12 11L16 15L21 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 10V3H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {item === 'foundation' && (
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <h3 className={styles.benefitCardTitle}>{t(`benefits.${item}.title`)}</h3>
                  <p className={styles.benefitCardDescription}>{t(`benefits.${item}.description`)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Block 3: Our Streamlined 4-Step Registration Process */}
      <div className={styles.processBlock} ref={processRef}>
        <div className={styles.processContainer}>
          <div className={`${styles.processContent} ${isProcessVisible ? styles.visible : ''}`}>
            <h2 className={styles.processTitle}>{t('process.title')}</h2>
            <p className={styles.processDescription}>{t('process.description')}</p>
            
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

      {/* Block 4: Key Facts About UAE Trademark Law */}
      <div className={styles.factsBlock} ref={factsRef}>
        <div className={styles.factsContainer}>
          <div className={`${styles.factsContent} ${isFactsVisible ? styles.visible : ''}`}>
            <h2 className={styles.factsTitle}>{t('facts.title')}</h2>
            <p className={styles.factsSubtitle}>{t('facts.subtitle')}</p>
            
            <div className={styles.factsList}>
              {['national', 'governing', 'protection', 'territorial'].map((item) => (
                <div key={item} className={styles.factItem}>
                  <div className={styles.factIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className={styles.factContent}>
                    <h3 className={styles.factTitle}>{t(`facts.${item}.title`)}</h3>
                    <p className={styles.factDescription}>{t(`facts.${item}.description`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Block 5: Secure Your Brand's Future Today */}
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
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder={t('contact.form.company')}
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
                    <input
                      type="text"
                      name="trademark"
                      value={formData.trademark}
                      onChange={handleInputChange}
                      placeholder={t('contact.form.trademark')}
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

