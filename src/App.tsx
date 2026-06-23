import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ScrollToTop from "./components/ScrollToTop";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import NewsResearchPage from "./pages/NewsResearchPage";
import LegalDocumentsPage from "./pages/LegalDocumentspage";
import LegalDocumentDetailPage from "./pages/LegalDocumentDetailPage";

import AdminLegalCategoriesPage from "./pages/admin/AdminLegalCategoriesPage";
import AdminDocumentPaymentsPage from "./pages/admin/AdminDocumentPaymentsPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import AIAssistantPage from "./pages/AIAssistantPage";
import NotFound from "./pages/NotFound";
import DashboardPage from "./pages/dashboard/DashboardPage";
import NewCasePage from "./pages/dashboard/NewCasePage";
import CaseDetailPage from "./pages/dashboard/CaseDetailPage";
import NewTaskPage from "./pages/dashboard/NewTaskPage";
import TaskDetailPage from "./pages/dashboard/TaskDetailPage";
import CasesPage from "./pages/dashboard/CasesPage";
import TasksPage from "./pages/dashboard/TasksPage";
import NotificationsPage from "./pages/dashboard/NotificationsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import TeamPage from "./pages/dashboard/TeamPage";
import AnalyticsPage from "./pages/dashboard/AnalyticsPage";
import ClientAnalyticsPage from "./pages/dashboard/ClientAnalyticsPage";
import AppointmentsPage from "./pages/dashboard/AppointmentsPage";
import DocumentsPage from "./pages/dashboard/DocumentsPage";
import MessagesPage from "./pages/dashboard/MessagesPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminServicesPage from "./pages/admin/AdminServicesPage";
import AdminTestimonialsPage from "./pages/admin/AdminTestimonialsPage";
import AdminPublicationsPage from "./pages/admin/AdminPublicationsPage";
import AdminPublicationEditor from "./pages/admin/AdminPublicationEditor";
import NewsArticlePage from "./pages/NewsArticlePage";
import AdminPostsPage from "./pages/admin/AdminPostsPage";
import AdminLeadsPage from "./pages/admin/AdminLeadsPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminPagesPage from "./pages/admin/AdminPagesPage";
import AdminTeamPage from "./pages/admin/AdminTeamPage";
import AdminFaqsPage from "./pages/admin/AdminFaqsPage";
import AdminMediaPage from "./pages/admin/AdminMediaPage";
import AdminSeoPage from "./pages/admin/AdminSeoPage";
import ProtectedRoute from "./components/ProtectedRoute";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:serviceId" element={<ServiceDetailPage />} />
            <Route path="/services/:serviceId/:subId" element={<ServiceDetailPage />} />
            <Route path="/publications" element={<NewsResearchPage />} />
            <Route path="/news-research" element={<NewsResearchPage />} />
            <Route path="/news-research/:slug" element={<NewsArticlePage />} />
            <Route path="/legal-documents" element={<LegalDocumentsPage />} />
            <Route path="/legal-documents/:id" element={<LegalDocumentDetailPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/ai-assistant" element={<AIAssistantPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/dashboard/new" element={<ProtectedRoute><NewCasePage /></ProtectedRoute>} />
            <Route path="/dashboard/cases" element={<ProtectedRoute><CasesPage /></ProtectedRoute>} />
            <Route path="/dashboard/cases/:id" element={<ProtectedRoute><CaseDetailPage /></ProtectedRoute>} />
            <Route path="/dashboard/tasks" element={<ProtectedRoute allow={['lawyer','admin','super_admin']}><TasksPage /></ProtectedRoute>} />
            <Route path="/dashboard/tasks/new" element={<ProtectedRoute allow={['lawyer','admin','super_admin']}><NewTaskPage /></ProtectedRoute>} />
            <Route path="/dashboard/tasks/:id" element={<ProtectedRoute><TaskDetailPage /></ProtectedRoute>} />
            <Route path="/dashboard/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/dashboard/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/dashboard/team" element={<ProtectedRoute allow={['admin','super_admin']}><TeamPage /></ProtectedRoute>} />
            <Route path="/dashboard/analytics" element={<ProtectedRoute allow={['admin','super_admin']}><AnalyticsPage /></ProtectedRoute>} />
            <Route path="/dashboard/my-analytics" element={<ProtectedRoute><ClientAnalyticsPage /></ProtectedRoute>} />
            <Route path="/dashboard/appointments" element={<ProtectedRoute allow={['lawyer','admin','super_admin']}><AppointmentsPage /></ProtectedRoute>} />
            <Route path="/dashboard/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
            <Route path="/dashboard/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<ProtectedRoute allow={['admin','super_admin']}><AdminDashboardPage /></ProtectedRoute>} />
            <Route path="/admin/pages" element={<ProtectedRoute allow={['admin','super_admin']}><AdminPagesPage /></ProtectedRoute>} />
            <Route path="/admin/services" element={<ProtectedRoute allow={['admin','super_admin']}><AdminServicesPage /></ProtectedRoute>} />
            <Route path="/admin/testimonials" element={<ProtectedRoute allow={['admin','super_admin']}><AdminTestimonialsPage /></ProtectedRoute>} />
            <Route path="/admin/publications" element={<ProtectedRoute allow={['admin','super_admin']}><AdminPublicationsPage /></ProtectedRoute>} />
            <Route path="/admin/publications/new" element={<ProtectedRoute allow={['admin','super_admin']}><AdminPublicationEditor /></ProtectedRoute>} />
            <Route path="/admin/publications/:id" element={<ProtectedRoute allow={['admin','super_admin']}><AdminPublicationEditor /></ProtectedRoute>} />
            <Route path="/admin/posts" element={<ProtectedRoute allow={['admin','super_admin']}><AdminPostsPage /></ProtectedRoute>} />
            <Route path="/admin/team" element={<ProtectedRoute allow={['admin','super_admin']}><AdminTeamPage /></ProtectedRoute>} />
            <Route path="/admin/faqs" element={<ProtectedRoute allow={['admin','super_admin']}><AdminFaqsPage /></ProtectedRoute>} />
            <Route path="/admin/media" element={<ProtectedRoute allow={['admin','super_admin']}><AdminMediaPage /></ProtectedRoute>} />
            <Route path="/admin/seo" element={<ProtectedRoute allow={['admin','super_admin']}><AdminSeoPage /></ProtectedRoute>} />
            <Route path="/admin/leads" element={<ProtectedRoute allow={['admin','super_admin']}><AdminLeadsPage /></ProtectedRoute>} />
            <Route path="/admin/legal-documents" element={<Navigate to="/admin/publications?type=legal_document" replace />} />
            <Route path="/admin/legal-categories" element={<ProtectedRoute allow={['admin','super_admin']}><AdminLegalCategoriesPage /></ProtectedRoute>} />
            <Route path="/admin/document-payments" element={<ProtectedRoute allow={['admin','super_admin']}><AdminDocumentPaymentsPage /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute allow={['admin','super_admin']}><AdminAnalyticsPage /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allow={['admin','super_admin']}><AdminUsersPage /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
