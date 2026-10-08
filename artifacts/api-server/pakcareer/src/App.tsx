import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import { PublicLayout } from '@/components/layout/PublicLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AuthProvider } from '@/contexts/AuthContext';
import { AdminGuard } from '@/components/AdminGuard';

// Public Pages
import Home from '@/pages/Home';
import Jobs from '@/pages/Jobs';
import JobDetail from '@/pages/JobDetail';
import Results from '@/pages/Results';
import RollNoSlips from '@/pages/RollNoSlips';
import Admissions from '@/pages/Admissions';
import Scholarships from '@/pages/Scholarships';
import Blog from '@/pages/Blog';
import BlogPostDetail from '@/pages/BlogPostDetail';
import Mcqs from '@/pages/Mcqs';
import Papers from '@/pages/Papers';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import Departments from '@/pages/Departments';
import Cities from '@/pages/Cities';
import DepartmentDetail from '@/pages/DepartmentDetail';
import CityDetail from '@/pages/CityDetail';
import AgencyJobs from '@/pages/AgencyJobs';
import SignIn from '@/pages/SignIn';

// Admin Pages
import AdminLogin from '@/pages/admin/Login';
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminJobs from '@/pages/admin/Jobs';
import AdminDepartments from '@/pages/admin/Departments';
import AdminCities from '@/pages/admin/Cities';
import AdminCategories from '@/pages/admin/Categories';
import AdminResults from '@/pages/admin/Results';
import AdminAdmissions from '@/pages/admin/Admissions';
import AdminBlog from '@/pages/admin/Blog';
import AdminMcqs from '@/pages/admin/Mcqs';
import AdminPapers from '@/pages/admin/Papers';
import AdminSettings from '@/pages/admin/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminGuard>
  );
}

function Router() {
  return (
    <Switch>
      {/* Admin Login (unprotected) */}
      <Route path="/admin/login">
        <AdminLogin />
      </Route>
      <Route path="/signin">
        <SignIn />
      </Route>

      {/* Admin Routes (protected) */}
      <Route path="/admin">
        <ProtectedAdmin><AdminDashboard /></ProtectedAdmin>
      </Route>
      <Route path="/admin/jobs">
        <ProtectedAdmin><AdminJobs /></ProtectedAdmin>
      </Route>
      <Route path="/admin/departments">
        <ProtectedAdmin><AdminDepartments /></ProtectedAdmin>
      </Route>
      <Route path="/admin/cities">
        <ProtectedAdmin><AdminCities /></ProtectedAdmin>
      </Route>
      <Route path="/admin/categories">
        <ProtectedAdmin><AdminCategories /></ProtectedAdmin>
      </Route>
      <Route path="/admin/results">
        <ProtectedAdmin><AdminResults /></ProtectedAdmin>
      </Route>
      <Route path="/admin/admissions">
        <ProtectedAdmin><AdminAdmissions /></ProtectedAdmin>
      </Route>
      <Route path="/admin/blog">
        <ProtectedAdmin><AdminBlog /></ProtectedAdmin>
      </Route>
      <Route path="/admin/mcqs">
        <ProtectedAdmin><AdminMcqs /></ProtectedAdmin>
      </Route>
      <Route path="/admin/papers">
        <ProtectedAdmin><AdminPapers /></ProtectedAdmin>
      </Route>
      <Route path="/admin/settings">
        <ProtectedAdmin><AdminSettings /></ProtectedAdmin>
      </Route>

      {/* Public Routes */}
      <Route path="/">
        <PublicLayout><Home /></PublicLayout>
      </Route>

      {/* Jobs */}
      <Route path="/jobs">
        <PublicLayout><Jobs /></PublicLayout>
      </Route>
      <Route path="/jobs/government">
        <PublicLayout><Jobs type="government" /></PublicLayout>
      </Route>
      <Route path="/jobs/private">
        <PublicLayout><Jobs type="private" /></PublicLayout>
      </Route>
      {/* Agency-specific job pages */}
      <Route path="/jobs/fpsc">
        <PublicLayout><AgencyJobs agencySlug="fpsc" /></PublicLayout>
      </Route>
      <Route path="/jobs/ppsc">
        <PublicLayout><AgencyJobs agencySlug="ppsc" /></PublicLayout>
      </Route>
      <Route path="/jobs/nts">
        <PublicLayout><AgencyJobs agencySlug="nts" /></PublicLayout>
      </Route>
      <Route path="/jobs/pts">
        <PublicLayout><AgencyJobs agencySlug="pts" /></PublicLayout>
      </Route>
      <Route path="/jobs/spsc">
        <PublicLayout><AgencyJobs agencySlug="spsc" /></PublicLayout>
      </Route>
      <Route path="/jobs/kppsc">
        <PublicLayout><AgencyJobs agencySlug="kppsc" /></PublicLayout>
      </Route>
      <Route path="/jobs/bpsc">
        <PublicLayout><AgencyJobs agencySlug="bpsc" /></PublicLayout>
      </Route>
      <Route path="/jobs/ajkpsc">
        <PublicLayout><AgencyJobs agencySlug="ajkpsc" /></PublicLayout>
      </Route>
      <Route path="/jobs/:id">
        {(params) => <PublicLayout><JobDetail id={params.id} /></PublicLayout>}
      </Route>

      {/* Departments & Cities */}
      <Route path="/departments">
        <PublicLayout><Departments /></PublicLayout>
      </Route>
      <Route path="/departments/:id">
        {(params) => <PublicLayout><DepartmentDetail id={params.id} /></PublicLayout>}
      </Route>
      <Route path="/cities">
        <PublicLayout><Cities /></PublicLayout>
      </Route>
      <Route path="/cities/:id">
        {(params) => <PublicLayout><CityDetail id={params.id} /></PublicLayout>}
      </Route>

      {/* Results & Slips */}
      <Route path="/results">
        <PublicLayout><Results /></PublicLayout>
      </Route>
      <Route path="/roll-no-slips">
        <PublicLayout><RollNoSlips /></PublicLayout>
      </Route>

      {/* Admissions */}
      <Route path="/admissions">
        <PublicLayout><Admissions /></PublicLayout>
      </Route>
      <Route path="/scholarships">
        <PublicLayout><Scholarships /></PublicLayout>
      </Route>

      {/* Blog */}
      <Route path="/blog">
        <PublicLayout><Blog /></PublicLayout>
      </Route>
      <Route path="/blog/:id">
        {(params) => <PublicLayout><BlogPostDetail id={params.id} /></PublicLayout>}
      </Route>

      {/* MCQs & Papers */}
      <Route path="/mcqs">
        <PublicLayout><Mcqs /></PublicLayout>
      </Route>
      <Route path="/papers">
        <PublicLayout><Papers /></PublicLayout>
      </Route>

      {/* Static pages */}
      <Route path="/about">
        <PublicLayout><About /></PublicLayout>
      </Route>
      <Route path="/contact">
        <PublicLayout><Contact /></PublicLayout>
      </Route>
      <Route path="/privacy-policy">
        <PublicLayout><Privacy /></PublicLayout>
      </Route>
      <Route path="/terms">
        <PublicLayout><Terms /></PublicLayout>
      </Route>

      {/* 404 */}
      <Route>
        <PublicLayout><NotFound /></PublicLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
