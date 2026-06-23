import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const STALE = 60_000;

export function useTeam(opts?: { featuredOnly?: boolean; limit?: number }) {
  return useQuery({
    queryKey: ['cms', 'team_members', opts],
    staleTime: STALE,
    queryFn: async () => {
      let q = supabase.from('team_members').select('*').eq('published', true).order('display_order', { ascending: true });
      if (opts?.featuredOnly) q = q.eq('featured', true);
      if (opts?.limit) q = q.limit(opts.limit);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useFaqs(category?: string) {
  return useQuery({
    queryKey: ['cms', 'faqs', category || 'all'],
    staleTime: STALE,
    queryFn: async () => {
      let q = supabase.from('faqs').select('*').eq('published', true).order('display_order', { ascending: true });
      if (category) q = q.eq('category', category);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useSitePage(pageKey: string) {
  return useQuery({
    queryKey: ['cms', 'site_pages', pageKey],
    staleTime: STALE,
    queryFn: async () => {
      const { data, error } = await supabase.from('site_pages').select('*').eq('page_key', pageKey).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useServices() {
  return useQuery({
    queryKey: ['cms', 'services'],
    staleTime: STALE,
    queryFn: async () => {
      const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });
}

export function usePublications(category?: string) {
  return useQuery({
    queryKey: ['cms', 'publications', category || 'all'],
    staleTime: STALE,
    queryFn: async () => {
      let q = supabase.from('publications').select('*').order('date', { ascending: false });
      if (category && category !== 'all') q = q.eq('category', category);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useMediaByTag(tag: string) {
  return useQuery({
    queryKey: ['cms', 'media_assets', 'tag', tag],
    staleTime: STALE,
    queryFn: async () => {
      const { data, error } = await supabase.from('media_assets').select('*').contains('tags', [tag]).order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useSeo(pageKey: string) {
  return useQuery({
    queryKey: ['cms', 'seo_settings', pageKey],
    staleTime: STALE,
    queryFn: async () => {
      const { data, error } = await supabase.from('seo_settings').select('*').eq('page_key', pageKey).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
