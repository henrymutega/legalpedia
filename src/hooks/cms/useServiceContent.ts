import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useLocale, pickLocale } from './useLocaleField';
import { SERVICE_KEYS, iconForService, imageForService, imageSetForService } from '@/lib/serviceAssets';
import { toSlug } from '@/lib/slug';
import type { LucideIcon } from 'lucide-react';

export interface ProcessStep {
  title: string;
  desc: string;
}

export interface ServiceVM {
  id: string;
  key: string;
  title: string;
  short: string;
  full: string;
  benefits: string[];
  /** Stable, locale-independent slugs for each benefit (derived from English). */
  benefitSlugs: string[];
  /** CMS-managed detail-page content (empty when not set in the DB). */
  detailIntro: string;
  detailOverview: string;
  detailWhy: string;
  detailIncluded: string[];
  detailProcess: ProcessStep[];
  image: string;
  images: string[];
  icon: LucideIcon;
}

/**
 * Single source of truth for service/practice-area content on the public site.
 * Content (title/description) is read from the `services` table managed in the
 * admin CMS, with i18n translations as a fallback. Icons and imagery resolve
 * from code so the design always renders. If the DB is empty, it falls back to
 * the canonical i18n-driven list so the site never breaks.
 */
export function useServiceContent() {
  const { t } = useTranslation();
  const locale = useLocale();

  const query = useQuery({
    queryKey: ['cms', 'services', 'public'],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('published', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const rows = (query.data || []).filter((r: any) => r.key);

  const fromKey = (key: string, row?: any): ServiceVM => {
    // Prefer the locale-specific DB column, then the i18n translation for the
    // active language, then the English DB value, then the i18n fallback.
    const i18nTitle = t(`services.items.${key}.title`, key);
    const i18nShort = t(`services.items.${key}.short`, '');
    const title =
      row?.[`title_${locale}`] ||
      (locale !== 'en' ? i18nTitle : '') ||
      pickLocale(row, 'title', locale, i18nTitle);
    const short =
      row?.[`description_${locale}`] ||
      (locale !== 'en' ? i18nShort : '') ||
      pickLocale(row, 'description', locale, i18nShort);

    // Long description: prefer DB (active locale, then English), then i18n.
    const full =
      row?.[`full_${locale}`] || row?.full_en || t(`services.items.${key}.full`, '');

    // Benefits: prefer DB list for the active locale (falling back to English),
    // otherwise the i18n list. Slugs are always derived from the English list so
    // they stay stable across languages.
    const dbBenefits: string[] = (row?.[`benefits_${locale}`]?.length
      ? row[`benefits_${locale}`]
      : row?.benefits_en) || [];
    const dbBenefitsEn: string[] = row?.benefits_en || [];
    const i18nBenefits =
      (t(`services.items.${key}.benefits`, { returnObjects: true }) as string[]) || [];
    const i18nBenefitsEn =
      (t(`services.items.${key}.benefits`, { returnObjects: true, lng: 'en' }) as string[]) || [];

    const benefits = dbBenefits.length ? dbBenefits : i18nBenefits;
    const benefitSlugs = (dbBenefitsEn.length ? dbBenefitsEn : i18nBenefitsEn).map((b, i) =>
      toSlug(b) || `item-${i}`
    );

    // Detail-page content (CMS-managed). Prefer active locale, then English.
    const pickDetail = (f: string): string =>
      row?.[`${f}_${locale}`] || row?.[`${f}_en`] || '';
    const pickDetailList = (f: string): string[] => {
      const v = row?.[`${f}_${locale}`]?.length ? row[`${f}_${locale}`] : row?.[`${f}_en`];
      return Array.isArray(v) ? v : [];
    };
    const pickProcess = (): ProcessStep[] => {
      const raw = row?.[`detail_process_${locale}`]?.length
        ? row[`detail_process_${locale}`]
        : row?.detail_process_en;
      if (!Array.isArray(raw)) return [];
      return raw
        .map((s: any) => ({ title: s?.title || '', desc: s?.desc || '' }))
        .filter((s: ProcessStep) => s.title || s.desc);
    };

    return {
      id: key,
      key,
      title,
      short,
      full,
      benefits: Array.isArray(benefits) ? benefits : [],
      benefitSlugs,
      detailIntro: pickDetail('detail_intro'),
      detailOverview: pickDetail('detail_overview'),
      detailWhy: pickDetail('detail_why'),
      detailIncluded: pickDetailList('detail_included'),
      detailProcess: pickProcess(),
      image: row?.image_url || imageForService(key),
      images: row?.image_url ? [row.image_url, ...imageSetForService(key).slice(1)] : imageSetForService(key),
      icon: iconForService(key),
    };
  };


  const services: ServiceVM[] = rows.length
    ? rows.map((r: any) => fromKey(r.key, r))
    : SERVICE_KEYS.map((k) => fromKey(k));

  const getByKey = (key?: string): ServiceVM | undefined =>
    services.find((s) => s.key === key);

  return { services, getByKey, loading: query.isLoading };
}

export interface TestimonialVM {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
}

export function useTestimonials() {
  const { t } = useTranslation();
  const locale = useLocale();

  const query = useQuery({
    queryKey: ['cms', 'testimonials', 'public'],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('published', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const rows = query.data || [];

  const fallback =
    (t('testimonials', { returnObjects: true }) as Array<{ name: string; role: string; text: string }>) || [];

  const testimonials: TestimonialVM[] = rows.length
    ? rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        role: pickLocale(r, 'role', locale, ''),
        text: pickLocale(r, 'quote', locale, ''),
        rating: r.rating ?? 5,
      }))
    : (Array.isArray(fallback) ? fallback : []).map((it, i) => ({
        id: `i18n-${i}`,
        name: it.name,
        role: it.role,
        text: it.text,
        rating: 5,
      }));

  return { testimonials, loading: query.isLoading };
}
