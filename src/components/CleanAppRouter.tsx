import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { CleanLayout } from './layouts/CleanLayout';
import CleanHomePage from '@/pages/CleanHomePage';
import CleanContentStudio from '@/pages/CleanContentStudio';
import CleanInsightGallery from '@/pages/CleanInsightGallery';
import CleanAdvisoryBoard from '@/pages/CleanAdvisoryBoard';
import CleanSynthesis from '@/pages/CleanSynthesis';
import Profile from '@/pages/Profile';
import ViralLanding from '@/pages/ViralLanding';

export function CleanAppRouter() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (loading) return;
    
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
  }, [user, loading, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-caption text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  // Show viral landing page for non-authenticated users
  if (!user && (location.pathname === '/landing' || location.pathname === '/')) {
    return <ViralLanding />;
  }

  // Show authenticated app routes for authenticated users  
  if (user) {
    const path = location.pathname;
    
    // If authenticated user is on landing page, show the updated design
    if (path === '/landing') {
      return <ViralLanding />;
    }
    
    // Map routes to components
    const getComponent = () => {
      switch (path) {
        case '/': return <CleanHomePage />;
        case '/content': return <CleanContentStudio />;
        case '/gallery': return <CleanInsightGallery />;
        case '/board': return <CleanAdvisoryBoard />;
        case '/synthesis': return <CleanSynthesis />;
        case '/profile': return <Profile />;
        default:
          return <CleanHomePage />; // Default home
      }
    };
    
    return (
      <CleanLayout>
        {getComponent()}
      </CleanLayout>
    );
  }

  // Fallback - shouldn't reach here due to useEffect redirects
  return <ViralLanding />;
}