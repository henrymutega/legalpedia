import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Briefcase, ListChecks } from 'lucide-react';
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import { supabase } from '@/integrations/supabase/client';

interface Hit { id: string; title: string; kind: 'case' | 'task'; status?: string }

const GlobalSearch = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault(); setOpen(o => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const run = async () => {
      const term = q.trim();
      const pat = term ? `%${term}%` : '%';
      const [cases, tasks] = await Promise.all([
        supabase.from('cases').select('id, title, status').ilike('title', pat).order('created_at', { ascending: false }).limit(8),
        supabase.from('tasks').select('id, title, status').ilike('title', pat).order('created_at', { ascending: false }).limit(8),
      ]);
      if (cancelled) return;
      const out: Hit[] = [
        ...((cases.data || []).map(c => ({ id: c.id, title: c.title, status: c.status, kind: 'case' as const }))),
        ...((tasks.data || []).map(c => ({ id: c.id, title: c.title, status: c.status, kind: 'task' as const }))),
      ];
      setHits(out);
    };
    const id = setTimeout(run, 150);
    return () => { cancelled = true; clearTimeout(id); };
  }, [q, open]);

  const go = (h: Hit) => {
    setOpen(false);
    navigate(h.kind === 'case' ? `/dashboard/cases/${h.id}` : `/dashboard/tasks/${h.id}`);
  };

  const cases = hits.filter(h => h.kind === 'case');
  const tasks = hits.filter(h => h.kind === 'task');

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden sm:inline-flex items-center gap-2 px-2.5 h-8 rounded-md bg-primary-foreground/10 text-primary-foreground/80 hover:bg-primary-foreground/15 text-xs"
        aria-label="Search"
      >
        <Search size={14} />
        <span className="hidden md:inline">{String(t('dashboard.search_cases', 'Search...'))}</span>
        <kbd className="hidden lg:inline ml-1 px-1.5 py-0.5 rounded bg-primary-foreground/10 text-[10px]">⌘K</kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput value={q} onValueChange={setQ} placeholder={String(t('dashboard.search_cases', 'Search cases and tasks...'))} />
        <CommandList>
          <CommandEmpty>{String(t('dashboard.no_cases', 'No results'))}</CommandEmpty>
          {cases.length > 0 && (
            <CommandGroup heading={String(t('nav_dashboard.cases', 'Cases'))}>
              {cases.map(h => (
                <CommandItem key={`c-${h.id}`} value={`case-${h.title}-${h.id}`} onSelect={() => go(h)}>
                  <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{h.title}</span>
                  {h.status && <span className="ml-auto text-[10px] text-muted-foreground">{h.status}</span>}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {tasks.length > 0 && (
            <CommandGroup heading={String(t('nav_dashboard.tasks', 'Tasks'))}>
              {tasks.map(h => (
                <CommandItem key={`t-${h.id}`} value={`task-${h.title}-${h.id}`} onSelect={() => go(h)}>
                  <ListChecks className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{h.title}</span>
                  {h.status && <span className="ml-auto text-[10px] text-muted-foreground">{h.status}</span>}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default GlobalSearch;
