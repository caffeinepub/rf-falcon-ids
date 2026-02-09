import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

import AppShell from './components/AppShell';
import AuthGate from './components/AuthGate';
import AdminGate from './components/AdminGate';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import FeaturesPage from './pages/FeaturesPage';
import ContactPage from './pages/ContactPage';
import SignInPage from './pages/SignInPage';
import NotFoundPage from './pages/NotFoundPage';
import ErrorPage from './pages/ErrorPage';
import PricingPage from './pages/PricingPage';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const NewOrderPage = lazy(() => import('./pages/NewOrderPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const AdminPanelPage = lazy(() => import('./pages/AdminPanelPage'));
const CartPage = lazy(() => import('./pages/CartPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: AppShell,
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
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

const signinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signin',
  component: SignInPage,
});

const pricingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pricing',
  component: PricingPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => (
    <Suspense fallback={<LoadingFallback />}>
      <AuthGate>
        <DashboardPage />
      </AuthGate>
    </Suspense>
  ),
});

const newOrderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders/new',
  component: () => (
    <Suspense fallback={<LoadingFallback />}>
      <AuthGate>
        <NewOrderPage />
      </AuthGate>
    </Suspense>
  ),
});

const orderDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders/$orderId',
  component: () => (
    <Suspense fallback={<LoadingFallback />}>
      <AuthGate>
        <OrderDetailPage />
      </AuthGate>
    </Suspense>
  ),
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: () => (
    <Suspense fallback={<LoadingFallback />}>
      <AuthGate>
        <CartPage />
      </AuthGate>
    </Suspense>
  ),
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <Suspense fallback={<LoadingFallback />}>
      <AuthGate>
        <AdminGate>
          <AdminPanelPage />
        </AdminGate>
      </AuthGate>
    </Suspense>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  featuresRoute,
  contactRoute,
  signinRoute,
  pricingRoute,
  dashboardRoute,
  newOrderRoute,
  orderDetailRoute,
  cartRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <RouterProvider router={router} />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
