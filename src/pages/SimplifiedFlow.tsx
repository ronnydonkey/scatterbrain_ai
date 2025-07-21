import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, FileText, Mic, Upload, ArrowRight, CheckCircle, Sparkles, Check, Loader2, Twitter, Linkedin, Instagram, Calendar, Copy, RotateCcw, Archive, User, ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { usePersonalization } from '@/hooks/usePersonalization';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useSynthesizeStream, generateSessionId, detectUrgency, useOfflineInsights } from '@/hooks/api';
import { VoiceMemoRecorder } from '@/components/VoiceMemoRecorder';
import { AdaptationIndicator } from '@/components/AdaptationIndicator';
import { SmartSourcesDisplay } from '@/components/SmartSourcesDisplay';
import { useAdaptiveIntelligence } from '@/hooks/useAdaptiveIntelligence';
import { NeuralThinkingAnimation } from '@/components/ui/neural-thinking-animation';
import { NeuralSynthesisOverlay } from '@/components/ui/neural-synthesis-overlay';
import { NeuralAmbientBackground } from '@/components/ui/neural-ambient-background';

type FlowStep = 'capture' | 'processing' | 'insights';

interface ClarityReport {
  keyInsights: string[];
  actionItems: string[];
  contentReady: {
    tweet: string;
    linkedin: string;
    instagramCaption: string;
  };
  calendarSuggestions: Array<{
    title: string;
    time: string;
    duration: string;
  }>;
}

interface ProcessingStep {
  id: number;
  text: string;
  completed: boolean;
  current: boolean;
}

