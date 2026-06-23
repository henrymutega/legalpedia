import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Lead {
  id: string;
  name: string;
  email: string;
  message: string | null;
  created_at: string;
}

const AdminLeadsPage = () => {
  const { t } = useTranslation();
  const [leads, setLeads] = useState<Lead[]>([]);
  const { toast } = useToast();

  const fetchLeads = async () => {
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    setLeads(data || []);
  };

  useEffect(() => { fetchLeads(); }, []);

  const handleDelete = async (id: string) => {
    await supabase.from('leads').delete().eq('id', id);
    toast({ title: t('admin.leads.deleted') });
    fetchLeads();
  };

  return (
    <AdminLayout>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">{t('admin.leads.title')}</h1>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.common.name')}</TableHead>
              <TableHead>{t('admin.common.email')}</TableHead>
              <TableHead>{t('admin.leads.message')}</TableHead>
              <TableHead>{t('admin.common.date')}</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map(lead => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell className="max-w-xs truncate">{lead.message || '—'}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(lead.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <button onClick={() => handleDelete(lead.id)} className="text-destructive hover:text-destructive/80">
                    <Trash2 size={16} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
            {leads.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  {t('admin.leads.no_leads')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
};

export default AdminLeadsPage;
