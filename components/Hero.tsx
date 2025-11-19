'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { getAreas } from '@/lib/api';
import styles from './Hero.module.css';

interface Area {
  id: string;
  nameEn: string;
  nameRu: string;
  nameAr: string;
  cityId: string;
}

export default function Hero() {
  const t = useTranslations('hero');
  const locale = useLocale();
  const router = useRouter();
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [selectedBedrooms, setSelectedBedrooms] = useState<string>('');
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
  const [isBedroomsDropdownOpen, setIsBedroomsDropdownOpen] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const areaDropdownRef = useRef<HTMLDivElement>(null);
  const bedroomsDropdownRef = useRef<HTMLDivElement>(null);
  const areaButtonRef = useRef<HTMLButtonElement>(null);
  const bedroomsButtonRef = useRef<HTMLButtonElement>(null);
  const [areaDropdownDirection, setAreaDropdownDirection] = useState<'down' | 'up'>('down');
  const [bedroomsDropdownDirection, setBedroomsDropdownDirection] = useState<'down' | 'up'>('down');

  const bedroomsOptions = ['1', '2', '3', '4', '5+'];

  // Top 20 main Dubai areas to show in dropdown
  const MAIN_DUBAI_AREAS = [
    'Business Bay',
    'Downtown Dubai',
    'Palm Jumeirah',
    'Dubai Marina',
    'Dubai Hills',
    'Jumeirah Village Circle (JVC)',
    'Jumeirah Village Triangle (JVT)',
    'Arjan',
    'Al Furjan',
    'Dubai Harbour',
    'Dubai Creek Harbour',
    'Mohammed Bin Rashid City (MBR)',
    'Dubai Silicon Oasis',
    'Dubai Sports City',
    'International City',
    'Dubai Investment Park',
    'Dubai Science Park',
    'Dubai Industrial City',
    'Tilal Al Ghaf',
    'City of Arabia',
  ];

  // Load areas from API - filter to show only main 20 Dubai areas
  useEffect(() => {
    const loadAreas = async () => {
      try {
        const apiAreas = await getAreas();
        if (apiAreas && Array.isArray(apiAreas)) {
          // Filter to show only main Dubai areas
          const filteredAreas = apiAreas.filter((area) => {
            const areaName = area.nameEn?.trim();
            if (!areaName) return false;
            
            // Check if area name matches any of the main areas (case-insensitive)
            return MAIN_DUBAI_AREAS.some(
              (mainArea) => mainArea.toLowerCase() === areaName.toLowerCase()
            );
          });
          
          // Sort areas according to MAIN_DUBAI_AREAS order
          const sortedAreas = filteredAreas.sort((a, b) => {
            const aIndex = MAIN_DUBAI_AREAS.findIndex(
              (name) => name.toLowerCase() === a.nameEn?.toLowerCase()
            );
            const bIndex = MAIN_DUBAI_AREAS.findIndex(
              (name) => name.toLowerCase() === b.nameEn?.toLowerCase()
            );
            return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
          });
          
          setAreas(sortedAreas);
        }
      } catch (error) {
        console.error('Error loading areas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAreas();
  }, []);

  const handleSearch = () => {
    if (!selectedArea || !selectedBedrooms) return;

    const params = new URLSearchParams();
    params.set('areaId', selectedArea.id);
    params.set('bedrooms', selectedBedrooms);

    const localePrefix = locale === 'en' ? '' : `/${locale}`;
    const url = `${localePrefix}/properties?${params.toString()}`;
    
    router.push(url);
  };

  const handleAreaSelect = (area: Area) => {
    setSelectedArea(area);
    setIsAreaDropdownOpen(false);
  };

  const handleBedroomSelect = (value: string) => {
    setSelectedBedrooms(value);
    setIsBedroomsDropdownOpen(false);
  };

  const getAreaName = (area: Area | null) => {
    if (!area) return t('search.placeholder');
    return locale === 'ru' ? area.nameRu : area.nameEn;
  };

  const getBedroomLabel = (value: string) => {
    if (!value) return t('search.bedroomsPlaceholder');
    return `${value} ${t('search.bedrooms')}`;
  };

  useEffect(() => {
    const calculateDropdownDirection = (buttonRef: React.RefObject<HTMLButtonElement>, dropdownRef: React.RefObject<HTMLDivElement>) => {
      if (!buttonRef.current || !dropdownRef.current) return 'down';
      
      // На ПК (екрани >= 1024px) завжди відкриваємо вгору
      if (window.innerWidth >= 1024) {
        return 'up';
      }
      
      // На менших екранах (планшети та мобільні) перевіряємо доступний простір
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;
      
      // Якщо менше 200px внизу, але більше 200px вгорі - показуємо вгору
      if (spaceBelow < 200 && spaceAbove > 200) {
        return 'up';
      }
      
      return 'down';
    };

    if (isAreaDropdownOpen && areaButtonRef.current && areaDropdownRef.current) {
      const direction = calculateDropdownDirection(areaButtonRef, areaDropdownRef);
      setAreaDropdownDirection(direction);
    }

    if (isBedroomsDropdownOpen && bedroomsButtonRef.current && bedroomsDropdownRef.current) {
      const direction = calculateDropdownDirection(bedroomsButtonRef, bedroomsDropdownRef);
      setBedroomsDropdownDirection(direction);
    }
  }, [isAreaDropdownOpen, isBedroomsDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (areaDropdownRef.current && !areaDropdownRef.current.contains(event.target as Node)) {
        setIsAreaDropdownOpen(false);
      }
      if (bedroomsDropdownRef.current && !bedroomsDropdownRef.current.contains(event.target as Node)) {
        setIsBedroomsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Video source - use cloud URL if available, otherwise fallback to local
  const videoSrc = process.env.NEXT_PUBLIC_HERO_VIDEO_URL || 'https://res.cloudinary.com/dgv0rxd60/video/upload/v1762957287/3ea514df-18e3-4c44-8177-fdc048fca302_fldvse.mp4';

  return (
    <section className={styles.hero}>
      <div className={styles.videoContainer}>
        <video
          autoPlay
          muted
          loop
          playsInline
          className={styles.video}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
        <div className={styles.gradientTop}></div>
        <div className={styles.overlay}></div>
        <div className={styles.gradientBottom}></div>
      </div>
      
      <div className={styles.content}>
        <h1 className={styles.title}>{t('title')}</h1>
        <p className={styles.subtitle}>{t('subtitle')}</p>
        
        <div className={styles.searchBlock}>
          <div className={styles.searchInputWrapper} ref={areaDropdownRef}>
            <svg
              className={styles.searchIcon}
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19 19L14.65 14.65"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <button
              ref={areaButtonRef}
              type="button"
              onClick={() => setIsAreaDropdownOpen(!isAreaDropdownOpen)}
              className={styles.areaSelect}
            >
              <span className={selectedArea ? '' : styles.placeholder}>
                {getAreaName(selectedArea)}
              </span>
              <svg
                className={`${styles.dropdownArrow} ${isAreaDropdownOpen ? styles.dropdownArrowOpen : ''}`}
                width="12"
                height="8"
                viewBox="0 0 12 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1.5L6 6.5L11 1.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            
            {isAreaDropdownOpen && (
              <div 
                className={`${styles.dropdownMenu} ${areaDropdownDirection === 'up' ? styles.dropdownMenuUp : ''}`}
              >
                {loading ? (
                  <div className={styles.dropdownItem}>Loading...</div>
                ) : areas.length === 0 ? (
                  <div className={styles.dropdownItem}>No areas available</div>
                ) : (
                  areas.map((area) => (
                    <button
                      key={area.id}
                      type="button"
                      onClick={() => handleAreaSelect(area)}
                      className={`${styles.dropdownItem} ${selectedArea?.id === area.id ? styles.dropdownItemActive : ''}`}
                    >
                      {locale === 'ru' ? area.nameRu : area.nameEn}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          
          <div className={styles.dropdownWrapper} ref={bedroomsDropdownRef}>
            <button
              ref={bedroomsButtonRef}
              type="button"
              onClick={() => setIsBedroomsDropdownOpen(!isBedroomsDropdownOpen)}
              className={styles.bedroomsSelect}
            >
              <span className={selectedBedrooms ? '' : styles.placeholder}>
                {getBedroomLabel(selectedBedrooms)}
              </span>
              <svg
                className={`${styles.dropdownArrow} ${isBedroomsDropdownOpen ? styles.dropdownArrowOpen : ''}`}
                width="12"
                height="8"
                viewBox="0 0 12 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1.5L6 6.5L11 1.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            
            {isBedroomsDropdownOpen && (
              <div 
                className={`${styles.dropdownMenu} ${bedroomsDropdownDirection === 'up' ? styles.dropdownMenuUp : ''}`}
              >
                {bedroomsOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleBedroomSelect(option)}
                    className={`${styles.dropdownItem} ${selectedBedrooms === option ? styles.dropdownItemActive : ''}`}
                  >
                    {getBedroomLabel(option)}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button 
            onClick={handleSearch} 
            className={styles.searchButton}
            disabled={!selectedArea || !selectedBedrooms}
          >
            {t('search.searchButton')}
          </button>
        </div>
      </div>
    </section>
  );
}
