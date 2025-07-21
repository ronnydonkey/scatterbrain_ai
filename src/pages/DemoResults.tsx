import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface DemoResults {
  insights: {
    keyThemes: Array<{
      theme: string;
      confidence: number;
      evidence: string[];
      relatedConcepts: string[];
    }>;
    actionItems: Array<{
      id: string;
      task: string;
      priority: string;
      category: string;
      estimatedDuration: string;
      suggestedTime: string;
    }>;
    contentSuggestions: {
      twitter?: {
        content: string;
        hashtags?: string[];
      };
      linkedin?: {
        content: string;
        post_type?: string;
      };
      instagram?: {
        content: string;
        style?: string;
      };
    };
    researchSuggestions: Array<{
      topic: string;
      sources: string[];
      relevance: number;
    }>;
    calendarBlocks: Array<{
      title: string;
      duration: number;
      priority: string;
      suggestedTimes: string[];
    }>;
  };
  metadata: {
    wordCount: number;
    sentiment: string;
    complexity: string;
    topics: string[];
  };
}

export default function DemoResults() {
  const navigate = useNavigate();
  const [results, setResults] = useState<DemoResults | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    // Get stored results and email
    const storedResults = localStorage.getItem('demo_full_results');
    const storedEmail = localStorage.getItem('demo_user_email');
    
    if (!storedResults || !storedEmail) {
      toast({
        title: "No demo results found",
        description: "Please try the demo again from the homepage.",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    try {
      const parsedResults = JSON.parse(storedResults);
      setResults(parsedResults);
      setUserEmail(storedEmail);
    } catch (error) {
      console.error('Failed to parse demo results:', error);
      navigate('/');
    }
  }, [navigate]);

  const handleSignUp = () => {
    // Store intent to return here after signup
    localStorage.setItem('return_to_demo_results', 'true');
    navigate('/auth');
  };

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your results...</p>
        </div>
      </div>
    );
  }

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
          <button 
            onClick={handleSignUp}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Get Full Access
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-light mb-4 tracking-tight text-black">Your Complete Analysis Report</h1>
          <p className="text-black/70 font-light">
            Delivered to <span className="font-medium text-primary">{userEmail}</span>
          </p>
        </div>

        {/* Results Grid */}
        <div className="space-y-10">
          {/* Key Themes */}
          <div className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl border border-border/30 shadow-sm">
            <h2 className="text-lg font-medium mb-6 text-black flex items-center">
              Key Themes Identified
              <span className="ml-3 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-light">
                {results.insights.keyThemes.length} identified
              </span>
            </h2>
            <div className="grid gap-4">
              {results.insights.keyThemes.map((theme, index) => (
                <div key={index} className="p-6 bg-muted/20 rounded-xl border border-border/20">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-black text-sm">{theme.theme}</h3>
                    <span className="text-xs text-primary font-light">
                      {Math.round(theme.confidence * 100)}% confidence
                    </span>
                  </div>
                  <div className="text-xs text-black/70 space-y-2 font-light">
                    <p><span className="font-medium">Evidence:</span> {theme.evidence.join(', ')}</p>
                    <p><span className="font-medium">Related:</span> {theme.relatedConcepts.join(', ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Items */}
          <div className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl border border-border/30 shadow-sm">
            <h2 className="text-lg font-medium mb-6 text-black flex items-center">
              Immediate Action Items
              <span className="ml-3 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-light">
                {results.insights.actionItems.length} recommended
              </span>
            </h2>
            <div className="space-y-3">
              {results.insights.actionItems.map((action, index) => (
                <div key={action.id} className="p-6 bg-muted/20 rounded-xl border border-border/20">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-black text-sm">{action.task}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      action.priority === 'high' ? 'bg-red-100 text-red-700' :
                      action.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {action.priority} priority
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-black/60 font-light">
                    <span>{action.category}</span>
                    <span>{action.estimatedDuration}</span>
                    <span>Best time: {action.suggestedTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Suggestions */}
          <div className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl border border-border/30 shadow-sm">
            <h2 className="text-lg font-medium mb-6 text-black">Social Content Ideas</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {results.insights.contentSuggestions.twitter && (
                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200/50">
                  <h3 className="font-medium text-black mb-2 text-sm">Twitter/X</h3>
                  <p className="text-sm italic mb-2">"{results.insights.contentSuggestions.twitter.content}"</p>
                  {results.insights.contentSuggestions.twitter.hashtags && (
                    <p className="text-xs text-blue-600">
                      {results.insights.contentSuggestions.twitter.hashtags.join(' ')}
                    </p>
                  )}
                </div>
              )}
              
              {results.insights.contentSuggestions.linkedin && (
                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200/50">
                  <h3 className="font-medium text-black mb-2 text-sm">LinkedIn</h3>
                  <p className="text-sm italic mb-2">"{results.insights.contentSuggestions.linkedin.content}"</p>
                  <p className="text-xs text-indigo-600">
                    Type: {results.insights.contentSuggestions.linkedin.post_type}
                  </p>
                </div>
              )}
              
              {results.insights.contentSuggestions.instagram && (
                <div className="p-4 bg-pink-50/50 rounded-xl border border-pink-200/50">
                  <h3 className="font-medium text-black mb-2 text-sm">Instagram</h3>
                  <p className="text-sm italic mb-2">"{results.insights.contentSuggestions.instagram.content}"</p>
                  <p className="text-xs text-pink-600">
                    Style: {results.insights.contentSuggestions.instagram.style}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Research Suggestions */}
          {results.insights.researchSuggestions.length > 0 && (
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">🔬 Research Suggestions</h2>
              <div className="space-y-3">
                {results.insights.researchSuggestions.map((research, index) => (
                  <div key={index} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{research.topic}</h3>
                      <span className="text-sm text-primary">
                        {Math.round(research.relevance * 100)}% relevant
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <strong>Sources:</strong> {research.sources.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Calendar Blocks */}
          {results.insights.calendarBlocks.length > 0 && (
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">📅 Suggested Calendar Blocks</h2>
              <div className="space-y-3">
                {results.insights.calendarBlocks.map((block, index) => (
                  <div key={index} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{block.title}</h3>
                      <span className="text-sm text-muted-foreground">
                        {block.duration} minutes
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className={`inline-block px-2 py-1 rounded text-xs mr-2 ${
                        block.priority === 'high' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {block.priority} priority
                      </span>
                      <span>Suggested times: {block.suggestedTimes.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analysis Metadata */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">📊 Analysis Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded">
                <p className="text-2xl font-bold text-primary">{results.metadata.wordCount}</p>
                <p className="text-sm text-muted-foreground">Words analyzed</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded">
                <p className="text-2xl font-bold text-primary capitalize">{results.metadata.sentiment}</p>
                <p className="text-sm text-muted-foreground">Overall sentiment</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded">
                <p className="text-2xl font-bold text-primary capitalize">{results.metadata.complexity}</p>
                <p className="text-sm text-muted-foreground">Complexity level</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded">
                <p className="text-2xl font-bold text-primary">{results.metadata.topics.length}</p>
                <p className="text-sm text-muted-foreground">Topics identified</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                <strong>Main topics:</strong> {results.metadata.topics.join(', ')}
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-primary/8 to-primary/4 p-10 rounded-2xl border border-primary/20 text-center">
            <h2 className="text-xl font-light mb-6 tracking-tight text-black">Ready to analyze unlimited thoughts?</h2>
            <p className="text-black/70 mb-8 max-w-xl mx-auto font-light leading-relaxed">
              This is just the beginning. Create an account to save your insights, build on your ideas, and transform every scattered thought into clear action.
            </p>
            
            <button 
              onClick={handleSignUp}
              className="px-12 py-4 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl font-medium hover:from-primary/95 hover:to-primary/85 transition-all shadow-lg hover:shadow-xl tracking-wide"
            >
              Start Your Free Account
            </button>
            
            <p className="text-sm text-black/60 mt-6 font-light">
              Free account • No credit card required • Unlimited analysis
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}