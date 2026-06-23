import { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type Locale = 'en' | 'zh' | 'mn';
export const LOCALES: Locale[] = ['en', 'zh', 'mn'];

interface Props {
  render: (locale: Locale) => ReactNode;
  defaultLocale?: Locale;
}

const labels: Record<Locale, string> = { en: 'English', zh: '中文', mn: 'Монгол' };

const LocaleTabs = ({ render, defaultLocale = 'en' }: Props) => (
  <Tabs defaultValue={defaultLocale} className="w-full">
    <TabsList className="mb-3">
      {LOCALES.map(l => (
        <TabsTrigger key={l} value={l}>{labels[l]}</TabsTrigger>
      ))}
    </TabsList>
    {LOCALES.map(l => (
      <TabsContent key={l} value={l} className="space-y-3 mt-0">{render(l)}</TabsContent>
    ))}
  </Tabs>
);

export default LocaleTabs;
