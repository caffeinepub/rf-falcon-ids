import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useIsAdmin } from './hooks/auth/useIsAdmin';
import { useEffect, lazy, Suspense } from 'react';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import FeaturesPage from './pages/FeaturesPage';
import ContactPage from './pages/ContactPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import NotFoundPage from './pages/NotFoundPage';
import ErrorPage from './pages/ErrorPage';
import AppShell from './components/AppShell';
import AuthGate from './components/AuthGate';
import AdminGate from './components/AdminGate';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { Loader2, LayoutDashboard } from 'lucide-react';

// Lazy load dashboard and admin pages for code splitting
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const NewOrderPage = lazy(() => import('./pages/NewOrderPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const AdminPanelPage = lazy(() => import('./pages/AdminPanelPage'));

const rootRoute = createRootRoute({
  component: AppShell,
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorPage,
});

function IndexComponent() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading, isFetched } = useIsAdmin();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;

  useEffect(() => {
    if (isAuthenticated && isFetched && !adminLoading) {
      if (isAdmin) {
        navigate({ to: '/admin' });
      } else {
        navigate({ to: '/dashboard' });
      }
    }
  }, [isAuthenticated, isAdmin, adminLoading, isFetched, navigate]);

  if (isAuthenticated && (adminLoading || !isFetched)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return <LandingPage />;
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexComponent,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: AboutPage,
});

const featuresRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/features',
  component: FeaturesPage,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact',
  component: ContactPage,
});

const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signin',
  component: SignInPage,
});

const signUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: SignUpPage,
});

// Dashboard loading fallback
function DashboardLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
        <div className="text-primary text-sm">Loading dashboard...</div>
      </div>
    </div>
  );
}

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => (
    <AuthGate>
      <Suspense fallback={<DashboardLoadingFallback />}>
        <DashboardPage />
      </Suspense>
    </AuthGate>
  ),
});

const newOrderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders/new',
  component: () => (
    <AuthGate>
      <Suspense fallback={<DashboardLoadingFallback />}>
        <NewOrderPage />
      </Suspense>
    </AuthGate>
  ),
});

const orderDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders/$orderId',
  component: () => (
    <AuthGate>
      <Suspense fallback={<DashboardLoadingFallback />}>
        <OrderDetailPage />
      </Suspense>
    </AuthGate>
  ),
});

// Admin loading fallback
function AdminLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <LayoutDashboard className="w-12 h-12 mx-auto text-admin-primary animate-pulse" />
        <div className="text-admin-primary text-sm">
          Loading admin panel...
        </div>
      </div>
    </div>
  );
}

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <AuthGate>
      <AdminGate>
        <Suspense fallback={<AdminLoadingFallback />}>
          <AdminPanelPage />
        </Suspense>
      </AdminGate>
    </AuthGate>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  featuresRoute,
  contactRoute,
  signInRoute,
  signUpRoute,
  dashboardRoute,
  newOrderRoute,
  orderDetailRoute,
  adminRoute,
]);

const router = createRouter({ 
  routeTree,
  defaultNotFoundComponent: NotFoundPage,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function AppContent() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AppContent />
    </ThemeProvider>
  );
}
