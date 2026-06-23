import { ReactNode } from 'react';
import AdminShell from './admin/AdminShell';

// Backwards-compatible wrapper. New admin pages should use AdminShell directly.
const AdminLayout = ({ children }: { children: ReactNode }) => <AdminShell>{children}</AdminShell>;

export default AdminLayout;
