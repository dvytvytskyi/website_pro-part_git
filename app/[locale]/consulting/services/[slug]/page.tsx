import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { locales } from '@/i18n';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BusinessRegistrationPage from '@/components/BusinessRegistrationPage';
import VisaServicesPage from '@/components/VisaServicesPage';
import InvestmentConsultingPage from '@/components/InvestmentConsultingPage';
import AccountingServicesPage from '@/components/AccountingServicesPage';
import EmploymentServicesPage from '@/components/EmploymentServicesPage';
import TrademarkRegistrationPage from '@/components/TrademarkRegistrationPage';
import PowerOfAttorneyPage from '@/components/PowerOfAttorneyPage';
import LegalSupportPage from '@/components/LegalSupportPage';

interface ServicePageProps {
  params: {
    locale: string;
    slug: string;
  };
}

const validSlugs = [
  'business-registration',
  'visa-services',
  'legal-support',
  'investment-consulting',
  'accounting-services',
  'employment',
  'trademark-registration',
  'power-of-attorney',
];

export async function generateStaticParams() {
  const params = [];
  for (const locale of locales) {
    for (const slug of validSlugs) {
      params.push({ locale, slug });
    }
  }
  return params;
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug, locale } = params;
  
  if (!validSlugs.includes(slug)) {
    notFound();
  }

  // Use special page components for specific services
  if (slug === 'business-registration') {
    return (
      <>
        <Header />
        <BusinessRegistrationPage />
        <Footer />
      </>
    );
  }

  if (slug === 'visa-services') {
    return (
      <>
        <Header />
        <VisaServicesPage />
        <Footer />
      </>
    );
  }

  if (slug === 'investment-consulting') {
    return (
      <>
        <Header />
        <InvestmentConsultingPage />
        <Footer />
      </>
    );
  }

  if (slug === 'accounting-services') {
    return (
      <>
        <Header />
        <AccountingServicesPage />
        <Footer />
      </>
    );
  }

  if (slug === 'employment') {
    return (
      <>
        <Header />
        <EmploymentServicesPage />
        <Footer />
      </>
    );
  }

  if (slug === 'trademark-registration') {
    return (
      <>
        <Header />
        <TrademarkRegistrationPage />
        <Footer />
      </>
    );
  }

  if (slug === 'power-of-attorney') {
    return (
      <>
        <Header />
        <PowerOfAttorneyPage />
        <Footer />
      </>
    );
  }

  if (slug === 'legal-support') {
    return (
      <>
        <Header />
        <LegalSupportPage />
        <Footer />
      </>
    );
  }

  // Default page for other services
  const t = await getTranslations({ locale, namespace: 'consulting' });

  return (
    <>
      <Header />
      <div style={{ 
        minHeight: '80vh', 
        padding: '120px 40px 80px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: '48px',
          fontWeight: 600,
          color: '#e6a165',
          marginBottom: '24px'
        }}>
          {t(`services.${slug}.title`)}
        </h1>
        <p style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: '18px',
          fontWeight: 300,
          color: '#666666',
          lineHeight: 1.8,
          marginBottom: '40px'
        }}>
          {t(`services.${slug}.description`)}
        </p>
        <div style={{
          padding: '40px',
          background: '#f9f9f9',
          borderRadius: '16px',
          marginTop: '40px'
        }}>
          <p style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: '16px',
            color: '#333333',
            lineHeight: 1.6
          }}>
            {t(`services.${slug}.description`)}
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}

