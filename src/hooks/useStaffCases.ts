import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CaseRow {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  client_id: string;
  assigned_lawyer_id: string | null;
  assigned_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CaseFileRow {
  id: string;
  case_id: string;
  filename: string;
  kind: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  uploaded_by: string;
  created_at: string;
}

export interface CaseCommentRow {
  id: string;
  case_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

export const CASE_STATUSES = ['uploaded', 'under_review', 'reviewed', 'completed'] as const;
export const STATUS_LABEL: Record<string, string> = {
  uploaded: 'New / Uploaded',
  under_review: 'Under Review',
  reviewed: 'Reviewed',
  completed: 'Completed',
};
export const STATUS_TONE: Record<string, string> = {
  uploaded: 'bg-blue-100 text-blue-700 border-blue-200',
  under_review: 'bg-amber-100 text-amber-800 border-amber-200',
  reviewed: 'bg-purple-100 text-purple-700 border-purple-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

/** Fetches all cases the current user can see (RLS handles role filtering),
 *  plus latest case_files and case_comments. Subscribes to realtime updates. */
export const useStaffCases = () => {
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [files, setFiles] = useState<CaseFileRow[]>([]);
  const [comments, setComments] = useState<CaseCommentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const [cRes, fRes, cmRes] = await Promise.all([
      supabase.from('cases').select('*').order('created_at', { ascending: false }),
      supabase.from('case_files').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('case_comments').select('*').order('created_at', { ascending: false }).limit(50),
    ]);
    if (cRes.error) setError(cRes.error.message);
    setCases((cRes.data as CaseRow[]) || []);
    setFiles((fRes.data as CaseFileRow[]) || []);
    setComments((cmRes.data as CaseCommentRow[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const ch = supabase
      .channel('staff-cases-stream')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cases' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'case_files' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'case_comments' }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  return { cases, files, comments, loading, error, refresh: load };
};

/** Atomic claim — only succeeds if still unassigned. Relies on RLS policy
 *  "Staff can claim unassigned cases". */
export const claimCase = async (caseId: string, userId: string) => {
  const { data, error } = await supabase
    .from('cases')
    .update({
      assigned_lawyer_id: userId,
      assigned_at: new Date().toISOString(),
      status: 'under_review',
    })
    .eq('id', caseId)
    .is('assigned_lawyer_id', null)
    .select()
    .maybeSingle();
  return { data, error };
};

export const updateCaseStatus = async (caseId: string, status: string) => {
  return supabase.from('cases').update({ status }).eq('id', caseId);
};

/** Admin/super-admin assigns or reassigns a case to a lawyer (or clears it). */
export const assignCase = async (caseId: string, lawyerId: string | null) => {
  return supabase
    .from('cases')
    .update({
      assigned_lawyer_id: lawyerId,
      assigned_at: lawyerId ? new Date().toISOString() : null,
      status: lawyerId ? 'under_review' : 'uploaded',
    })
    .eq('id', caseId);
};
