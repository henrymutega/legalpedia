import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const ServiceDetailPage = lazy(() => import("./pages/ServiceDetailPage"));
const NewsResearchPage = lazy(() => import("./pages/NewsResearchPage"));
const LegalDocumentsPage = lazy(() => import("./pages/LegalDocumentspage"));
const LegalDocumentDetailPage = lazy(() => import("./pages/LegalDocumentDetailPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const AIAssistantPage = lazy(() => import("./pages/AIAssistantPage"));
const NewsArticlePage = lazy(() => import("./pages/NewsArticlePage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Dashboard
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage"));
const NewCasePage = lazy(() => import("./pages/dashboard/NewCasePage"));
const CaseDetailPage = lazy(() => import("./pages/dashboard/CaseDetailPage"));
const NewTaskPage = lazy(() => import("./pages/dashboard/NewTaskPage"));
const TaskDetailPage = lazy(() => import("./pages/dashboard/TaskDetailPage"));
const CasesPage = lazy(() => import("./pages/dashboard/CasesPage"));
const TasksPage = lazy(() => import("./pages/dashboard/TasksPage"));
const NotificationsPage = lazy(() => import("./pages/dashboard/NotificationsPage"));
const SettingsPage = lazy(() => import("./pages/dashboard/SettingsPage"));
const TeamPage = lazy(() => import("./pages/dashboard/TeamPage"));
const AnalyticsPage = lazy(() => import("./pages/dashboard/AnalyticsPage"));
const ClientAnalyticsPage = lazy(() => import("./pages/dashboard/ClientAnalyticsPage"));
const AppointmentsPage = lazy(() => import("./pages/dashboard/AppointmentsPage"));
const DocumentsPage = lazy(() => import("./pages/dashboard/DocumentsPage"));
const MessagesPage = lazy(() => import("./pages/dashboard/MessagesPage"));

// Admin
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminServicesPage = lazy(() => import("./pages/admin/AdminServicesPage"));
const AdminTestimonialsPage = lazy(() => import("./pages/admin/AdminTestimonialsPage"));
const AdminPublicationsPage = lazy(() => import("./pages/admin/AdminPublicationsPage"));
const AdminPublicationEditor = lazy(() => import("./pages/admin/AdminPublicationEditor"));
const AdminPostsPage = lazy(() => import("./pages/admin/AdminPostsPage"));
const AdminLeadsPage = lazy(() => import("./pages/admin/AdminLeadsPage"));
const AdminAnalyticsPage = lazy(() => import("./pages/admin/AdminAnalyticsPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminPagesPage = lazy(() => import("./pages/admin/AdminPagesPage"));
const AdminTeamPage = lazy(() => import("./pages/admin/AdminTeamPage"));
const AdminFaqsPage = lazy(() => import("./pages/admin/AdminFaqsPage"));
const AdminMediaPage = lazy(() => import("./pages/admin/AdminMediaPage"));
const AdminSeoPage = lazy(() => import("./pages/admin/AdminSeoPage"));
const AdminLegalCategoriesPage = lazy(() => import("./pages/admin/AdminLegalCategoriesPage"));
const AdminDocumentPaymentsPage = lazy(() => import("./pages/admin/AdminDocumentPaymentsPage"));


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen h-screen">Loading...</div>}>
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
            <Route path="/reset-password" element={<ResetPasswordPage />} />
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
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
