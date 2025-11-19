'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect, useRef } from 'react';
import styles from './NewsList.module.css';
import NewsCard from './NewsCard';
import { getNews, NewsItem as ApiNewsItem } from '@/lib/api';

interface NewsItem {
  id: string;
  title: string;
  titleRu: string;
  description?: string;
  descriptionRu?: string;
  image: string;
  publishedAt: Date;
  slug: string;
}

export default function NewsList() {
  const t = useTranslations('news');
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('🔄 Loading news...');
        // Спочатку завантажуємо першу сторінку, щоб дізнатися загальну кількість
        const firstPage = await getNews(1, 100);
        console.log('📰 First page result:', {
          newsCount: firstPage.news.length,
          total: firstPage.total,
          page: firstPage.page,
          limit: firstPage.limit,
        });
        
        let allNews = [...firstPage.news];
        
        // Якщо є більше новин, завантажуємо всі інші сторінки
        if (firstPage.total > firstPage.news.length) {
          const totalPages = Math.ceil(firstPage.total / 100);
          console.log(`📄 Loading ${totalPages - 1} additional pages...`);
          const remainingPages = [];
          
          for (let page = 2; page <= totalPages; page++) {
            remainingPages.push(getNews(page, 100));
          }
          
          const remainingResults = await Promise.all(remainingPages);
          remainingResults.forEach(result => {
            allNews = [...allNews, ...result.news];
          });
          console.log(`✅ Loaded total ${allNews.length} news articles`);
        }
        
        // Convert API format to component format
        const convertedNews: NewsItem[] = allNews.map((item: ApiNewsItem) => ({
          id: item.id,
          title: item.title,
          titleRu: item.titleRu,
          description: item.description,
          descriptionRu: item.descriptionRu,
          image: item.image,
          publishedAt: new Date(item.publishedAt),
          slug: item.slug,
        }));
        
        console.log(`✅ Converted ${convertedNews.length} news items`);
        setNews(convertedNews);
      } catch (err) {
        console.error('❌ Failed to fetch news:', err);
        setError('Failed to load news. Please try again later.');
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  // Прибираємо автоматичне прокручування при завантаженні сторінки
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, []);

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

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <section className={styles.newsList}>
        <div className={styles.container}>
          <div className={styles.loading}>{t('loading')}</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.newsList}>
        <div className={styles.container}>
          <div className={styles.error}>{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.newsList} ref={sectionRef}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('pageTitle')}</h1>
        </div>

        {news.length === 0 ? (
          <div className={styles.noNews}>No news articles found.</div>
        ) : (
          <div className={styles.grid}>
            {news.map((item) => (
              <NewsCard key={item.id} news={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

