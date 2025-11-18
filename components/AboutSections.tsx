'use client';

import { useTranslations } from 'next-intl';
import { OfficeSection, LeadershipSection, FAQSection } from '@/components/AboutHero';

export default function AboutSections() {
  const t = useTranslations('aboutUs');
  
  return (
    <>
      <OfficeSection t={t} />
      <LeadershipSection t={t} />
      <FAQSection t={t} />
    </>
  );
}

