'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getPublicData, getAreas, getDevelopers } from '@/lib/api';
import styles from './PropertyFilters.module.css';

interface Filters {
  type: 'new' | 'secondary';
  search: string;
  location: string; // areaId (single selection)
  bedrooms: number[];
  sizeFrom: string;
  sizeTo: string;
  priceFrom: string;
  priceTo: string;
  sort: string;
  developerId?: string;
  cityId?: string;
}

interface PropertyFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  isModal?: boolean;
}

interface Area {
  id: string;
  nameEn: string;
  nameRu: string;
  nameAr: string;
  cityId: string;
  projectsCount?: {
    total: number;
    offPlan: number;
    secondary: number;
  };
}

interface Developer {
  id: string;
  name: string;
  logo: string | null;
}

const sortOptions = [
  { value: 'price-desc', label: 'Price Higher', labelRu: 'Цена выше' },
  { value: 'price-asc', label: 'Price Lower', labelRu: 'Цена ниже' },
  { value: 'size-desc', label: 'Size Higher', labelRu: 'Площадь больше' },
  { value: 'size-asc', label: 'Size Lower', labelRu: 'Площадь меньше' },
  { value: 'newest', label: 'Newest First', labelRu: 'Сначала новые' },
];

// Top 25 main Dubai areas to show in location filter
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
  'Dubai Production City',
  'Dubai Studio City',
  'Dubai Media City',
  'Dubai Internet City',
  'Dubai Knowledge Park',
];

