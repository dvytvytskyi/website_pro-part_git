'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { submitFormToSheets } from '@/lib/googleSheets';
import styles from './GhafWoodsLanding.module.css';

export default function GhafWoodsLanding() {
  const t = useTranslations('ghafWoods');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    message: '',
  });

  const [modalData, setModalData] = useState({
    isOpen: false,
    type: '', // 'register', 'payment-plan', 'brochure', 'submit'
    name: '',
    phone: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showModalSuccess, setShowModalSuccess] = useState(false);

  const galleryImages = [
    '/ghaf-woods-1.jpg',
    '/ghaf-woods-2.jpg',
    '/ghaf-woods-3.jpg',
    '/ghaf-woods-4.jpg',
    '/ghaf-woods-5.jpg',
    '/ghaf-woods-6.jpg',
    '/ghaf-woods-7.jpg',
    '/ghaf-woods-8.jpg',
    '/ghaf-woods-9.jpg',
    '/ghaf-woods-10.jpg',
    '/ghaf-woods-11.jpg',
    '/ghaf-woods-12.jpg',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show success message immediately
    setShowSuccess(true);
    
    // Save form data before resetting
    const formDataToSubmit = { ...formData };
    
    // Reset form
    setFormData({ name: '', email: '', phone: '', country: '', message: '' });
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
    
    // Submit to Google Sheets in the background (don't wait for it)
    submitFormToSheets({
      formType: 'ghaf-woods-contact',
      name: formDataToSubmit.name,
      email: formDataToSubmit.email,
      phone: formDataToSubmit.phone,
      message: formDataToSubmit.message,
      additionalData: {
        country: formDataToSubmit.country,
      },
    }).catch((error) => {
      console.error('Error submitting form to Google Sheets:', error);
    });
  };

  const openModal = (type: string) => {
    setModalData({
      isOpen: true,
      type,
      name: '',
      phone: '',
    });
  };

  const closeModal = () => {
    setModalData({
      isOpen: false,
      type: '',
      name: '',
      phone: '',
    });
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show success message immediately
    setShowModalSuccess(true);
    
    // Save form data before resetting
    const modalDataToSubmit = {
      name: modalData.name,
      phone: modalData.phone,
      type: modalData.type,
    };
    
    // Reset modal form
    setModalData({ ...modalData, name: '', phone: '' });
    
    // Close modal after 3 seconds
    setTimeout(() => {
      setShowModalSuccess(false);
      closeModal();
    }, 3000);
    
    // Submit to Google Sheets in the background (don't wait for it)
    submitFormToSheets({
      formType: `ghaf-woods-${modalDataToSubmit.type}`,
      name: modalDataToSubmit.name,
      phone: modalDataToSubmit.phone,
      additionalData: {
        modalType: modalDataToSubmit.type,
      },
    }).catch((error) => {
      console.error('Error submitting form to Google Sheets:', error);
    });
  };

  const getModalTitle = () => {
    switch (modalData.type) {
      case 'register':
        return t('modal.register.title');
      case 'payment-plan':
        return t('modal.paymentPlan.title');
      case 'brochure':
        return t('modal.brochure.title');
      case 'submit':
        return t('modal.submit.title');
      default:
        return t('contact.label');
    }
  };

  const getModalDescription = () => {
    switch (modalData.type) {
      case 'register':
        return t('modal.register.description');
      case 'payment-plan':
        return t('modal.paymentPlan.description');
      case 'brochure':
        return t('modal.brochure.description');
      case 'submit':
        return t('modal.submit.description');
      default:
        return t('modal.register.description');
    }
  };

  return (
    <div className={styles.landing}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroImageWrapper}>
          <Image
            src="/ghaf-woods-hero.jpg"
            alt="Ghaf Woods by Majid Al Futtaim"
            fill
            style={{ objectFit: 'cover' }}
            sizes="100vw"
            priority
            unoptimized
          />
          <div className={styles.heroOverlay}></div>
        </div>
        <div className={styles.heroContent}>
          <div className={styles.container}>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>{t('hero.title')}</h1>
              <p className={styles.heroSubtitle}>{t('hero.subtitle')}</p>
              <button className={styles.ctaButton} onClick={() => openModal('register')}>
                {t('hero.cta')}
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className={styles.heroFeatures}>
              <div className={styles.featureBox}>
                <div className={styles.featureBoxDark}>
                  <p className={styles.featureText}>{t('hero.features.bedrooms')}</p>
                  <p className={styles.featureSubtext}>{t('hero.features.apartments')}</p>
                  <p className={styles.featureBadge}>{t('hero.features.badge')}</p>
                </div>
                <div className={styles.featureBoxLight}>
                  <p className={styles.featureNumber}>60/40</p>
                  <p className={styles.featureLabel}>{t('hero.features.paymentPlan')}</p>
                  <p className={styles.featureLabel}>{t('hero.features.startingPrice')}</p>
                  <p className={styles.featureLabel}>{t('hero.features.uponRequest')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className={styles.aboutSection}>
        <div className={styles.container}>
          <div className={styles.aboutContent}>
            <div className={styles.aboutLeft}>
              <span className={styles.sectionLabel}>{t('about.label')}</span>
              <h2 className={styles.sectionTitle}>{t('about.title')}</h2>
            </div>
            <div className={styles.aboutRight}>
              <p className={styles.aboutDescription}>
                {t('about.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.container}>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <h3 className={styles.featureCardTitle}>{t('features.title1')}</h3>
              <p className={styles.featureCardDescription}>
                {t('features.description1')}
              </p>
            </div>
            <div className={styles.featureCard}>
              <h3 className={styles.featureCardTitle}>{t('features.title2')}</h3>
              <p className={styles.featureCardDescription}>
                {t('features.description2')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className={styles.gallerySection}>
        <div className={styles.container}>
          <div className={styles.galleryHeader}>
            <span className={styles.sectionLabel}>{t('gallery.label')}</span>
            <h2 className={styles.galleryTitle}>{t('gallery.title')}</h2>
            <p className={styles.galleryDescription}>
              {t('gallery.description')}
            </p>
          </div>
          <div className={styles.galleryGrid}>
            {galleryImages.map((image, index) => (
              <div key={index} className={styles.galleryItem}>
                <Image
                  src={image}
                  alt={`${t('gallery.imageAlt')} ${index + 1}`}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className={styles.amenitiesSection}>
        <div className={styles.container}>
          <div className={styles.amenitiesHeader}>
            <h2 className={styles.amenitiesTitle}>{t('amenities.title')}</h2>
            <p className={styles.amenitiesDescription}>
              {t('amenities.description')}
            </p>
          </div>
          <div className={styles.amenitiesGrid}>
            <div className={styles.amenityCard}>
              <div className={styles.amenityIcon}>✓</div>
              <h4 className={styles.amenityTitle}>{t('amenities.items.pools')}</h4>
            </div>
            <div className={styles.amenityCard}>
              <div className={styles.amenityIcon}>✓</div>
              <h4 className={styles.amenityTitle}>{t('amenities.items.trails')}</h4>
            </div>
            <div className={`${styles.amenityCard} ${styles.amenityCardHighlighted}`}>
              <div className={styles.amenityIcon}>✓</div>
              <h4 className={styles.amenityTitle}>{t('amenities.items.retail')}</h4>
            </div>
            <div className={styles.amenityCard}>
              <div className={styles.amenityIcon}>✓</div>
              <h4 className={styles.amenityTitle}>{t('amenities.items.wellness')}</h4>
            </div>
            <div className={styles.amenityCard}>
              <div className={styles.amenityIcon}>✓</div>
              <h4 className={styles.amenityTitle}>{t('amenities.items.walkways')}</h4>
            </div>
            <div className={styles.amenityCard}>
              <div className={styles.amenityIcon}>✓</div>
              <h4 className={styles.amenityTitle}>{t('amenities.items.center')}</h4>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Plan Section */}
      <section className={styles.paymentSection}>
        <div className={styles.container}>
          <div className={styles.paymentContent}>
            <div className={styles.paymentLeft}>
              <span className={styles.sectionLabel}>{t('payment.label')}</span>
              <h2 className={styles.paymentTitle}>{t('payment.title')}</h2>
              <p className={styles.paymentDescription}>
                {t('payment.description')}
              </p>
              <div className={styles.paymentButtons}>
                <button className={styles.downloadButton} onClick={() => openModal('payment-plan')}>{t('payment.downloadPlan')}</button>
                <button className={styles.downloadButtonOutline} onClick={() => openModal('brochure')}>{t('payment.downloadBrochure')}</button>
              </div>
            </div>
            <div className={styles.paymentRight}>
              <div className={styles.paymentBlock}>
                <div className={styles.paymentNumber}>{t('payment.downPayment.percent')}</div>
                <h3 className={styles.paymentBlockTitle}>{t('payment.downPayment.title')}</h3>
                <p className={styles.paymentBlockDescription}>{t('payment.downPayment.description')}</p>
              </div>
              <div className={styles.paymentBlock}>
                <div className={styles.paymentNumber}>{t('payment.construction.percent')}</div>
                <h3 className={styles.paymentBlockTitle}>{t('payment.construction.title')}</h3>
                <p className={styles.paymentBlockDescription}>{t('payment.construction.description')}</p>
              </div>
              <div className={styles.paymentBlock}>
                <div className={styles.paymentNumber}>{t('payment.handover.percent')}</div>
                <h3 className={styles.paymentBlockTitle}>{t('payment.handover.title')}</h3>
                <p className={styles.paymentBlockDescription}>{t('payment.handover.description')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className={styles.contactSection}>
        <div className={styles.container}>
          <div className={styles.contactContent}>
            <div className={styles.contactLeft}>
              <Image
                src="/ghaf-woods-hero.jpg"
                alt="Contact"
                width={500}
                height={600}
                style={{ objectFit: 'cover', borderRadius: '12px' }}
                unoptimized
              />
            </div>
            <div className={styles.contactRight}>
              <span className={styles.sectionLabel}>{t('contact.label')}</span>
              <h2 className={styles.contactTitle}>{t('contact.title')}</h2>
              {showSuccess ? (
                <div className={styles.successMessage}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p>{t('contact.success')}</p>
                </div>
              ) : (
                <form className={styles.contactForm} onSubmit={handleSubmit}>
                <div className={styles.formHeader}>
                  <span>{t('contact.form.header')}</span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 17.5L17.5 2.5M17.5 2.5H7.5M17.5 2.5V12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder={t('contact.form.name')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={styles.formInput}
                  required
                />
                <input
                  type="email"
                  placeholder={t('contact.form.email')}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={styles.formInput}
                  required
                />
                <input
                  type="tel"
                  placeholder={t('contact.form.phone')}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={styles.formInput}
                  required
                />
                <input
                  type="text"
                  placeholder={t('contact.form.country')}
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className={styles.formInput}
                  required
                />
                <textarea
                  placeholder={t('contact.form.message')}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className={styles.formTextarea}
                  rows={4}
                  required
                />
                <button type="submit" className={styles.submitButton}>
                  {t('contact.form.submit')}
                </button>
              </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {modalData.isOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeModal}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h2 className={styles.modalTitle}>{getModalTitle()}</h2>
            {showModalSuccess ? (
              <div className={styles.modalSuccessMessage}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p>{t('contact.success')}</p>
              </div>
            ) : (
              <>
                <p className={styles.modalDescription}>
                  {getModalDescription()}
                </p>
                <form className={styles.modalForm} onSubmit={handleModalSubmit}>
              <input
                type="text"
                placeholder={modalData.type === 'register' ? t('modal.register.name') : modalData.type === 'payment-plan' ? t('modal.paymentPlan.name') : modalData.type === 'brochure' ? t('modal.brochure.name') : t('modal.submit.name')}
                value={modalData.name}
                onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                className={styles.modalInput}
                required
              />
              <div className={styles.phoneInputWrapper}>
                <span className={styles.phonePrefix}>+</span>
                <input
                  type="tel"
                  placeholder={modalData.type === 'register' ? t('modal.register.phone') : modalData.type === 'payment-plan' ? t('modal.paymentPlan.phone') : modalData.type === 'brochure' ? t('modal.brochure.phone') : t('modal.submit.phone')}
                  value={modalData.phone}
                  onChange={(e) => setModalData({ ...modalData, phone: e.target.value })}
                  className={styles.modalInput}
                  required
                />
              </div>
              <button type="submit" className={styles.modalSubmitButton}>
                {modalData.type === 'register' ? t('modal.register.submit') : modalData.type === 'payment-plan' ? t('modal.paymentPlan.submit') : modalData.type === 'brochure' ? t('modal.brochure.submit') : t('modal.submit.submit')}
              </button>
            </form>
            </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

