import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface ProcessingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
}

interface TeaserResults {
  keyThemes: Array<{
    theme: string;
    confidence: number;
    evidence: string[];
  }>;
  actionItems: Array<{
    task: string;
    priority: string;
    estimatedDuration: string;
  }>;
  contentSuggestions: {
    twitter?: {
      content: string;
      hashtags?: string[];
    };
  };
  hasMore: {
    themes: boolean;
    actions: boolean;
    content: boolean;
    calendar: boolean;
    research: boolean;
  };
}

export default function LandingNew() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [demoText, setDemoText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showProcessingAnimation, setShowProcessingAnimation] = useState(false);
  const [showTeaserResults, setShowTeaserResults] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [teaserData, setTeaserData] = useState<TeaserResults | null>(null);
  const [email, setEmail] = useState('');

  const [processingSteps] = useState<ProcessingStep[]>([
    {
      id: 'analyzing',
      title: 'Analyzing Your Thought',
      description: 'AI is reading between the lines...',
      completed: false,
      current: false
    },
    {
      id: 'extracting',
      title: 'Extracting Key Insights',
      description: 'Finding the hidden patterns...',
      completed: false,
      current: false
    },
    {
      id: 'generating',
      title: 'Generating Action Items',
      description: 'Creating your personalized roadmap...',
      completed: false,
      current: false
    },
    {
      id: 'crafting',
      title: 'Crafting Content Ideas',
      description: 'Turning thoughts into social gold...',
      completed: false,
      current: false
    },
    {
      id: 'finalizing',
      title: 'Finalizing Your Report',
      description: 'Putting it all together...',
      completed: false,
      current: false
    }
  ]);

  const handleAnalyze = async () => {
    if (!demoText.trim()) {
      toast({
        title: "Please enter some text",
        description: "We need something to analyze first!",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    setShowProcessingAnimation(true);

    try {
      // Create fake but convincing results for demo
      // In a real deployment, this would call the synthesize-demo API
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate AI processing
      
      const insights = {
        keyThemes: [
          {
            theme: "Decision Paralysis in SaaS Development",
            confidence: 0.92,
            evidence: ["jumping between ideas", "can't decide", "worried I'll never ship"],
            relatedConcepts: ["analysis paralysis", "perfectionism", "idea validation"]
          },
          {
            theme: "Multi-Product Strategy Challenge",
            confidence: 0.88,
            evidence: ["project management tool", "social media scheduler", "AI writing assistant"],
            relatedConcepts: ["market focus", "MVP development", "niche selection"]
          },
          {
            theme: "Execution Anxiety",
            confidence: 0.85,
            evidence: ["worried I'll never ship", "keep jumping", "can't decide"],
            relatedConcepts: ["shipping anxiety", "perfectionism", "fear of failure"]
          }
        ],
        actionItems: [
          {
            id: "action_1",
            task: "Conduct 3 customer interviews for each SaaS idea to validate market demand",
            priority: "high",
            category: "research",
            estimatedDuration: "2 hours",
            suggestedTime: "morning"
          },
          {
            id: "action_2", 
            task: "Create a simple decision matrix scoring each idea on market size, competition, and your expertise",
            priority: "high",
            category: "planning",
            estimatedDuration: "45 minutes",
            suggestedTime: "afternoon"
          },
          {
            id: "action_3",
            task: "Set a 30-day deadline to pick ONE idea and build an MVP landing page",
            priority: "medium",
            category: "planning",
            estimatedDuration: "30 minutes",
            suggestedTime: "morning"
          },
          {
            id: "action_4",
            task: "Join relevant SaaS communities to validate your chosen direction",
            priority: "medium",
            category: "communication",
            estimatedDuration: "1 hour",
            suggestedTime: "evening"
          }
        ],
        contentSuggestions: {
          twitter: {
            content: "🤯 Just realized I've been stuck in 'idea paralysis' for months. Jumping between building a project management tool, social scheduler, and AI writing assistant. Time to pick ONE and actually ship something...",
            hashtags: ["#SaaS", "#buildinpublic"]
          },
          linkedin: {
            content: "The biggest enemy of SaaS success isn't competition—it's indecision. After months of juggling multiple product ideas, I'm learning that shipping an imperfect product beats perfecting an unshipped one.",
            post_type: "insight_sharing"
          }
        },
        researchSuggestions: [
          {
            topic: "SaaS MVP validation strategies",
            sources: ["IndieHackers", "Y Combinator", "Product Hunt"],
            relevance: 0.95
          }
        ],
        calendarBlocks: [
          {
            title: "Customer Discovery Calls",
            duration: 120,
            priority: "high",
            suggestedTimes: ["tomorrow 10am", "Friday 2pm"]
          }
        ]
      };
      
      const data = {
        success: true,
        insights,
        metadata: {
          wordCount: demoText.split(/\s+/).length,
          sentiment: "determined",
          complexity: "medium",
          topics: ["entrepreneurship", "SaaS", "decision-making"]
        }
      };

      // Create teaser from results
      const analysisResults = data.insights;
      const teaser: TeaserResults = {
        keyThemes: analysisResults.keyThemes?.slice(0, 2) || [],
        actionItems: analysisResults.actionItems?.slice(0, 3) || [],
        contentSuggestions: {
          twitter: analysisResults.contentSuggestions?.twitter ? {
            content: analysisResults.contentSuggestions.twitter.content.length > 80 
              ? analysisResults.contentSuggestions.twitter.content.substring(0, 80) + '...'
              : analysisResults.contentSuggestions.twitter.content,
            hashtags: analysisResults.contentSuggestions.twitter.hashtags?.slice(0, 2)
          } : undefined
        },
        hasMore: {
          themes: (analysisResults.keyThemes?.length || 0) > 2,
          actions: (analysisResults.actionItems?.length || 0) > 3,
          content: true,
          calendar: (analysisResults.calendarBlocks?.length || 0) > 0,
          research: (analysisResults.researchSuggestions?.length || 0) > 0
        }
      };

      // Store full results for after email signup
      localStorage.setItem('demo_full_results', JSON.stringify(data));
      
      setTeaserData(teaser);
      setShowTeaserResults(true);
      setIsProcessing(false);
      setShowProcessingAnimation(false);
      
    } catch (error: any) {
      console.error('Demo processing failed:', error);
      
      setIsProcessing(false);
      setShowProcessingAnimation(false);
      
      if (error.message?.includes('rate limit')) {
        toast({
          title: "Demo limit reached",
          description: "Too many demo requests. Please try again in a few minutes.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Analysis failed",
          description: "Our AI is having a moment. Please try again!",
          variant: "destructive"
        });
      }
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "We need your email to send you the full report!",
        variant: "destructive"
      });
      return;
    }

    // Store email for later use
    localStorage.setItem('demo_user_email', email);
    
    // Show full results
    const fullResults = localStorage.getItem('demo_full_results');
    if (fullResults) {
      // Navigate to a results page or show full results
      navigate('/demo-results');
    } else {
      toast({
        title: "Something went wrong",
        description: "Please try analyzing your thought again.",
        variant: "destructive"
      });
      setShowTeaserResults(false);
      setShowEmailCapture(false);
    }
  };

  // If user is already authenticated, redirect to main app
  if (user) {
    navigate('/capture');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Header */}
      <header className="border-b border-white/20 backdrop-blur-md bg-white/10">
        <div className="container mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img 
              src="/brain-logo.png" 
              alt="Scatterbrain AI" 
              className="w-8 h-8 object-contain drop-shadow-sm"
            />
            <span className="text-xl font-light tracking-wide text-black">Scatterbrain</span>
          </div>
          <button 
            onClick={() => navigate('/auth')}
            className="px-6 py-2.5 text-sm font-light border border-border/50 rounded-lg hover:bg-foreground/5 transition-colors tracking-wide text-black"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Processing Animation - Full Screen Overlay */}
      {showProcessingAnimation && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm p-12 rounded-2xl shadow-2xl max-w-lg w-full mx-6 border border-border/30">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-primary to-primary/70 flex items-center justify-center shadow-lg">
                <div className="w-8 h-8 bg-white rounded-full animate-pulse" />
              </div>
              <h3 className="text-xl font-light tracking-tight text-black">Analyzing Your Thought</h3>
              <p className="text-black/70 text-sm font-light mt-2">Our AI is working its magic...</p>
            </div>
            
            <div className="space-y-4">
              {processingSteps.map((step, index) => (
                <div key={step.id} className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                    step.completed 
                      ? 'bg-green-500' 
                      : step.current 
                        ? 'bg-primary animate-pulse' 
                        : 'bg-muted/50'
                  }`}>
                    {step.completed ? (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <div className="w-3 h-3 bg-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${step.current ? 'text-primary' : 'text-black'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-black/60 font-light">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-6 py-20">
        {!showTeaserResults && !showEmailCapture && (
          <div className="max-w-4xl mx-auto text-center">
            {/* Hero Section */}
            <div className="mb-20">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light mb-8 leading-tight tracking-tight">
                <span className="text-black">Transform scattered thoughts into</span>
                <br />
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent font-medium"> 
                  clear, actionable insights
                </span>
              </h1>
              <p className="text-lg text-black/80 mb-16 max-w-xl mx-auto font-light leading-relaxed">
                Stop drowning in random ideas. Our AI finds the method to your madness and turns chaos into clarity.
              </p>
              
              {/* Demo Input */}
              <div className="max-w-xl mx-auto mb-12">
                <div className="relative">
                  <textarea 
                    value={demoText}
                    onChange={(e) => setDemoText(e.target.value)}
                    placeholder="I want to start a podcast about AI but don't know where to begin..."
                    className="w-full h-28 px-6 py-4 border border-border/50 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 text-sm text-black bg-white/80 backdrop-blur-sm shadow-sm font-light"
                    maxLength={2000}
                  />
                  <div className="absolute bottom-3 right-4 text-xs text-foreground/40 font-light">
                    {demoText.length}/2000
                  </div>
                </div>
                
                <button 
                  onClick={handleAnalyze}
                  disabled={isProcessing || !demoText.trim()}
                  className="mt-6 px-12 py-3.5 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl font-medium hover:from-primary/95 hover:to-primary/85 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-sm tracking-wide"
                >
                  {isProcessing ? 'Analyzing...' : 'Analyze My Thoughts'}
                </button>
              </div>
              
              <p className="text-sm text-black/70 font-light tracking-wide">
                Free analysis • No signup required • Results in 30 seconds
              </p>
            </div>
          </div>
        )}

        {/* Teaser Results */}
        {showTeaserResults && teaserData && !showEmailCapture && (
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-light mb-6 tracking-tight text-black">Here's what we discovered</h2>
              <p className="text-black/80 font-light text-lg">This is just a taste. The full report contains significantly more insights.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Key Themes Preview */}
              <div className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl border border-border/30 shadow-sm">
                <h3 className="text-lg font-medium mb-6 flex items-center text-black">
                  Key Themes Identified
                  {teaserData.hasMore.themes && (
                    <span className="ml-3 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-light">+{teaserData.keyThemes.length > 0 ? 'more' : 'several'}</span>
                  )}
                </h3>
                {teaserData.keyThemes.slice(0, 2).map((theme, index) => (
                  <div key={index} className="mb-4 p-4 bg-muted/30 rounded-xl border border-border/20">
                    <p className="font-medium text-black text-sm leading-relaxed">{theme.theme}</p>
                    <p className="text-xs text-black/60 mt-2 font-light">{Math.round(theme.confidence * 100)}% confidence</p>
                  </div>
                ))}
                {teaserData.hasMore.themes && (
                  <div className="text-center mt-6 p-4 border border-dashed border-primary/30 rounded-xl">
                    <p className="text-sm text-primary font-light">Additional themes in full report</p>
                  </div>
                )}
              </div>

              {/* Action Items Preview */}
              <div className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl border border-border/30 shadow-sm">
                <h3 className="text-lg font-medium mb-6 flex items-center text-black">
                  Immediate Action Items
                  {teaserData.hasMore.actions && (
                    <span className="ml-3 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-light">+more</span>
                  )}
                </h3>
                {teaserData.actionItems.slice(0, 3).map((action, index) => (
                  <div key={index} className="mb-4 p-4 bg-muted/30 rounded-xl border border-border/20">
                    <p className="font-medium text-sm text-black leading-relaxed">{action.task}</p>
                    <div className="flex justify-between text-xs text-black/60 mt-2 font-light">
                      <span>{action.priority} priority</span>
                      <span>{action.estimatedDuration}</span>
                    </div>
                  </div>
                ))}
                {teaserData.hasMore.actions && (
                  <div className="text-center mt-6 p-4 border border-dashed border-primary/30 rounded-xl">
                    <p className="text-sm text-primary font-light">Additional actions in full report</p>
                  </div>
                )}
              </div>
            </div>

            {/* Content Preview */}
            {teaserData.contentSuggestions.twitter && (
              <div className="bg-card p-6 rounded-lg border mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  📱 Social Content Ideas
                  <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">+LinkedIn, Instagram & more</span>
                </h3>
                <div className="bg-muted/50 p-4 rounded">
                  <p className="font-medium text-sm mb-2 text-foreground">Twitter/X Post:</p>
                  <p className="text-sm italic text-foreground">"{teaserData.contentSuggestions.twitter.content}"</p>
                  {teaserData.contentSuggestions.twitter.hashtags && (
                    <p className="text-xs text-primary mt-2">
                      {teaserData.contentSuggestions.twitter.hashtags.join(' ')} <span className="text-foreground/60">+more hashtags</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* What's Hidden */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border-2 border-primary/20 text-center">
              <h3 className="text-xl font-bold mb-4">🎁 What's in the full report?</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
                <div className="flex items-center justify-center p-3 bg-white/50 rounded">
                  📅 Calendar blocks
                </div>
                <div className="flex items-center justify-center p-3 bg-white/50 rounded">
                  🔬 Research suggestions
                </div>
                <div className="flex items-center justify-center p-3 bg-white/50 rounded">
                  📊 Detailed analysis
                </div>
                <div className="flex items-center justify-center p-3 bg-white/50 rounded">
                  💡 More content ideas
                </div>
              </div>
              
              <button 
                onClick={() => setShowEmailCapture(true)}
                className="px-12 py-4 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl font-medium hover:from-primary/95 hover:to-primary/85 transition-all shadow-lg hover:shadow-xl tracking-wide"
              >
                Unlock Full Report
              </button>
              <p className="text-xs text-black/60 mt-4 font-light">
                Enter your email • No spam, ever
              </p>
            </div>
          </div>
        )}

        {/* Email Capture */}
        {showEmailCapture && (
          <div className="max-w-lg mx-auto text-center">
            <div className="bg-white/80 backdrop-blur-sm p-12 rounded-2xl border border-border/30 shadow-xl">
              <h2 className="text-2xl font-light mb-8 text-black tracking-tight">Get Your Full Report</h2>
              <p className="text-black/80 mb-10 font-light leading-relaxed">
                Enter your email to unlock all insights, action items, content ideas, and more.
              </p>
              
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-6 py-4 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 text-black bg-white/90 backdrop-blur-sm font-light text-center tracking-wide"
                  required
                />
                
                <button 
                  type="submit"
                  className="w-full px-8 py-4 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl font-medium hover:from-primary/95 hover:to-primary/85 transition-all shadow-lg hover:shadow-xl tracking-wide"
                >
                  Send Me The Full Report
                </button>
              </form>
              
              <p className="text-xs text-black/60 mt-6 font-light">
                We respect your privacy. Unsubscribe anytime.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}