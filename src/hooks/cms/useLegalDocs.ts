import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const STALE = 60_000;

export function useLegalCategories() {
  return useQuery({
    queryKey: ['legal_doc_categories'],
    staleTime: STALE,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_doc_categories')
        .select('*')
        .eq('published', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });
}

export type PubType = 'news' | 'legal_document';

export interface LegalDocsFilters {
  type?: PubType;
  categoryId?: string | null;
  search?: string;
  priceFilter?: 'all' | 'free' | 'paid';
  sort?: 'newest' | 'popular' | 'price_asc' | 'price_desc';
  publishedOnly?: boolean;
}

export function useLegalDocuments(filters: LegalDocsFilters = {}) {
  const {
    type,
    categoryId,
    search,
    priceFilter = 'all',
    sort = 'newest',
    publishedOnly = true,
  } = filters;
  return useQuery({
    queryKey: ['legal_documents', type || 'any', categoryId || 'all', search || '', priceFilter, sort, publishedOnly],
    staleTime: STALE,
    queryFn: async () => {
      let q = supabase.from('legal_documents').select('*');
      if (publishedOnly) q = q.eq('status', 'published' as any);
      if (type) q = q.eq('type', type as any);
      if (categoryId) q = q.eq('category_id', categoryId);
      if (priceFilter === 'free') q = q.eq('is_free', true);
      if (priceFilter === 'paid') q = q.eq('is_free', false).gt('price_cents', 0);
      if (search && search.trim()) {
        const s = `%${search.trim()}%`;
        q = q.or(`title.ilike.${s},title_en.ilike.${s},title_zh.ilike.${s},title_mn.ilike.${s},description.ilike.${s},summary.ilike.${s}`);
      }
      switch (sort) {
        case 'popular': q = q.order('download_count', { ascending: false }); break;
        case 'price_asc': q = q.order('price_cents', { ascending: true }); break;
        case 'price_desc': q = q.order('price_cents', { ascending: false }); break;
        default: q = q.order('created_at', { ascending: false });
      }
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useLegalDocument(id?: string) {
  return useQuery({
    queryKey: ['legal_document', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from('legal_documents').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useLegalDocumentBySlug(slug?: string) {
  return useQuery({
    queryKey: ['legal_document_by_slug', slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('slug', slug as string)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useMyPurchases() {
  return useQuery({
    queryKey: ['my_legal_purchases'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from('legal_doc_purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'paid');
      if (error) throw error;
      return data || [];
    },
  });
}
