import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminShell from '@/components/admin/AdminShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Image as ImageIcon, Upload, Trash2, Copy, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

type Asset = {
  id: string;
  bucket: string;
  path: string;
  filename: string;
  mime_type: string | null;
  size_bytes: number | null;
  alt: string | null;
  created_at: string;
};

const publicUrl = (path: string) =>
  supabase.storage.from('media').getPublicUrl(path).data.publicUrl;

const formatBytes = (n?: number | null) => {
  if (!n) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

const AdminMediaPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [rows, setRows] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('media_assets')
      .select('*').order('created_at', { ascending: false });
    if (error) toast({ title: 'Failed to load', description: error.message, variant: 'destructive' });
    setRows((data as Asset[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const onPick = () => fileRef.current?.click();

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop() || 'bin';
        const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const up = await supabase.storage.from('media').upload(path, file, { upsert: false, contentType: file.type });
        if (up.error) throw up.error;
        const ins = await supabase.from('media_assets').insert({
          bucket: 'media', path, filename: file.name, mime_type: file.type,
          size_bytes: file.size, uploaded_by: user?.id || null,
        });
        if (ins.error) throw ins.error;
      }
      toast({ title: 'Uploaded' });
      load();
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const remove = async (a: Asset) => {
    if (!confirm(`Delete ${a.filename}?`)) return;
    const rm = await supabase.storage.from('media').remove([a.path]);
    if (rm.error) { toast({ title: 'Storage delete failed', description: rm.error.message, variant: 'destructive' }); return; }
    const { error } = await supabase.from('media_assets').delete().eq('id', a.id);
    if (error) { toast({ title: 'Record delete failed', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Deleted' }); load();
  };

  const copyUrl = async (a: Asset) => {
    await navigator.clipboard.writeText(publicUrl(a.path));
    toast({ title: 'URL copied' });
  };

  const filtered = rows.filter(r => r.filename.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminShell
      subtitle="Upload and reuse images and documents across the site."
      actions={
        <>
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="h-9 w-44" />
          <input ref={fileRef} type="file" multiple className="hidden" onChange={onUpload} />
          <Button onClick={onPick} disabled={uploading}>
            <Upload className="h-4 w-4 mr-1.5" /> {uploading ? 'Uploading…' : 'Upload'}
          </Button>
        </>
      }
    >
      <Card>
        <CardContent className="p-4">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gold/15 text-gold flex items-center justify-center"><ImageIcon className="h-6 w-6" /></div>
              <p className="text-sm text-muted-foreground">No media yet. Upload your first image or document.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filtered.map(a => {
                const isImg = (a.mime_type || '').startsWith('image/');
                const url = publicUrl(a.path);
                return (
                  <div key={a.id} className="group relative border border-border rounded-md overflow-hidden bg-muted/30">
                    <div className="aspect-square flex items-center justify-center bg-muted/50">
                      {isImg ? (
                        <img src={url} alt={a.alt || a.filename} loading="lazy" className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="p-2 text-xs">
                      <div className="truncate font-medium" title={a.filename}>{a.filename}</div>
                      <div className="text-muted-foreground">{formatBytes(a.size_bytes)}</div>
                    </div>
                    <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => copyUrl(a)}><Copy className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="destructive" className="h-7 w-7" onClick={() => remove(a)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminShell>
  );
};

export default AdminMediaPage;
