'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import PropertyFilters from './PropertyFilters';
import styles from './FilterModal.module.css';

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

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Filters;
  onApply: (filters: Filters) => void;
  onReset: () => void;
}

export default function FilterModal({ isOpen, onClose, filters, onApply, onReset }: FilterModalProps) {
  const t = useTranslations('filters');
  const [tempFilters, setTempFilters] = useState<Filters>(filters);
  const modalRef = useRef<HTMLDivElement>(null);

  // Sync tempFilters with filters prop when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempFilters(filters);
    }
  }, [isOpen, filters]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle filter changes (temporary, not applied yet)
  const handleFilterChange = (newFilters: Filters) => {
    setTempFilters(newFilters);
  };

  // Apply filters and close modal
  const handleApply = () => {
    onApply(tempFilters);
    onClose();
  };

  // Reset filters and close modal
  const handleReset = () => {
    onReset();
    onClose();
  };

  // Count active filters
  const getActiveFiltersCount = (): number => {
    let count = 0;
    if (tempFilters.search) count++;
    if (tempFilters.location) count++;
    if (tempFilters.bedrooms.length > 0) count++;
    if (tempFilters.sizeFrom || tempFilters.sizeTo) count++;
    if (tempFilters.priceFrom || tempFilters.priceTo) count++;
    if (tempFilters.developerId) count++;
    if (tempFilters.sort && tempFilters.sort !== 'newest') count++;
    return count;
  };

  if (!isOpen) return null;

  return (
    <div 
      className={styles.modalBackdrop}
      onClick={handleBackdropClick}
      aria-hidden="true"
    >
      <div 
        className={styles.modal}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-modal-title"
      >
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 id="filter-modal-title" className={styles.modalTitle}>
            {t('title') || 'Filters'}
            {getActiveFiltersCount() > 0 && (
              <span className={styles.filterCount}>({getActiveFiltersCount()})</span>
            )}
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close filters"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M18 6L6 18M6 6L18 18" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Filters Content */}
        <div className={styles.modalContent}>
          <PropertyFilters 
            filters={tempFilters} 
            onFilterChange={handleFilterChange}
            isModal={true}
          />
        </div>

        {/* Footer with buttons */}
        <div className={styles.modalFooter}>
          <button
            className={styles.resetButton}
            onClick={handleReset}
          >
            {t('reset') || 'Reset'}
          </button>
          <button
            className={styles.applyButton}
            onClick={handleApply}
          >
            {t('apply') || 'Apply Filters'}
          </button>
        </div>
      </div>
    </div>
  );
}

