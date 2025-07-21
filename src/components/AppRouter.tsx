import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AuthenticatedLayout from './AuthenticatedLayout';
import ErrorBoundary from './ErrorBoundary';
import LandingNew from '@/pages/LandingNew';
import DemoResults from '@/pages/DemoResults';
import ThoughtsPage from '@/pages/ThoughtsPage';
import TrendingPage from '@/pages/TrendingPage';
import GeneratorPage from '@/pages/GeneratorPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import SettingsPage from '@/pages/SettingsPage';
import SimplifiedFlow from '@/pages/SimplifiedFlow';
import InsightGallery from '@/pages/InsightGallery';
import DetailedReport from '@/pages/DetailedReport';
import Profile from '@/pages/Profile';
import Billing from '@/pages/Billing';
import BoardPage from '@/pages/BoardPage';

export function AppRouter() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Timeout handler for loading state
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        setLoadingTimeout(true);
      }, 15000); // 15 second timeout
      
      return () => clearTimeout(timeout);
    } else {
      setLoadingTimeout(false);
    }
  }, [loading]);
  
  useEffect(() => {
    if (loading) return;
    
    // Allow demo-results page for everyone
    if (location.pathname === '/demo-results') {
      return;
    }
    
    // If user is authenticated and on landing page, allow them to stay to see results
    // They can navigate away manually or will be redirected after viewing results
    
    // If user is not authenticated and trying to access protected routes, redirect to landing
    if (!user && !location.pathname.includes('/auth') && !location.pathname.includes('/landing') && location.pathname !== '/') {
      navigate('/landing');
      return;
    }
    
    // If user is not authenticated and on root, redirect to landing
    if (!user && location.pathname === '/') {
      navigate('/landing');
      return;
    }
    
    // If user is authenticated and on root, redirect to main app (capture page)
    if (user && location.pathname === '/') {
      navigate('/capture');
      return;
    }
  }, [user, loading, location.pathname, navigate]);

  if (loading && !loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your neural workspace...</p>
        </div>
      </div>
    );
  }

  // Show timeout error with retry option
  if (loading && loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-4">
          <div className="w-8 h-8 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin mx-auto" />
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">Loading is taking longer than expected</h2>
            <p className="text-muted-foreground text-sm">
              This might be due to a network issue or the authentication service being temporarily unavailable.
            </p>
          </div>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.reload()} 
              className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
            <p className="text-xs text-muted-foreground">
              Error Code: AUTH_TIMEOUT
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  if (!user && (location.pathname === '/landing' || location.pathname === '/')) {
    return <LandingNew />;
  }

  // Show demo results page (accessible without auth)
  if (location.pathname === '/demo-results') {
    return <DemoResults />;
  }

  // Show authenticated app routes for authenticated users  
  if (user) {
    const path = location.pathname;
    
    // If authenticated user is on landing page, allow them to stay
    if (path === '/landing') {
      return <LandingNew />;
    }
    
    // Map routes to components
    const getComponent = () => {
      switch (path) {
        case '/thoughts': return <ThoughtsPage />;
        case '/gallery': return <InsightGallery />;
        case '/capture': return <SimplifiedFlow />;
        case '/profile': return <Profile />;
        case '/billing': return <Billing />;
        case '/trending': return <TrendingPage />;
        case '/generator': return <GeneratorPage />;
        case '/analytics': return <AnalyticsPage />;
        case '/settings': return <SettingsPage />;
        case '/board': return <BoardPage />;
        default:
          if (path.startsWith('/report/')) return <DetailedReport />;
          return <SimplifiedFlow />; // Default home
      }
    };
    
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-background">
          <AuthenticatedLayout>
            <ErrorBoundary 
              fallback={
                <div className="p-8 text-center">
                  <h2 className="text-lg font-semibold mb-2">Page Error</h2>
                  <p className="text-muted-foreground mb-4">This page encountered an error.</p>
                  <button 
                    onClick={() => navigate('/capture')} 
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                  >
                    Go to Home
                  </button>
                </div>
              }
            >
              {getComponent()}
            </ErrorBoundary>
          </AuthenticatedLayout>
        </div>
      </ErrorBoundary>
    );
  }

  // Fallback - shouldn't reach here due to useEffect redirects
  return <LandingNew />;
}