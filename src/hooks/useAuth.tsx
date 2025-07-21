import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, firstName?: string, displayName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Auth hook initializing...');
    let mounted = true;
    let sessionInitialized = false;
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', { 
          event, 
          session: !!session, 
          user: !!session?.user,
          userId: session?.user?.id,
          email: session?.user?.email 
        });
        
        // Update state atomically
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only set loading to false if this is the first initialization
        if (!sessionInitialized) {
          sessionInitialized = true;
          setLoading(false);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      
      if (error) {
        console.error('Error getting initial session:', error);
        setLoading(false);
        return;
      }
      
      console.log('Initial session check:', { 
        session: !!session, 
        user: !!session?.user,
        userId: session?.user?.id,
        email: session?.user?.email 
      });
      
      // Only update if auth state change hasn't already handled this
      if (!sessionInitialized) {
        setSession(session);
        setUser(session?.user ?? null);
        sessionInitialized = true;
        setLoading(false);
      }
    }).catch((error) => {
      if (!mounted) return;
      console.error('Error in getSession:', error);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    }

    return { error };
  };

  const signUp = async (email: string, password: string, firstName?: string, displayName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const userData: Record<string, any> = {};
    if (firstName) userData.first_name = firstName;
    if (displayName) userData.display_name = displayName;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: Object.keys(userData).length > 0 ? userData : undefined,
      }
    });

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome!",
        description: "Please check your email to verify your account.",
      });
    }

    return { error };
  };

  const signOut = async () => {
    console.log('Starting sign out process...');
    
    try {
      const { error } = await supabase.auth.signOut();
      console.log('Sign out result:', { error });
      
      if (error) {
        // If it's just a session missing error, still clear local state
        if (error.message === "Auth session missing!") {
          console.log('Session already missing, clearing local state...');
          setSession(null);
          setUser(null);
          toast({
            title: "Signed out",
            description: "You have been signed out successfully.",
          });
        } else {
          toast({
            title: "Sign out failed",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
        });
      }
    } catch (err) {
      console.error('Sign out catch block:', err);
      // Clear local state even if sign out fails
      setSession(null);
      setUser(null);
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};