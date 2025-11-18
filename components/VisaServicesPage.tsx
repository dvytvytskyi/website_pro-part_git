'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import styles from './VisaServicesPage.module.css';

export default function VisaServicesPage() {
  const t = useTranslations('visaServices');
  const locale = useLocale();
  
  // Refs for scroll animations
  const heroRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  
  // Visibility states
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const [isBenefitsVisible, setIsBenefitsVisible] = useState(false);
  const [isStepsVisible, setIsStepsVisible] = useState(false);
  const [isContactVisible, setIsContactVisible] = useState(false);
  
  // FAQ state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    visaType: '',
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
      setFormData({ name: '', contact: '', visaType: '', message: '' });
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
    observers.push(createObserver(optionsRef, setIsOptionsVisible) as IntersectionObserver);
    observers.push(createObserver(benefitsRef, setIsBenefitsVisible) as IntersectionObserver);
    observers.push(createObserver(stepsRef, setIsStepsVisible) as IntersectionObserver);
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

      {/* Block 2: Explore Your Visa Options */}
      <div className={styles.optionsBlock} ref={optionsRef}>
        <div className={styles.optionsContainer}>
          <div className={`${styles.optionsContent} ${isOptionsVisible ? styles.visible : ''}`}>
            <h2 className={styles.optionsTitle}>{t('options.title')}</h2>
            <p className={styles.optionsDescription}>{t('options.description')}</p>
            
            <div className={styles.optionsGrid}>
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className={styles.optionCard}>
                  <div className={styles.optionIcon}>
                    {num === 1 && (
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {num === 2 && (
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 21V5C16 3.9 15.1 3 14 3H10C8.9 3 8 3.9 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {num === 3 && (
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 21H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 17V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {num === 4 && (
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 21V19C20 17.9 19.1 17 18 17H6C4.9 17 4 17.9 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 11C14.2 11 16 9.2 16 7C16 4.8 14.2 3 12 3C9.8 3 8 4.8 8 7C8 9.2 9.8 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <h3 className={styles.optionCardTitle}>{t(`options.card${num}.title`)}</h3>
                  <p className={styles.optionCardIdeal}>{t(`options.card${num}.ideal`)}</p>
                  <p className={styles.optionCardDescription}>{t(`options.card${num}.description`)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Block 3: The Benefits of UAE Residency */}
      <div className={styles.benefitsBlock} ref={benefitsRef}>
        <div className={styles.benefitsContainer}>
          <div className={`${styles.benefitsContent} ${isBenefitsVisible ? styles.visible : ''}`}>
            <h2 className={styles.benefitsTitle}>{t('benefits.title')}</h2>
            <p className={styles.benefitsSubtitle}>{t('benefits.subtitle')}</p>
            
            <div className={styles.benefitsList}>
              {['family', 'tax', 'banking', 'security', 'travel'].map((benefit) => (
                <div key={benefit} className={styles.benefitItem}>
                  <div className={styles.benefitIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className={styles.benefitContent}>
                    <h3 className={styles.benefitTitle}>{t(`benefits.${benefit}.title`)}</h3>
                    <p className={styles.benefitDescription}>{t(`benefits.${benefit}.description`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Block 4: Our Streamlined 4-Step Process */}
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

      {/* Block 5: Start Your UAE Journey Today */}
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
                    <select
                      name="visaType"
                      value={formData.visaType}
                      onChange={handleInputChange}
                      className={styles.formSelect}
                    >
                      <option value="">{t('contact.form.visaType')}</option>
                      <option value="golden">{t('contact.form.visaTypes.golden')}</option>
                      <option value="investor">{t('contact.form.visaTypes.investor')}</option>
                      <option value="freelance">{t('contact.form.visaTypes.freelance')}</option>
                      <option value="employee">{t('contact.form.visaTypes.employee')}</option>
                    </select>
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

