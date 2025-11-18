'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import styles from './AccountingServicesPage.module.css';

export default function AccountingServicesPage() {
  const t = useTranslations('accountingServices');
  const locale = useLocale();
  
  // Refs for scroll animations
  const heroRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const complianceRef = useRef<HTMLDivElement>(null);
  const processRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  
  // Visibility states
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const [isServicesVisible, setIsServicesVisible] = useState(false);
  const [isComplianceVisible, setIsComplianceVisible] = useState(false);
  const [isProcessVisible, setIsProcessVisible] = useState(false);
  const [isContactVisible, setIsContactVisible] = useState(false);
  
  // FAQ state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    contact: '',
    services: '',
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
      setFormData({ name: '', company: '', contact: '', services: '', message: '' });
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
    observers.push(createObserver(complianceRef, setIsComplianceVisible) as IntersectionObserver);
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

      {/* Block 2: Our Comprehensive Financial Services */}
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
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C5.4 2 5 2.4 5 3V21C5 21.6 5.4 22 6 22H18C18.6 22 19 21.6 19 21V7L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 2V8H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {num === 2 && (
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {num === 3 && (
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {num === 4 && (
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 9H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

      {/* Block 3: Compliance is Not Optional in the UAE */}
      <div className={styles.complianceBlock} ref={complianceRef}>
        <div className={styles.complianceContainer}>
          <div className={`${styles.complianceContent} ${isComplianceVisible ? styles.visible : ''}`}>
            <h2 className={styles.complianceTitle}>{t('compliance.title')}</h2>
            <p className={styles.complianceSubtitle}>{t('compliance.subtitle')}</p>
            
            <div className={styles.complianceList}>
              {['fines', 'license', 'investor', 'compliance'].map((item) => (
                <div key={item} className={styles.complianceItem}>
                  <div className={styles.complianceIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className={styles.complianceContent}>
                    <h3 className={styles.complianceItemTitle}>{t(`compliance.${item}.title`)}</h3>
                    <p className={styles.complianceItemDescription}>{t(`compliance.${item}.description`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Block 4: Our Transparent & Simple Process */}
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

      {/* Block 5: Achieve Financial Clarity and Control */}
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
                    <select
                      name="services"
                      value={formData.services}
                      onChange={handleInputChange}
                      className={styles.formSelect}
                    >
                      <option value="">{t('contact.form.services')}</option>
                      <option value="bookkeeping">{t('contact.form.serviceTypes.bookkeeping')}</option>
                      <option value="tax">{t('contact.form.serviceTypes.tax')}</option>
                      <option value="compliance">{t('contact.form.serviceTypes.compliance')}</option>
                      <option value="payroll">{t('contact.form.serviceTypes.payroll')}</option>
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

