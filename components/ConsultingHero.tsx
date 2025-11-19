'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { submitFormToSheets } from '@/lib/googleSheets';
import styles from './ConsultingHero.module.css';

export default function ConsultingHero() {
  const t = useTranslations('consulting');
  const locale = useLocale();
  const heroRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  const formatAnimatedValue = (value: number, original: string): string => {
    if (original.includes('%')) {
      return `${Math.round(value)}%`;
    }
    if (original.includes('+')) {
      return `${Math.round(value)}+`;
    }
    if (original.includes('$')) {
      const suffix = original.replace(/[\d.$]/g, '');
      return `$${Math.round(value)}${suffix}`;
    }
    if (original.includes('m') && !original.includes('$')) {
      return `${Math.round(value)}m`;
    }
    return Math.round(value).toString();
  };

  const getServiceIcon = (id: string) => {
    const icons: { [key: string]: JSX.Element } = {
      'business-registration': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 21V7L13 2L21 7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 9V13H15V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 21V17H15V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      'visa-services': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 16V6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V16C2 17.1 2.9 18 4 18H20C21.1 18 22 17.1 22 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 10H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 14H7.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      'legal-support': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C5.4 2 5 2.4 5 3V21C5 21.6 5.4 22 6 22H18C18.6 22 19 21.6 19 21V7L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 2V8H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      'investment-consulting': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      'accounting-services': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 9H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      'employment': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 21V19C20 17.9 19.1 17 18 17H6C4.9 17 4 17.9 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 11C14.2 11 16 9.2 16 7C16 4.8 14.2 3 12 3C9.8 3 8 4.8 8 7C8 9.2 9.8 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      'trademark-registration': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      'power-of-attorney': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C5.4 2 5 2.4 5 3V21C5 21.6 5.4 22 6 22H18C18.6 22 19 21.6 19 21V7L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 2V8H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 18H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    };
    return icons[id] || icons['business-registration'];
  };

  const services = [
    { id: 'business-registration' },
    { id: 'visa-services' },
    { id: 'legal-support' },
    { id: 'investment-consulting' },
    { id: 'accounting-services' },
    { id: 'employment' },
    { id: 'trademark-registration' },
    { id: 'power-of-attorney' },
  ];

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

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, []);

  const [isStatsVisible, setIsStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [animatedValues, setAnimatedValues] = useState({
    stat1: 0,
    stat2: 0,
    stat3: 0,
    stat4: 0,
  });

  const [isAdvantagesVisible, setIsAdvantagesVisible] = useState(false);
  const advantagesRef = useRef<HTMLDivElement>(null);

  const [isServicesBlockVisible, setIsServicesBlockVisible] = useState(false);
  const servicesBlockRef = useRef<HTMLDivElement>(null);

  const [isProcessBlockVisible, setIsProcessBlockVisible] = useState(false);
  const processBlockRef = useRef<HTMLDivElement>(null);

  const [isSuccessBlockVisible, setIsSuccessBlockVisible] = useState(false);
  const successBlockRef = useRef<HTMLDivElement>(null);

  const [isContactBlockVisible, setIsContactBlockVisible] = useState(false);
  const contactBlockRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [isFaqBlockVisible, setIsFaqBlockVisible] = useState(false);
  const faqBlockRef = useRef<HTMLDivElement>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    message: '',
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsStatsVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isStatsVisible) return;

    const parseValue = (value: string): number => {
      if (value.includes('%')) {
        return parseFloat(value.replace('%', ''));
      }
      if (value.includes('+')) {
        return parseFloat(value.replace('+', ''));
      }
      if (value.includes('$')) {
        const numStr = value.replace(/[^0-9.]/g, '');
        return parseFloat(numStr) || 0;
      }
      if (value.includes('m')) {
        const numStr = value.replace(/[^0-9.]/g, '');
        return parseFloat(numStr) || 0;
      }
      return parseFloat(value) || 0;
    };

    const getSuffix = (value: string): string => {
      if (value.includes('%')) return '%';
      if (value.includes('+')) return '+';
      if (value.includes('$')) return value.replace(/[0-9.]/g, '');
      if (value.includes('m')) return value.replace(/[0-9.]/g, '');
      return '';
    };

    const stat1Value = t('stat1.number');
    const stat2Value = t('stat2.number');
    const stat3Value = t('stat3.number');
    const stat4Value = t('stat4.number');

    const targets = {
      stat1: parseValue(stat1Value),
      stat2: parseValue(stat2Value),
      stat3: parseValue(stat3Value),
      stat4: parseValue(stat4Value),
    };

    const duration = 2000; // 2 seconds
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedValues({
        stat1: targets.stat1 * easeOut,
        stat2: targets.stat2 * easeOut,
        stat3: targets.stat3 * easeOut,
        stat4: targets.stat4 * easeOut,
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimatedValues(targets);
      }
    };

    const animationFrame = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isStatsVisible, t]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsAdvantagesVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (advantagesRef.current) {
      observer.observe(advantagesRef.current);
    }

    return () => {
      if (advantagesRef.current) {
        observer.unobserve(advantagesRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsServicesBlockVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (servicesBlockRef.current) {
      observer.observe(servicesBlockRef.current);
    }

    return () => {
      if (servicesBlockRef.current) {
        observer.unobserve(servicesBlockRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsProcessBlockVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (processBlockRef.current) {
      observer.observe(processBlockRef.current);
    }

    return () => {
      if (processBlockRef.current) {
        observer.unobserve(processBlockRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsSuccessBlockVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (successBlockRef.current) {
      observer.observe(successBlockRef.current);
    }

    return () => {
      if (successBlockRef.current) {
        observer.unobserve(successBlockRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsContactBlockVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (contactBlockRef.current) {
      observer.observe(contactBlockRef.current);
    }

    return () => {
      if (contactBlockRef.current) {
        observer.unobserve(contactBlockRef.current);
      }
    };
  }, []);

  // Lazy load Mapbox only when map container becomes visible
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !mapRef.current) {
            const loadMapbox = async () => {
              try {
                // Import Mapbox CSS
                await import('mapbox-gl/dist/mapbox-gl.css');
                
                const mapboxgl = (await import('mapbox-gl')).default;
                const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

                if (!token) {
                  console.error('❌ Mapbox token is not set. Please set NEXT_PUBLIC_MAPBOX_TOKEN environment variable.');
                  if (mapContainerRef.current) {
                    mapContainerRef.current.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; font-size: 14px;">Map unavailable: Mapbox token not configured</div>';
                  }
                  return;
                }

                if (!mapContainerRef.current) {
                  console.error('❌ Map container not found');
                  return;
                }

                mapboxgl.accessToken = token;

                const map = new mapboxgl.Map({
                  container: mapContainerRef.current,
                  style: 'mapbox://styles/abiespana/cmcxiep98004r01quhxspf3w9',
                  center: [55.2708, 25.2048], // Dubai office coordinates
                  zoom: 15,
                  interactive: true,
                  maxZoom: 18,
                  minZoom: 10,
                  maxBounds: [
                    [54.0, 24.0],
                    [56.0, 26.0],
                  ],
                });

                map.on('load', () => {
                  console.log('✅ Mapbox map loaded successfully');
                  map.addControl(new mapboxgl.NavigationControl(), 'top-right');

                  const marker = new mapboxgl.Marker({
                    color: '#e6a165',
                  })
                    .setLngLat([55.2708, 25.2048])
                    .addTo(map);

                  markerRef.current = marker;
                });

                map.on('error', (e: any) => {
                  console.error('❌ Mapbox error:', e);
                  if (mapContainerRef.current) {
                    mapContainerRef.current.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; font-size: 14px;">Map failed to load</div>';
                  }
                });

                mapRef.current = map;
              } catch (error) {
                console.error('❌ Failed to load Mapbox:', error);
                if (mapContainerRef.current) {
                  mapContainerRef.current.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; font-size: 14px;">Map failed to load</div>';
                }
              }
            };

            loadMapbox();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(mapContainerRef.current);

    return () => {
      observer.disconnect();
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsFaqBlockVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (faqBlockRef.current) {
      observer.observe(faqBlockRef.current);
    }

    return () => {
      if (faqBlockRef.current) {
        observer.unobserve(faqBlockRef.current);
      }
    };
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save form data before resetting
    const formDataToSubmit = {
      name: formData.name,
      contact: formData.contact,
      message: formData.message,
    };
    
    // Show success message immediately
    setFormStatus('success');
    setFormData({ name: '', contact: '', message: '' });
    
    // Reset success message after 5 seconds
    setTimeout(() => {
      setFormStatus('idle');
    }, 5000);
    
    // Submit to Google Sheets in the background (don't wait for it)
    submitFormToSheets({
      formType: 'consulting-contact',
      name: formDataToSubmit.name,
      email: formDataToSubmit.contact.includes('@') ? formDataToSubmit.contact : '',
      phone: formDataToSubmit.contact.includes('@') ? '' : formDataToSubmit.contact,
      message: formDataToSubmit.message,
    }).catch((error) => {
      console.error('Error submitting form to Google Sheets:', error);
    });
  };

  const getProcessStepIcon = (step: number) => {
    const icons: { [key: number]: JSX.Element } = {
      1: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 8V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7.5 7.5L4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16.5 7.5L20 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      2: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C5.4 2 5 2.4 5 3V21C5 21.6 5.4 22 6 22H18C18.6 22 19 21.6 19 21V7L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 2V8H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      3: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 21V7L13 2L21 7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 9V13H15V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 21V17H15V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      4: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 16V6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V16C2 17.1 2.9 18 4 18H20C21.1 18 22 17.1 22 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 10H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 14H7.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    };
    return icons[step] || icons[1];
  };

  const getServiceBlockIcon = (id: number) => {
    const icons: { [key: number]: JSX.Element } = {
      1: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 21V7L13 2L21 7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 9V13H15V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 21V17H15V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      2: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 16V6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V16C2 17.1 2.9 18 4 18H20C21.1 18 22 17.1 22 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 10H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 14H7.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      3: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C5.4 2 5 2.4 5 3V21C5 21.6 5.4 22 6 22H18C18.6 22 19 21.6 19 21V7L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 2V8H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      4: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 9H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      5: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      6: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 21V19C20 17.9 19.1 17 18 17H6C4.9 17 4 17.9 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 11C14.2 11 16 9.2 16 7C16 4.8 14.2 3 12 3C9.8 3 8 4.8 8 7C8 9.2 9.8 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    };
    return icons[id] || icons[1];
  };

  return (
    <>
      <div className={styles.hero} ref={heroRef}>
        <div className={styles.container}>
          <div className={`${styles.content} ${isVisible ? styles.visible : ''}`}>
            <h1 className={styles.title}>{t('heroTitle')}</h1>
            <p className={styles.description}>{t('heroDescription')}</p>
          </div>
          
          <div className={`${styles.servicesGrid} ${isVisible ? styles.visible : ''}`}>
            {services.map((service) => (
              <Link
                key={service.id}
                href={getLocalizedPath(`/consulting/services/${service.id}`)}
                className={styles.serviceCard}
              >
                <div className={styles.serviceHeader}>
                  <div className={styles.serviceIcon}>{getServiceIcon(service.id)}</div>
                  <h3 className={styles.serviceTitle}>{t(`services.${service.id}.title`)}</h3>
                </div>
                <div className={styles.serviceContent}>
                  <p className={styles.serviceDescription}>{t(`services.${service.id}.description`)}</p>
                  <svg className={styles.serviceArrow} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Info Block Section */}
      <div className={styles.infoBlock} ref={statsRef}>
        <div className={styles.infoContainer}>
          {/* Text Block */}
          <div className={`${styles.textBlock} ${isStatsVisible ? styles.visible : ''}`}>
            <p className={styles.textContent}>{t('infoText')}</p>
          </div>

          {/* Statistics Section */}
          <div className={`${styles.statsSection} ${isStatsVisible ? styles.visible : ''}`}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>
                {formatAnimatedValue(animatedValues.stat1, t('stat1.number'))}
              </div>
              <div className={styles.statLabel}>{t('stat1.label')}</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>
                {formatAnimatedValue(animatedValues.stat2, t('stat2.number'))}
              </div>
              <div className={styles.statLabel}>{t('stat2.label')}</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>
                {formatAnimatedValue(animatedValues.stat3, t('stat3.number'))}
              </div>
              <div className={styles.statLabel}>{t('stat3.label')}</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>
                {formatAnimatedValue(animatedValues.stat4, t('stat4.number'))}
              </div>
              <div className={styles.statLabel}>{t('stat4.label')}</div>
            </div>
          </div>

        </div>
      </div>

      {/* Advantages Block Section */}
      <div className={styles.advantagesBlock} ref={advantagesRef}>
        <div className={styles.advantagesContainer}>
          <h2 className={`${styles.advantagesTitle} ${isAdvantagesVisible ? styles.visible : ''}`}>
            {t('advantages.title')}
          </h2>
          
          <div className={`${styles.advantagesGrid} ${isAdvantagesVisible ? styles.visible : ''}`}>
            <div className={styles.advantageItem}>
              <div className={styles.advantageIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 21V7L13 2L21 7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 9V13H15V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 21V17H15V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={styles.advantageNumber}>{t('advantages.advantage1.number')}</div>
              <div className={styles.advantageLabel}>{t('advantages.advantage1.label')}</div>
              <div className={styles.advantageDescription}>{t('advantages.advantage1.description')}</div>
            </div>

            <div className={styles.advantageItem}>
              <div className={styles.advantageIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 16V6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V16C2 17.1 2.9 18 4 18H20C21.1 18 22 17.1 22 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 10H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 14H7.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={styles.advantageNumber}>{t('advantages.advantage2.number')}</div>
              <div className={styles.advantageLabel}>{t('advantages.advantage2.label')}</div>
              <div className={styles.advantageDescription}>{t('advantages.advantage2.description')}</div>
            </div>

            <div className={styles.advantageItem}>
              <div className={styles.advantageIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={styles.advantageNumber}>{t('advantages.advantage3.number')}</div>
              <div className={styles.advantageLabel}>{t('advantages.advantage3.label')}</div>
              <div className={styles.advantageDescription}>{t('advantages.advantage3.description')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Block Section */}
      <div className={styles.servicesBlock} ref={servicesBlockRef}>
        <div className={styles.servicesBlockContainer}>
          <h2 className={`${styles.servicesBlockTitle} ${isServicesBlockVisible ? styles.visible : ''}`}>
            {t('servicesBlock.title')}
          </h2>
          
          <div className={`${styles.servicesBlockGrid} ${isServicesBlockVisible ? styles.visible : ''}`}>
            <div className={styles.serviceBlockCard}>
              <div className={styles.serviceBlockIcon}>
                {getServiceBlockIcon(1)}
              </div>
              <h3 className={styles.serviceBlockCardTitle}>{t('servicesBlock.service1.title')}</h3>
              <p className={styles.serviceBlockCardDescription}>{t('servicesBlock.service1.description')}</p>
            </div>

            <div className={styles.serviceBlockCard}>
              <div className={styles.serviceBlockIcon}>
                {getServiceBlockIcon(2)}
              </div>
              <h3 className={styles.serviceBlockCardTitle}>{t('servicesBlock.service2.title')}</h3>
              <p className={styles.serviceBlockCardDescription}>{t('servicesBlock.service2.description')}</p>
            </div>

            <div className={styles.serviceBlockCard}>
              <div className={styles.serviceBlockIcon}>
                {getServiceBlockIcon(3)}
              </div>
              <h3 className={styles.serviceBlockCardTitle}>{t('servicesBlock.service3.title')}</h3>
              <p className={styles.serviceBlockCardDescription}>{t('servicesBlock.service3.description')}</p>
            </div>

            <div className={styles.serviceBlockCard}>
              <div className={styles.serviceBlockIcon}>
                {getServiceBlockIcon(4)}
              </div>
              <h3 className={styles.serviceBlockCardTitle}>{t('servicesBlock.service4.title')}</h3>
              <p className={styles.serviceBlockCardDescription}>{t('servicesBlock.service4.description')}</p>
            </div>

            <div className={styles.serviceBlockCard}>
              <div className={styles.serviceBlockIcon}>
                {getServiceBlockIcon(5)}
              </div>
              <h3 className={styles.serviceBlockCardTitle}>{t('servicesBlock.service5.title')}</h3>
              <p className={styles.serviceBlockCardDescription}>{t('servicesBlock.service5.description')}</p>
            </div>

            <div className={styles.serviceBlockCard}>
              <div className={styles.serviceBlockIcon}>
                {getServiceBlockIcon(6)}
              </div>
              <h3 className={styles.serviceBlockCardTitle}>{t('servicesBlock.service6.title')}</h3>
              <p className={styles.serviceBlockCardDescription}>{t('servicesBlock.service6.description')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Process Block Section */}
      <div className={styles.processBlock} ref={processBlockRef}>
        <div className={styles.processContainer}>
          <h2 className={`${styles.processTitle} ${isProcessBlockVisible ? styles.visible : ''}`}>
            {t('processBlock.title')}
          </h2>
          
          <div className={`${styles.processTimeline} ${isProcessBlockVisible ? styles.visible : ''}`}>
            <div className={styles.processStep}>
              <div className={styles.processStepNumber}>1</div>
              <div className={styles.processStepIcon}>
                {getProcessStepIcon(1)}
              </div>
              <div className={styles.processStepContent}>
                <div className={styles.processStepLabel}>{t('processBlock.step1.number')}</div>
                <h3 className={styles.processStepTitle}>{t('processBlock.step1.title')}</h3>
                <p className={styles.processStepDescription}>{t('processBlock.step1.description')}</p>
              </div>
            </div>

            <div className={styles.processStep}>
              <div className={styles.processStepNumber}>2</div>
              <div className={styles.processStepIcon}>
                {getProcessStepIcon(2)}
              </div>
              <div className={styles.processStepContent}>
                <div className={styles.processStepLabel}>{t('processBlock.step2.number')}</div>
                <h3 className={styles.processStepTitle}>{t('processBlock.step2.title')}</h3>
                <p className={styles.processStepDescription}>{t('processBlock.step2.description')}</p>
              </div>
            </div>

            <div className={styles.processStep}>
              <div className={styles.processStepNumber}>3</div>
              <div className={styles.processStepIcon}>
                {getProcessStepIcon(3)}
              </div>
              <div className={styles.processStepContent}>
                <div className={styles.processStepLabel}>{t('processBlock.step3.number')}</div>
                <h3 className={styles.processStepTitle}>{t('processBlock.step3.title')}</h3>
                <p className={styles.processStepDescription}>{t('processBlock.step3.description')}</p>
              </div>
            </div>

            <div className={styles.processStep}>
              <div className={styles.processStepNumber}>4</div>
              <div className={styles.processStepIcon}>
                {getProcessStepIcon(4)}
              </div>
              <div className={styles.processStepContent}>
                <div className={styles.processStepLabel}>{t('processBlock.step4.number')}</div>
                <h3 className={styles.processStepTitle}>{t('processBlock.step4.title')}</h3>
                <p className={styles.processStepDescription}>{t('processBlock.step4.description')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Block Section */}
      <div className={styles.successBlock} ref={successBlockRef}>
        <div className={styles.successContainer}>
          <div className={`${styles.successContent} ${isSuccessBlockVisible ? styles.visible : ''}`}>
            <h2 className={styles.successTitle}>{t('successBlock.title')}</h2>
            <div className={styles.successText}>
              <p className={styles.successDescription}>{t('successBlock.description')}</p>
              <p className={styles.successSolution}>{t('successBlock.solution')}</p>
              <p className={styles.successCTA}>{t('successBlock.cta')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Block Section */}
      <div className={styles.contactBlock} ref={contactBlockRef}>
        <div className={styles.contactContainer}>
          <div className={`${styles.contactContent} ${isContactBlockVisible ? styles.visible : ''}`}>
            <h2 className={styles.contactTitle}>{t('contactBlock.title')}</h2>
            <p className={styles.contactDescription}>{t('contactBlock.description')}</p>
            
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
                      placeholder={t('contactBlock.form.name')}
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
                      placeholder={t('contactBlock.form.contact')}
                      required
                      className={styles.formInput}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder={t('contactBlock.form.message')}
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
                      ? t('contactBlock.form.sending')
                      : t('contactBlock.form.submit')
                    }
                  </button>
                  
                  {formStatus === 'success' && (
                    <div className={styles.formMessage + ' ' + styles.formSuccess}>
                      {t('contactBlock.form.success')}
                    </div>
                  )}
                  
                  {formStatus === 'error' && (
                    <div className={styles.formMessage + ' ' + styles.formError}>
                      {t('contactBlock.form.error')}
                    </div>
                  )}
                </form>
              </div>
              
              {/* Right Column - Map */}
              <div className={styles.contactMapColumn}>
                <div className={styles.contactMapContainer}>
                  <div ref={mapContainerRef} className={styles.contactMap} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Block Section */}
      <div className={styles.faqBlock} ref={faqBlockRef}>
        <div className={styles.faqContainer}>
          <div className={`${styles.faqContent} ${isFaqBlockVisible ? styles.visible : ''}`}>
            <h2 className={styles.faqTitle}>{t('faqBlock.title')}</h2>
            
            <div className={styles.faqList}>
              {['q1', 'q2', 'q3'].map((qKey, index) => (
                <div key={qKey} className={styles.faqItem}>
                  <button
                    className={`${styles.faqQuestion} ${openFaqIndex === index ? styles.open : ''}`}
                    onClick={() => toggleFaq(index)}
                    type="button"
                  >
                    <span className={styles.faqQuestionText}>
                      {t(`faqBlock.questions.${qKey}.question`)}
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
                    <p>{t(`faqBlock.questions.${qKey}.answer`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