export default function SimplifiedFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<FlowStep>('capture');
  const [capturedThoughts, setCapturedThoughts] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [clarityReport, setClarityReport] = useState<ClarityReport | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Personalization system
  const {
    userPatterns,
    isReturningUser,
    trackSessionStart,
    trackInputMethod,
    trackThoughtLength,
    trackActionUsage,
    trackSocialCopy,
    getTimeContext,
    getPersonalizedPlaceholder,
    getEstimatedProcessingTime,
    getPrioritizedSocialPlatforms,
    isLikelyToUse
  } = usePersonalization();

  const { 
    synthesizeWithStream, 
    isStreaming, 
    currentInsight,
    accumulatedInsights,
    clearInsights 
  } = useSynthesizeStream();

  const { saveInsight, trackAction } = useOfflineInsights();
  const { firstName } = useUserProfile();
  const { handleSourceClick, handleContentCopy } = useAdaptiveIntelligence();

  // State for adaptive intelligence data
  const [adaptiveData, setAdaptiveData] = useState<{
    detectedTopics?: any[];
    smartSources?: any;
    userProfile?: any;
  }>({});

  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([
    { id: 1, text: "Capturing your thoughts...", completed: false, current: false },
    { id: 2, text: "Connecting ideas...", completed: false, current: false },
    { id: 3, text: "Finding hidden patterns...", completed: false, current: false },
    { id: 4, text: "Building your insights...", completed: false, current: false },
    { id: 5, text: "Crafting action items...", completed: false, current: false },
  ]);

  // Track session start when component mounts
  useEffect(() => {
    if (userPatterns.sessionCount === 0) {
      trackSessionStart();
    }
  }, []);

  const handleVoiceTranscription = (transcribedText: string) => {
    // Add the transcribed text to the existing content
    setCapturedThoughts(prev => 
      prev ? `${prev}\n\n${transcribedText}` : transcribedText
    );
    
    // Track voice input preference
    trackInputMethod('voice');
    
    toast.success('Voice recording transcribed successfully!');
  };

  const handleVoiceRecordingStart = () => {
    setIsRecording(true);
  };

  const handleVoiceRecordingStop = () => {
    setIsRecording(false);
  };

  const handleVoiceError = (error: string) => {
    setIsRecording(false);
    toast.error(error);
  };

  const handleFileUpload = () => {
    console.log('SimplifiedFlow: File upload button clicked');
    console.log('SimplifiedFlow: fileInputRef.current:', fileInputRef.current);
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('SimplifiedFlow: File selected:', event.target.files);
    const file = event.target.files?.[0];
    if (file) {
      console.log('SimplifiedFlow: Reading file:', file.name, file.type);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        console.log('SimplifiedFlow: File content loaded:', content.substring(0, 100) + '...');
        setCapturedThoughts(prev => prev + '\n' + content);
      };
      reader.onerror = (e) => {
        console.error('SimplifiedFlow: File reading error:', e);
      };
      reader.readAsText(file);
    }
  };

  const simulateProcessingSteps = async () => {
    const steps = [...processingSteps];
    
    for (let i = 0; i < steps.length; i++) {
      // Set current step
      steps[i].current = true;
      setProcessingSteps([...steps]);
      
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Complete step
      steps[i].completed = true;
      steps[i].current = false;
      setProcessingSteps([...steps]);
    }
  };

  const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const getUserPreferences = () => ({
    preferredInput: userPatterns.preferredInput,
    timeContext: getTimeContext(),
    urgencyLevel: detectUrgency(capturedThoughts),
    socialPlatforms: getPrioritizedSocialPlatforms()
  });

  const storeInsightInGallery = (insights: any) => {
    const existingInsights = JSON.parse(localStorage.getItem('scatterbrain_insights') || '[]');
    
    // Auto-generate meaningful title from the top theme
    const autoTitle = insights.insights?.keyThemes?.[0]?.theme || 
                     insights.keyThemes?.[0]?.theme ||
                     `Thoughts on ${new Date().toLocaleDateString()}`;
    
    const newInsight = {
      id: insights.id || generateTempId(),
      timestamp: new Date().toISOString(),
      title: autoTitle, // Auto-generated meaningful title
      originalInput: capturedThoughts,
      insights: insights.insights || insights, // Handle both nested and flat structures
      starred: false,
      actionsCompleted: 0,
      totalActions: (insights.insights?.actionItems || insights.actionItems)?.length || 0
    };
    
    existingInsights.unshift(newInsight); // Add to beginning
    localStorage.setItem('scatterbrain_insights', JSON.stringify(existingInsights));
  };

  const showErrorMessage = (message: string) => {
    toast.error(message);
  };

  const handleCapture = async () => {
    if (!capturedThoughts.trim()) return;
    
    setCurrentStep('processing');
    setIsProcessing(true);
    
    // Reset processing steps
    setProcessingSteps(prev => prev.map(step => ({
      ...step,
      completed: false,
      current: false
    })));

    try {
      // Animate through processing steps
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

      // Use the new synthesis hook with adaptive intelligence
      const apiResponse = await synthesizeWithStream({
        input: capturedThoughts,
        userId: generateTempId(),
        sessionId: generateSessionId(),
        preferences: getUserPreferences(),
        context: {
          timeOfDay: new Date().getHours(),
          inputMethod: 'text',
          urgencyLevel: detectUrgency(capturedThoughts)
        },
        outputPreferences: {
          insightDepth: 'detailed',
          actionFormat: 'todos-first',
          contentPlatforms: ['twitter', 'linkedin', 'instagram'],
          calendarIntegration: false
        },
        features: {
          communityInsights: true,
          trendAnalysis: true,
          contentGeneration: true,
          calendarSync: false
        }
      });
      
      if (!apiResponse) {
        throw new Error('Analysis failed');
      }

      // Store adaptive intelligence data
      setAdaptiveData({
        detectedTopics: apiResponse.detectedTopics,
        smartSources: apiResponse.smartSources,
        userProfile: apiResponse.userProfile
      });
      // Transform API response to match UI expectations
      const insights = {
        keyInsights: apiResponse.insights.keyThemes.map((theme: any) => theme.theme),
        actionItems: apiResponse.insights.actionItems.map((item: any) => item.task),
        contentReady: {
          tweet: apiResponse.insights.contentSuggestions.twitter.content,
          linkedin: apiResponse.insights.contentSuggestions.linkedin.content,
          instagramCaption: apiResponse.insights.contentSuggestions.instagram.content,
        },
        calendarSuggestions: (apiResponse.insights?.actionItems?.slice(0, 3) || []).map((item: any) => ({
          title: item.task || 'Focus Time',
          time: item.bestTiming || 'tomorrow',
          duration: item.estimatedDuration || '60 minutes',
        })),
      };
      
      // Clear processing animation
      clearInterval(processingInterval);
      setProcessingSteps(prev => prev.map(step => ({
        ...step,
        completed: true,
        current: false
      })));
      // Store the full API response in localStorage for gallery
      storeInsightInGallery(apiResponse);
      setClarityReport(insights);
      
      // Save insight to gallery
      try {
        await saveInsight(
          capturedThoughts,
          insights,
          adaptiveData.detectedTopics?.map(t => t.topic) || ['Productivity', 'Creative Process']
        );
      } catch (error) {
        console.error('Failed to save insight:', error);
      }

      // Wait a moment for state to settle, then automatically navigate to detailed report
      // Let users see their results - don't auto-redirect
      // Users can manually navigate to detailed report if they want
      setCurrentStep('insights');

    } catch (error) {
      console.error('Analysis failed:', error);
      setIsProcessing(false);
      setCurrentStep('capture'); // Back to input
      showErrorMessage('Something went wrong. Please try again.');
      return;
    }
    
    setIsProcessing(false);
  };

  const resetFlow = () => {
    setCurrentStep('capture');
    setCapturedThoughts('');
    setClarityReport(null);
    setIsProcessing(false);
    setProcessingSteps(prev => prev.map(step => ({
      ...step,
      completed: false,
      current: false
    })));
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type} copied to clipboard!`);
      
      // Track social platform usage for personalization
      if (type === 'Tweet') trackSocialCopy('twitter');
      else if (type === 'LinkedIn post') trackSocialCopy('linkedin');
      else if (type === 'Instagram caption') trackSocialCopy('instagram');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const addToCalendar = (suggestion: any) => {
    // Track calendar usage for personalization
    trackActionUsage('calendar');
    
    const title = encodeURIComponent(suggestion.title);
    const details = encodeURIComponent(`Duration: ${suggestion.duration}`);
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`;
    window.open(calendarUrl, '_blank');
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-gradient-to-br from-cosmic-purple via-space-black to-cosmic-deep">
      {/* Neural Ambient Background */}
      <NeuralAmbientBackground intensity="subtle" />
      
      {/* Neural Synthesis Overlay */}
      <NeuralSynthesisOverlay 
        isVisible={isProcessing}
        title="Illuminating Neural Pathways"
        subtitle="Your thoughts are finding their perfect form"
      />
      
      {/* Cosmic background effects */}
      <div className="absolute inset-0 neural-grid opacity-30"></div>
      <div className="absolute inset-0 cosmic-texture"></div>
      {/* Subtle Navigation Header - Only show in capture mode */}
      {currentStep === 'capture' && (
        <motion.header 
          className="absolute top-6 left-6 right-6 flex justify-between items-center z-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            <span className="text-white font-semibold text-lg">ScatterBrainAI</span>
          </div>
          
          <nav className="flex gap-6">
            <button 
              onClick={() => navigate('/gallery')}
              className="text-purple-300 hover:text-white transition-colors text-sm font-medium"
            >
              Gallery
            </button>
            <button 
              onClick={() => {/* Add settings navigation later */}}
              className="text-purple-300 hover:text-white transition-colors text-sm font-medium"
            >
              Profile
            </button>
          </nav>
        </motion.header>
      )}

      <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 lg:py-12">
        <AnimatePresence mode="wait">
          {/* Step 1: Thought Capture */}
          {currentStep === 'capture' && (
            <motion.div
              key="capture"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-3xl mx-auto pt-16"
            >
              {/* Brain Icon */}
              <div className="text-center mb-4 sm:mb-6 md:mb-8">
                <div 
                  className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full mx-auto mb-3 sm:mb-4 md:mb-6 flex items-center justify-center"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  <Brain className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white" />
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 sm:mb-3 px-2 sm:px-4 leading-tight">
                  {firstName ? `Hi ${firstName}! What's on your mind today?` : 
                   isReturningUser ? `Welcome back! ${getTimeContext().suggestion}` : 
                   "What's swirling around in your head?"}
                </h1>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/70 px-2 sm:px-4 max-w-2xl mx-auto leading-relaxed">
                  {firstName ? "Ready to turn your scattered thoughts into clear insights?" :
                   isReturningUser 
                     ? "Ready to transform more scattered thoughts into clear action?" 
                     : "Dump everything here — I'll help you sort it out and turn chaos into clarity."
                  }
                </p>
              </div>

              {/* Input Area */}
              <div className="mb-6 sm:mb-8 px-2 sm:px-0">
                <Textarea
                  placeholder={getPersonalizedPlaceholder()}
                  value={capturedThoughts}
                  onChange={(e) => {
                    setCapturedThoughts(e.target.value);
                    // Track text input preference
                    if (e.target.value.length > 10 && userPatterns.preferredInput !== 'text') {
                      trackInputMethod('text');
                    }
                  }}
                  onKeyDown={(e) => {
                    // Handle Enter key to trigger transform
                    if (e.key === 'Enter' && !e.shiftKey && capturedThoughts.trim()) {
                      e.preventDefault();
                      handleCapture();
                    }
                  }}
                  onBlur={() => {
                    // Track thought length when user finishes typing
                    if (capturedThoughts.length > 0) {
                      trackThoughtLength(capturedThoughts.length);
                    }
                  }}
                  className="h-32 sm:h-36 md:h-40 lg:h-44 rounded-2xl border-purple-500/20 focus:ring-purple-500 text-white placeholder:text-white/50 text-sm sm:text-base resize-none"
                  style={{ 
                    background: 'hsla(217.2, 32.6%, 17.5%, 0.5)',
                    backdropFilter: 'blur(16px)'
                  }}
                />
              </div>

              {/* Simplified Action Button */}
              <div className="flex flex-col gap-4 mb-6 sm:mb-8 px-2 sm:px-0">
                <div className="flex gap-3 justify-center">
                  <Button 
                    variant="outline" 
                    onClick={handleFileUpload}
                    className="relative z-10 bg-white/10 border-white/20 text-white hover:bg-white/20 flex-shrink-0 min-h-[44px] px-6 text-sm sm:text-base transition-all duration-200 cursor-pointer"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload File
                  </Button>
                  
                  <VoiceMemoRecorder
                    onTranscriptionComplete={handleVoiceTranscription}
                    onRecordingStart={handleVoiceRecordingStart}
                    onRecordingStop={handleVoiceRecordingStop}
                    onError={handleVoiceError}
                    maxDuration={300000} // 5 minutes
                    placeholder="Record voice memo"
                  />
                </div>
                
                <Button 
                  onClick={handleCapture}
                  disabled={!capturedThoughts.trim() || isProcessing}
                  className="text-white font-bold w-full min-h-[52px] sm:min-h-[56px] text-base sm:text-lg md:text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  style={{ 
                    background: capturedThoughts.trim() 
                      ? 'var(--gradient-primary)' 
                      : 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(59, 130, 246, 0.3) 100%)',
                    boxShadow: capturedThoughts.trim()
                      ? '0 8px 32px rgba(139, 92, 246, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
                      : 'none'
                  }}
                >
                  {isProcessing ? (
                    <NeuralThinkingAnimation size="sm" className="mr-3" />
                  ) : (
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 mr-3 flex-shrink-0" />
                  )}
                  <span className="hidden sm:inline">
                    {isProcessing ? "Illuminating patterns..." : "Transform My Thoughts"}
                  </span>
                  <span className="sm:hidden">
                    {isProcessing ? "Processing..." : "Transform"}
                  </span>
                  {!isProcessing && <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 flex-shrink-0" />}
                </Button>
              </div>

              {/* Footer */}
              <p className="text-center text-xs sm:text-sm text-white/60 px-2 sm:px-4">
                ✨ Your thoughts are safe with us — everything is processed privately and securely
              </p>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".txt,.md,.doc,.docx"
              />
            </motion.div>
          )}

          {/* Step 2: Processing Magic */}
          {currentStep === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-3xl mx-auto text-center px-3 sm:px-4"
            >
              {/* Neural Brain Animation */}
              <div className="mb-6 sm:mb-8">
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mx-auto mb-4 sm:mb-6">
                  {/* Brain illustration with neural pathways */}
                  <svg className="w-full h-full" viewBox="0 0 200 200">
                    <defs>
                      <radialGradient id="brainGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(139, 92, 246, 0.8)" />
                        <stop offset="70%" stopColor="rgba(59, 130, 246, 0.6)" />
                        <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
                      </radialGradient>
                      <filter id="neuralGlow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    
                    {/* Brain outline */}
                    <motion.path
                      d="M100 20C120 20 140 35 150 55C160 45 170 50 175 65C180 80 175 95 170 110C175 125 170 140 160 150C150 165 130 175 110 175C90 175 70 165 60 150C50 140 45 125 50 110C45 95 50 80 55 65C60 50 70 45 80 55C90 35 100 20 100 20Z"
                      fill="none"
                      stroke="rgba(139, 92, 246, 0.8)"
                      strokeWidth="2"
                      filter="url(#neuralGlow)"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                    />
                    
                    {/* Neural pathways */}
                    {[...Array(6)].map((_, i) => (
                      <motion.path
                        key={i}
                        d={`M${70 + i * 10} ${60 + i * 15} Q${100 + i * 5} ${80 + i * 10} ${130 - i * 8} ${90 + i * 12}`}
                        fill="none"
                        stroke="rgba(59, 130, 246, 0.6)"
                        strokeWidth="1.5"
                        filter="url(#neuralGlow)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: [0, 1, 0.5, 1] }}
                        transition={{
                          duration: 3 + i * 0.5,
                          repeat: Infinity,
                          delay: i * 0.3,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                    
                    {/* Synapses/nodes */}
                    {[...Array(8)].map((_, i) => (
                      <motion.circle
                        key={i}
                        cx={80 + (i % 3) * 20}
                        cy={70 + Math.floor(i / 3) * 25}
                        r="3"
                        fill="url(#brainGlow)"
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.5, 1, 1.5, 0.8] }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                    
                    {/* Thought particles */}
                    {[...Array(4)].map((_, i) => (
                      <motion.circle
                        key={`particle-${i}`}
                        cx={100}
                        cy={100}
                        r="1.5"
                        fill="rgba(251, 191, 36, 0.8)"
                        initial={{ x: 0, y: 0, opacity: 0 }}
                        animate={{
                          x: [0, (i % 2 ? 40 : -40), 0],
                          y: [0, (i < 2 ? -30 : 30), 0],
                          opacity: [0, 1, 0.7, 0]
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          delay: i * 0.8,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </svg>
                </div>

                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-amber-400 bg-clip-text text-transparent mb-3 sm:mb-4 px-2 sm:px-4">
                  Illuminating Neural Pathways
                </h2>
                <p className="text-white/70 mb-6 sm:mb-8 px-2 sm:px-4 text-sm sm:text-base md:text-lg">
                  Your thoughts are finding their perfect form
                </p>
              </div>

              {/* Progress Indicators */}
              <div className="space-y-3 sm:space-y-4 px-2 sm:px-4">
                {processingSteps.map((step) => (
                  <motion.div
                    key={step.id}
                    className="flex items-center justify-center space-x-3"
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: step.completed || step.current ? 1 : 0.3 }}
                  >
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border-2 border-white/30 flex-shrink-0">
                      {step.completed ? (
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                      ) : step.current ? (
                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 animate-spin" />
                      ) : (
                        <div className="w-2 h-2 bg-white/30 rounded-full" />
                      )}
                    </div>
                    <span className={`text-white text-sm sm:text-base ${step.completed || step.current ? 'font-medium' : 'opacity-50'} text-center`}>
                      {step.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Insights Report */}
          {currentStep === 'insights' && clarityReport && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-7xl mx-auto"
            >
              {/* Adaptive Intelligence Indicators */}
              <AdaptationIndicator 
                userProfile={adaptiveData.userProfile}
                detectedTopics={adaptiveData.detectedTopics}
              />
              
              {adaptiveData.smartSources && (
                <SmartSourcesDisplay 
                  smartSources={adaptiveData.smartSources}
                  onSourceClick={(source, sourceType) => handleSourceClick(source, sourceType, adaptiveData.detectedTopics)}
                />
              )}

              {/* Header */}
              <div className="text-center mb-4 sm:mb-6 md:mb-8 px-3 sm:px-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">Your Clarity Report</h2>
                <p className="text-white/70 text-sm sm:text-base md:text-lg">From scattered thoughts to structured action</p>
              </div>

              {/* Content Grid */}
              <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6 md:mb-8 px-3 sm:px-0">
                {/* Key Insights */}
                <Card 
                  className="p-3 sm:p-4 md:p-6 border-white/10"
                  style={{ 
                    background: 'hsla(217.2, 32.6%, 17.5%, 0.5)',
                    backdropFilter: 'blur(16px)'
                  }}
                >
                  <div className="flex items-center mb-3 sm:mb-4">
                    <Brain className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-400 mr-2 sm:mr-3 flex-shrink-0" />
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white">Key Insights</h3>
                  </div>
                  <div className="space-y-2 sm:space-y-3 md:space-y-4">
                    {clarityReport.keyInsights.map((insight, index) => (
                      <div key={index} className="flex items-start space-x-2 sm:space-x-3">
                        <div 
                          className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-white font-bold text-xs sm:text-sm"
                          style={{ background: 'var(--gradient-primary)' }}
                        >
                          {index + 1}
                        </div>
                        <p className="text-white/80 text-xs sm:text-sm md:text-base leading-relaxed">{insight}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Action Items */}
                <Card 
                  className="p-3 sm:p-4 md:p-6 border-white/10"
                  style={{ 
                    background: 'hsla(217.2, 32.6%, 17.5%, 0.5)',
                    backdropFilter: 'blur(16px)'
                  }}
                >
                  <div className="flex items-center mb-3 sm:mb-4">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-400 mr-2 sm:mr-3 flex-shrink-0" />
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white">Action Items</h3>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {clarityReport.actionItems.map((item, index) => (
                      <div 
                        key={index} 
                        className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer min-h-[44px]"
                        onClick={() => trackActionUsage('todos')}
                      >
                        <input 
                          type="checkbox" 
                          className="mt-1 accent-green-400 flex-shrink-0 w-4 h-4"
                          onChange={() => trackActionUsage('todos')}
                        />
                        <p className="text-white/80 text-xs sm:text-sm md:text-base leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Content Ready to Share */}
              <Card 
                className="p-4 sm:p-6 mb-6 sm:mb-8 border-white/10"
                style={{ 
                  background: 'hsla(217.2, 32.6%, 17.5%, 0.5)',
                  backdropFilter: 'blur(16px)'
                }}
              >
                <div className="flex items-center justify-center mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-white">Content Ready to Share</h3>
                  {isReturningUser && (
                    <span className="ml-2 text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                      Personalized
                    </span>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {getPrioritizedSocialPlatforms().map((platform, index) => {
                    const content = platform.name === 'twitter' 
                      ? clarityReport.contentReady.tweet
                      : platform.name === 'linkedin'
                      ? clarityReport.contentReady.linkedin
                      : clarityReport.contentReady.instagramCaption;
                    
                    const IconComponent = platform.name === 'twitter' 
                      ? Twitter 
                      : platform.name === 'linkedin' 
                      ? Linkedin 
                      : Instagram;
                    
                    const iconColor = platform.name === 'twitter' 
                      ? 'text-blue-400' 
                      : platform.name === 'linkedin' 
                      ? 'text-blue-600' 
                      : 'text-pink-500';
                    
                    const displayName = platform.name === 'twitter' 
                      ? 'Twitter' 
                      : platform.name === 'linkedin' 
                      ? 'LinkedIn' 
                      : 'Instagram';
                    
                    const copyType = platform.name === 'twitter' 
                      ? 'Tweet' 
                      : platform.name === 'linkedin' 
                      ? 'LinkedIn post' 
                      : 'Instagram caption';
                    
                    return (
                      <div 
                        key={platform.name} 
                        className={`text-center ${index === 0 && isReturningUser ? 'order-first ring-2 ring-purple-500/50' : ''}`}
                      >
                        <div className="relative">
                          <IconComponent className={`w-6 h-6 sm:w-8 sm:h-8 ${iconColor} mx-auto mb-2 sm:mb-3`} />
                          {index === 0 && isReturningUser && platform.usage > 1 && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">★</span>
                            </div>
                          )}
                        </div>
                        <h4 className="font-semibold text-white mb-2 sm:mb-3 text-sm sm:text-base">
                          {displayName}
                          {index === 0 && isReturningUser && platform.usage > 1 && (
                            <span className="text-xs text-purple-300 ml-1">(Most Used)</span>
                          )}
                        </h4>
                        <p className="text-white/70 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3 min-h-[3.6rem] sm:min-h-[4.2rem]">
                          {content}
                        </p>
                        <Button 
                          onClick={() => copyToClipboard(content, copyType)}
                          size="sm" 
                          variant="outline"
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-full text-xs sm:text-sm"
                        >
                          <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Copy
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Calendar Suggestions */}
              <Card 
                className="p-4 sm:p-6 mb-6 sm:mb-8 border-white/10"
                style={{ 
                  background: 'hsla(217.2, 32.6%, 17.5%, 0.5)',
                  backdropFilter: 'blur(16px)'
                }}
              >
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 text-center">Calendar Suggestions</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clarityReport.calendarSuggestions.map((suggestion, index) => (
                    <div key={index} className="p-3 sm:p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                      <h4 className="font-semibold text-white mb-2 text-sm sm:text-base">{suggestion.title}</h4>
                      <p className="text-white/70 text-xs sm:text-sm mb-1">{suggestion.time}</p>
                      <p className="text-white/60 text-xs sm:text-sm mb-3">{suggestion.duration}</p>
                      <Button 
                        onClick={() => addToCalendar(suggestion)}
                        size="sm" 
                        variant="outline"
                        className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs sm:text-sm"
                      >
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Add to Calendar
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="text-center space-y-3 sm:space-y-4 px-3 sm:px-4">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center max-w-lg mx-auto">
                  <Button 
                    onClick={() => {
                      // Navigate to detailed report
                      const insights = JSON.parse(localStorage.getItem('scatterbrain_insights') || '[]');
                      const latestInsight = insights[0];
                      if (latestInsight) {
                        navigate(`/report/${latestInsight.id}`);
                      }
                    }}
                    className="text-white font-semibold w-full sm:flex-1 min-h-[48px] text-sm sm:text-base"
                    style={{ background: 'var(--gradient-primary)' }}
                  >
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="hidden sm:inline">View Detailed Report</span>
                    <span className="sm:hidden">Detailed Report</span>
                  </Button>
                  <Button 
                    onClick={resetFlow}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-full sm:flex-1 min-h-[48px] text-sm sm:text-base"
                  >
                    <Brain className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="hidden sm:inline">Analyze More Thoughts</span>
                    <span className="sm:hidden">Analyze More</span>
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/gallery')}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-full sm:flex-1 min-h-[48px] text-sm sm:text-base"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">View All Insights</span>
                    <span className="sm:hidden">Gallery</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}