export default function PropertyFilters({ filters, onFilterChange, isModal = false }: PropertyFiltersProps) {
  const t = useTranslations('filters');
  const locale = useLocale();
  const [localFilters, setLocalFilters] = useState<Filters>(filters);
  
  // Sync localFilters with external filters prop
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isBedroomsOpen, setIsBedroomsOpen] = useState(false);
  const [isSizeOpen, setIsSizeOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isDeveloperOpen, setIsDeveloperOpen] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const locationRef = useRef<HTMLDivElement>(null);
  const bedroomsRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const developerRef = useRef<HTMLDivElement>(null);
  
  // State for dropdown direction (openUp/openDown)
  const [dropdownDirections, setDropdownDirections] = useState<Record<string, boolean>>({});

  // Load public data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        
        // Load areas with projectsCount from /public/areas endpoint
        // This ensures we get areas with project counts and can filter by projectsCount > 0
        const areasData = await getAreas(undefined, true);
        
        // Filter areas to only show main 25 Dubai areas
        const mainAreas = areasData
          .filter(area => {
            const areaName = area.nameEn?.trim();
            if (!areaName) return false;
            
            // Check if area name matches any of the main areas (case-insensitive)
            return MAIN_DUBAI_AREAS.some(
              (mainArea) => mainArea.toLowerCase() === areaName.toLowerCase()
            );
          })
          .sort((a, b) => {
            // Sort according to MAIN_DUBAI_AREAS order
            const aIndex = MAIN_DUBAI_AREAS.findIndex(
              (mainArea) => mainArea.toLowerCase() === a.nameEn.toLowerCase()
            );
            const bIndex = MAIN_DUBAI_AREAS.findIndex(
              (mainArea) => mainArea.toLowerCase() === b.nameEn.toLowerCase()
            );
            return aIndex - bIndex;
          });
        
        // Load developers using dedicated function (has fallback to publicData)
        let developersData: Developer[] = [];
        try {
          developersData = await getDevelopers();
          if (process.env.NODE_ENV === 'development') {
            console.log(`✅ PropertyFilters: Loaded ${developersData.length} developers from getDevelopers()`);
          }
        } catch (devError) {
          console.error('Error loading developers:', devError);
          // Fallback: try to get from publicData
          try {
            const publicData = await getPublicData();
            developersData = (publicData.developers || []).map((d: any) => ({
              id: d.id,
              name: d.name,
              logo: d.logo,
            }));
            if (process.env.NODE_ENV === 'development') {
              console.log(`✅ PropertyFilters: Fallback - Loaded ${developersData.length} developers from getPublicData()`);
            }
          } catch (fallbackError) {
            console.error('Error loading developers from fallback:', fallbackError);
          }
        }
        
        // Sort developers alphabetically by name
        const sortedDevelopers = [...developersData].sort((a, b) => 
          a.name.localeCompare(b.name)
        );
        
        setAreas(mainAreas);
        setDevelopers(sortedDevelopers);
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ PropertyFilters: Loaded ${mainAreas.length} main areas (filtered from ${areasData.length} total)`);
          console.log(`✅ PropertyFilters: Sample areas:`, mainAreas.slice(0, 5).map(a => ({
            id: a.id,
            nameEn: a.nameEn,
            projectsCount: a.projectsCount?.total || 0
          })));
          console.log(`✅ PropertyFilters: Final developers count: ${sortedDevelopers.length}`);
          console.log(`✅ PropertyFilters: Sample developers:`, sortedDevelopers.slice(0, 5).map(d => ({
            id: d.id,
            name: d.name
          })));
        }
        
        setLoadingData(false);
      } catch (error) {
        console.error('Error loading filter data:', error);
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

  // Функція для форматування числа з розділювачами тисяч
  const formatNumber = (value: string): string => {
    if (!value) return '';
    // Прибираємо всі нечислові символи окрім цифр
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    // Форматуємо з розділювачами тисяч
    return new Intl.NumberFormat('en-US').format(parseInt(numbers, 10));
  };

  // Функція для парсингу числа (прибирає коми)
  const parseNumber = (value: string): string => {
    return value.replace(/\D/g, '');
  };

  // Function to check if dropdown should open upward
  const checkDropdownDirection = (ref: React.RefObject<HTMLDivElement>, dropdownId: string) => {
    if (!ref.current) return false;
    
    const rect = ref.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const estimatedDropdownHeight = 320; // Approximate height of dropdown with padding
    
    // In modal mode, check relative to modal container or modal body
    if (isModal) {
      // Find modal container - look for modal backdrop or dialog
      let modalContainer = ref.current.closest('[role="dialog"]');
      if (!modalContainer) {
        // Try to find modal body by traversing up
        let parent = ref.current.parentElement;
        while (parent && parent !== document.body) {
          if (parent.classList && (
            parent.classList.toString().includes('modal') ||
            parent.classList.toString().includes('Modal')
          )) {
            modalContainer = parent;
            break;
          }
          parent = parent.parentElement;
        }
      }
      
      if (modalContainer) {
        const modalRect = modalContainer.getBoundingClientRect();
        const spaceBelowInModal = modalRect.bottom - rect.bottom;
        const spaceAboveInModal = rect.top - modalRect.top;
        
        // Add some padding for better UX
        const padding = 20;
        
        // Open upward if not enough space below in modal but enough space above
        const shouldOpenUp = (spaceBelowInModal < estimatedDropdownHeight + padding) && (spaceAboveInModal > estimatedDropdownHeight + padding);
        
        setDropdownDirections(prev => ({
          ...prev,
          [dropdownId]: shouldOpenUp
        }));
        
        return shouldOpenUp;
      }
    }
    
    // For non-modal or if modal container not found, use viewport
    // Open upward if not enough space below but enough space above
    const shouldOpenUp = spaceBelow < estimatedDropdownHeight && spaceAbove > estimatedDropdownHeight;
    
    setDropdownDirections(prev => ({
      ...prev,
      [dropdownId]: shouldOpenUp
    }));
    
    return shouldOpenUp;
  };

  // Handle dropdown toggle with direction check
  const handleDropdownToggle = (dropdownId: string, ref: React.RefObject<HTMLDivElement>, isOpen: boolean, setIsOpen: (value: boolean) => void) => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    // Check direction after state update
    if (newIsOpen) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        checkDropdownDirection(ref, dropdownId);
      }, 0);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setIsLocationOpen(false);
      }
      if (bedroomsRef.current && !bedroomsRef.current.contains(event.target as Node)) {
        setIsBedroomsOpen(false);
      }
      if (sizeRef.current && !sizeRef.current.contains(event.target as Node)) {
        setIsSizeOpen(false);
      }
      if (priceRef.current && !priceRef.current.contains(event.target as Node)) {
        setIsPriceOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
      if (developerRef.current && !developerRef.current.contains(event.target as Node)) {
        setIsDeveloperOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (field: keyof Filters, value: any) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleLocationSelect = (areaId: string) => {
    // Single selection: if same area clicked, clear selection; otherwise select new area
    handleChange('location', localFilters.location === areaId ? '' : areaId);
    setIsLocationOpen(false);
  };

  const handleDeveloperToggle = (developerId: string) => {
    handleChange('developerId', localFilters.developerId === developerId ? undefined : developerId);
  };

  const handleBedroomToggle = (bedrooms: number) => {
    const newBedrooms = localFilters.bedrooms.includes(bedrooms)
      ? localFilters.bedrooms.filter((b) => b !== bedrooms)
      : [...localFilters.bedrooms, bedrooms];
    handleChange('bedrooms', newBedrooms);
  };

  const getLocationLabel = () => {
    if (!localFilters.location) return t('location.placeholder');
    const area = areas.find((a) => a.id === localFilters.location);
    return locale === 'ru' ? area?.nameRu || area?.nameEn : area?.nameEn || '';
  };

  const getDeveloperLabel = () => {
    if (!localFilters.developerId) return t('developer.placeholder') || 'Developer';
    const developer = developers.find((d) => d.id === localFilters.developerId);
    return developer?.name || '';
  };

  const getBedroomsLabel = () => {
    if (localFilters.bedrooms.length === 0) return t('bedrooms.placeholder');
    if (localFilters.bedrooms.length === 1) {
      return `${localFilters.bedrooms[0]} ${t('bedrooms.bedroom')}`;
    }
    return `${localFilters.bedrooms.length} ${t('bedrooms.selected')}`;
  };

  const getSizeLabel = () => {
    if (!localFilters.sizeFrom && !localFilters.sizeTo) return t('size.placeholder');
    const from = localFilters.sizeFrom ? formatNumber(localFilters.sizeFrom) : '0';
    const to = localFilters.sizeTo ? formatNumber(localFilters.sizeTo) : '∞';
    const unit = locale === 'ru' ? 'м²' : 'sq.ft';
    return (
      <>
        {from} - {to} <span className={styles.unitInLabel}>{unit}</span>
      </>
    );
  };

  const getPriceLabel = () => {
    if (!localFilters.priceFrom && !localFilters.priceTo) return t('price.placeholder');
    const from = localFilters.priceFrom ? formatNumber(localFilters.priceFrom) : '0';
    const to = localFilters.priceTo ? formatNumber(localFilters.priceTo) : '∞';
    return (
      <>
        {from} - {to} <span className={styles.unitInLabel}>AED</span>
      </>
    );
  };

  const handleNumberChange = (field: 'sizeFrom' | 'sizeTo' | 'priceFrom' | 'priceTo', value: string) => {
    const parsed = parseNumber(value);
    handleChange(field, parsed);
  };

  const getSortLabel = () => {
    const option = sortOptions.find((opt) => opt.value === localFilters.sort);
    if (!option) return t('sort.placeholder');
    return locale === 'ru' ? option.labelRu : option.label;
  };

  return (
    <div className={`${styles.filters} ${isModal ? styles.filtersModal : ''}`}>
      <div className={`${styles.filtersRow} ${isModal ? styles.filtersRowModal : ''}`}>
        {/* Off Plan Toggle */}
        <div className={styles.typeToggle}>
          <button
            className={`${styles.typeButton} ${localFilters.type === 'new' ? styles.active : ''}`}
            onClick={() => handleChange('type', 'new')}
          >
            {t('type.offPlan')}
          </button>
        </div>

        {/* Search */}
        <div className={styles.searchWrapper}>
          <input
            type="text"
            placeholder={t('search.placeholder')}
            value={localFilters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Location Dropdown */}
        <div 
          className={`${styles.dropdownWrapper} ${styles.locationDropdown} ${isModal ? styles.dropdownWrapperModal : ''}`} 
          ref={locationRef}
          data-dropdown-open={isLocationOpen ? 'true' : 'false'}
        >
          <button
            className={styles.dropdownButton}
            onClick={() => handleDropdownToggle('location', locationRef, isLocationOpen, setIsLocationOpen)}
          >
            <span>{getLocationLabel()}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={isLocationOpen ? styles.rotated : ''}>
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {isLocationOpen && (
            <div className={`${styles.dropdownMenu} ${dropdownDirections.location ? styles.dropdownMenuUp : styles.dropdownMenuDown} ${isModal ? styles.dropdownMenuModal : ''}`}>
              {loadingData ? (
                <div className={styles.dropdownItem}>Loading...</div>
              ) : areas.length === 0 ? (
                <div className={styles.dropdownItem}>No areas available</div>
              ) : (
                <>
                  <button
                    className={`${styles.dropdownItem} ${!localFilters.location ? styles.active : ''}`}
                    onClick={() => {
                      handleChange('location', '');
                      setIsLocationOpen(false);
                    }}
                  >
                    {t('location.all') || 'All Areas'}
                  </button>
                  {areas.map((area) => (
                    <button
                      key={area.id}
                      className={`${styles.dropdownItem} ${localFilters.location === area.id ? styles.active : ''}`}
                      onClick={() => handleLocationSelect(area.id)}
                    >
                      {locale === 'ru' ? area.nameRu : area.nameEn}
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Developer Dropdown - Temporarily hidden */}
        {false && (
          <div 
            className={`${styles.dropdownWrapper} ${styles.locationDropdown} ${isModal ? styles.dropdownWrapperModal : ''}`} 
            ref={developerRef}
            data-dropdown-open={isDeveloperOpen ? 'true' : 'false'}
          >
            <button
              className={styles.dropdownButton}
              onClick={() => handleDropdownToggle('developer', developerRef, isDeveloperOpen, setIsDeveloperOpen)}
            >
              <span>{getDeveloperLabel()}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={isDeveloperOpen ? styles.rotated : ''}>
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {isDeveloperOpen && (
              <div className={`${styles.dropdownMenu} ${dropdownDirections.developer ? styles.dropdownMenuUp : styles.dropdownMenuDown} ${isModal ? styles.dropdownMenuModal : ''}`}>
                {loadingData ? (
                  <div className={styles.dropdownItem}>Loading...</div>
                ) : developers.length === 0 ? (
                  <div className={styles.dropdownItem}>No developers available</div>
                ) : (
                  <>
                    <button
                      className={`${styles.dropdownItem} ${!localFilters.developerId ? styles.active : ''}`}
                      onClick={() => {
                        handleDeveloperToggle('');
                        setIsDeveloperOpen(false);
                      }}
                    >
                      {t('developer.all') || 'All Developers'}
                    </button>
                    {developers.map((developer) => (
                      <button
                        key={developer.id}
                        className={`${styles.dropdownItem} ${localFilters.developerId === developer.id ? styles.active : ''}`}
                        onClick={() => {
                          handleDeveloperToggle(developer.id);
                          setIsDeveloperOpen(false);
                        }}
                      >
                        {developer.name}
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bedrooms Dropdown */}
        <div 
          className={`${styles.dropdownWrapper} ${styles.bedroomsDropdown} ${isModal ? styles.dropdownWrapperModal : ''}`} 
          ref={bedroomsRef}
          data-dropdown-open={isBedroomsOpen ? 'true' : 'false'}
        >
          <button
            className={styles.dropdownButton}
            onClick={() => handleDropdownToggle('bedrooms', bedroomsRef, isBedroomsOpen, setIsBedroomsOpen)}
          >
            <span>{getBedroomsLabel()}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={isBedroomsOpen ? styles.rotated : ''}>
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {isBedroomsOpen && (
            <div className={`${styles.dropdownMenu} ${dropdownDirections.bedrooms ? styles.dropdownMenuUp : styles.dropdownMenuDown} ${isModal ? styles.dropdownMenuModal : ''}`}>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <label key={num} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={localFilters.bedrooms.includes(num)}
                    onChange={() => handleBedroomToggle(num)}
                  />
                  <span>{num === 6 ? '6+' : num}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Size Dropdown */}
        <div 
          className={`${styles.dropdownWrapper} ${styles.sizeDropdown} ${isModal ? styles.dropdownWrapperModal : ''}`} 
          ref={sizeRef}
          data-dropdown-open={isSizeOpen ? 'true' : 'false'}
        >
          <button
            className={styles.dropdownButton}
            onClick={() => handleDropdownToggle('size', sizeRef, isSizeOpen, setIsSizeOpen)}
          >
            <span>{getSizeLabel()}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={isSizeOpen ? styles.rotated : ''}>
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {isSizeOpen && (
            <div className={`${styles.dropdownMenu} ${dropdownDirections.size ? styles.dropdownMenuUp : styles.dropdownMenuDown} ${isModal ? styles.dropdownMenuModal : ''}`}>
              <div className={styles.rangeInputs}>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder={t('size.from')}
                  value={localFilters.sizeFrom ? formatNumber(localFilters.sizeFrom) : ''}
                  onChange={(e) => handleNumberChange('sizeFrom', e.target.value)}
                  className={styles.rangeInput}
                />
                <span className={styles.rangeSeparator}>-</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder={t('size.to')}
                  value={localFilters.sizeTo ? formatNumber(localFilters.sizeTo) : ''}
                  onChange={(e) => handleNumberChange('sizeTo', e.target.value)}
                  className={styles.rangeInput}
                />
                <span className={styles.rangeUnit}>{locale === 'ru' ? 'м²' : 'sq.ft'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Price Dropdown */}
        <div 
          className={`${styles.dropdownWrapper} ${styles.priceDropdown} ${isModal ? styles.dropdownWrapperModal : ''}`} 
          ref={priceRef}
          data-dropdown-open={isPriceOpen ? 'true' : 'false'}
        >
          <button
            className={styles.dropdownButton}
            onClick={() => handleDropdownToggle('price', priceRef, isPriceOpen, setIsPriceOpen)}
          >
            <span>{getPriceLabel()}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={isPriceOpen ? styles.rotated : ''}>
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {isPriceOpen && (
            <div className={`${styles.dropdownMenu} ${dropdownDirections.price ? styles.dropdownMenuUp : styles.dropdownMenuDown} ${isModal ? styles.dropdownMenuModal : ''}`}>
              <div className={styles.rangeInputs}>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder={t('price.from')}
                  value={localFilters.priceFrom ? formatNumber(localFilters.priceFrom) : ''}
                  onChange={(e) => handleNumberChange('priceFrom', e.target.value)}
                  className={styles.rangeInput}
                />
                <span className={styles.rangeSeparator}>-</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder={t('price.to')}
                  value={localFilters.priceTo ? formatNumber(localFilters.priceTo) : ''}
                  onChange={(e) => handleNumberChange('priceTo', e.target.value)}
                  className={styles.rangeInput}
                />
                <span className={styles.rangeUnit}>AED</span>
              </div>
            </div>
          )}
        </div>

        {/* Sort Dropdown */}
        <div 
          className={`${styles.dropdownWrapper} ${styles.sortDropdown} ${isModal ? styles.dropdownWrapperModal : ''}`} 
          ref={sortRef}
          data-dropdown-open={isSortOpen ? 'true' : 'false'}
        >
          <button
            className={styles.dropdownButton}
            onClick={() => handleDropdownToggle('sort', sortRef, isSortOpen, setIsSortOpen)}
          >
            <span>{getSortLabel()}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={isSortOpen ? styles.rotated : ''}>
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {isSortOpen && (
            <div className={`${styles.dropdownMenu} ${dropdownDirections.sort ? styles.dropdownMenuUp : styles.dropdownMenuDown} ${isModal ? styles.dropdownMenuModal : ''}`}>
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  className={`${styles.dropdownItem} ${localFilters.sort === option.value ? styles.active : ''}`}
                  onClick={() => {
                    handleChange('sort', option.value);
                    setIsSortOpen(false);
                  }}
                >
                  {locale === 'ru' ? option.labelRu : option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
