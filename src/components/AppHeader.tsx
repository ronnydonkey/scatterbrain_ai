import { NavLink, useNavigate } from 'react-router-dom';
import { ScatterBrainLogo } from '@/components/ui/scatterbrain-logo';
import UserAccountDropdown from './UserAccountDropdown';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AppHeader = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [organization, setOrganization] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (profile?.organization_id) {
        const { data: org } = await supabase
          .from('organizations')
          .select('subscription_tier')
          .eq('id', profile.organization_id)
          .single();
        
        setOrganization(org);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const navigationItems = [
    { name: 'Thoughts', path: '/', exact: true },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Board', path: '/board' },
    { name: 'Profile', path: '/profile' }
  ];

  return (
    <header className="bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Enhanced Logo */}
          <div 
            className="cursor-pointer transition-transform duration-200 hover:scale-105"
            onClick={() => navigate('/')}
          >
            <ScatterBrainLogo 
              size="md" 
              variant="horizontal" 
              premium={organization?.subscription_tier === 'premium'}
              animate={true}
            />
          </div>

          {/* Enhanced Navigation */}
          <nav className="flex items-center space-x-1">
            {navigationItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-neural-purple to-neural-blue text-white shadow-neural'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:shadow-glow-sm'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* User Account */}
          <UserAccountDropdown organization={organization} />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;