import { Helmet } from 'react-helmet-async';
import { useSeo } from '@/hooks/cms/useCms';
import { pickLocale, useLocale } from '@/hooks/cms/useLocaleField';

interface Props {
  pageKey: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
  canonical?: string;
}

const SeoHead = ({ pageKey, fallbackTitle, fallbackDescription, canonical }: Props) => {
  const { data } = useSeo(pageKey);
  const locale = useLocale();

  const title = pickLocale(data, 'title', locale, fallbackTitle || '');
  const description = pickLocale(data, 'description', locale, fallbackDescription || '');
  const keywords = pickLocale(data, 'keywords', locale, '');
  const ogImage = data?.og_image || undefined;
  const canon = canonical || data?.canonical_url || undefined;

  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {canon && <link rel="canonical" href={canon} />}
    </Helmet>
  );
};

export default SeoHead;
