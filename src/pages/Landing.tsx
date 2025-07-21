import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { LandingHero } from '@/components/landing/LandingHero';
import { LandingDemo } from '@/components/landing/LandingDemo';
import { LandingSocialProof } from '@/components/landing/LandingSocialProof';
import { LandingSignup } from '@/components/landing/LandingSignup';
import { LandingEmailCapture } from '@/components/landing/LandingEmailCapture';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { NeuralThinkingAnimation } from '@/components/ui/neural-thinking-animation';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ProcessingStep {
  id: number;
  text: string;
  completed: boolean;
  current: boolean;
}

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [demoText, setDemoText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [showProcessingAnimation, setShowProcessingAnimation] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([
    { id: 1, text: "Capturing your thoughts...", completed: false, current: false },
    { id: 2, text: "Connecting ideas...", completed: false, current: false },
    { id: 3, text: "Finding hidden patterns...", completed: false, current: false },
    { id: 4, text: "Building your insights...", completed: false, current: false },
    { id: 5, text: "Crafting action items...", completed: false, current: false },
  ]);

  // If user is authenticated but came from landing page signup, allow them to see results first
  // Only redirect if they didn't just sign up to view demo results
  if (user && !showEmailCapture && !showResults) {
    navigate('/');
    return null;
  }

  const handleDemo = async () => {
    if (!demoText.trim()) return;
    
    setIsProcessing(true);
    setShowProcessingAnimation(true);
    
    // Reset processing steps
    setProcessingSteps(prev => prev.map(step => ({
      ...step,
      completed: false,
      current: false
    })));

    // Animate through processing steps like logged-in users see
    const processingInterval = setInterval(() => {
      setProcessingSteps(prev => {
        const nextStepIndex = prev.findIndex(step => !step.completed && !step.current);
        if (nextStepIndex >= 0) {
          const newSteps = [...prev];
          if (nextStepIndex > 0) {
            newSteps[nextStepIndex - 1].current = false;
            newSteps[nextStepIndex - 1].completed = true;
          }
          newSteps[nextStepIndex].current = true;
          return newSteps;
        }
        return prev;
      });
    }, 1200);

    // Simulate full processing time (5 steps * 1.2s = 6s total)
    await new Promise(resolve => setTimeout(resolve, 6500));
    
    // Complete all steps
    clearInterval(processingInterval);
    setProcessingSteps(prev => prev.map(step => ({
      ...step,
      completed: true,
      current: false
    })));
    
    setIsProcessing(false);
    setShowProcessingAnimation(false);
    
    // Always show email capture for non-authenticated users to sign up
    if (!user) {
      setShowEmailCapture(true);
    } else {
      // If user is authenticated, redirect to gallery instead of home to avoid redirect loop
      navigate('/gallery');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary/60 flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full" />
            </div>
            <span className="text-xl font-bold">Scatterbrain</span>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/auth')}
            className="border-primary/20 hover:border-primary/40"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <LandingHero 
        demoText={demoText}
        setDemoText={setDemoText}
        handleDemo={handleDemo}
        isProcessing={isProcessing}
      />

      {/* Processing Animation - Full Screen Overlay */}
      {showProcessingAnimation && (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-background/95 via-primary/20 to-background/95 backdrop-blur-sm flex items-center justify-center">
          <div className="max-w-md w-full mx-4">
            <Card className="bg-gradient-to-br from-card/90 to-card/70 border-primary/30 shadow-2xl backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                {/* Neural Animation */}
                <div className="mb-8">
                  <NeuralThinkingAnimation />
                </div>
                
                {/* Title */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-3">
                    Finding Your Method
                  </h2>
                  <p className="text-muted-foreground">
                    Your thoughts are finding their perfect form
                  </p>
                </div>

                {/* Progress Indicators */}
                <div className="space-y-4">
                  {processingSteps.map((step) => (
                    <motion.div
                      key={step.id}
                      className="flex items-center justify-center space-x-3"
                      initial={{ opacity: 0.3 }}
                      animate={{ opacity: step.completed || step.current ? 1 : 0.3 }}
                    >
                      <div className="w-6 h-6 rounded-full flex items-center justify-center border-2 border-primary/30 flex-shrink-0">
                        {step.completed ? (
                          <CheckCircle className="w-4 h-4 text-primary" />
                        ) : step.current ? (
                          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                        ) : (
                          <div className="w-2 h-2 bg-muted-foreground/50 rounded-full" />
                        )}
                      </div>
                      <span className={`text-sm ${step.completed || step.current ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.text}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Email Capture */}
      {showEmailCapture && (
        <LandingEmailCapture 
          demoText={demoText}
          onEmailSubmitted={() => navigate('/gallery')}
        />
      )}

      {/* How It Works Section */}
      <HowItWorks />

      {/* Social Proof */}
      <LandingSocialProof />

      {/* Signup CTA */}
      <LandingSignup />

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 Scatterbrain. A method for your madness.</p>
        </div>
      </footer>
    </div>
  );
}