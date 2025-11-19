import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { locales, defaultLocale } from '@/i18n';
import dynamic from 'next/dynamic';
import './globals.css';

const ChatWidget = dynamic(() => import('@/components/ChatWidget'), {
  ssr: false,
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages({ locale: defaultLocale });

  return (
    <html lang={defaultLocale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
          <ChatWidget />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
