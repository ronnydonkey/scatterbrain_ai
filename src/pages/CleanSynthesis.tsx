import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Sparkles, BookOpen, PenTool, Crown, ArrowRight, CheckCircle, 
  Lightbulb, Brain, Star, Copy, Twitter, Linkedin, FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useThoughtFlow } from '@/context/ThoughtFlowContext';
import { synthesizeThought } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

// Demo advisor insights and extrapolated thoughts
const DEMO_ADVISOR_INSIGHTS = [
  {
    advisor: { name: 'Steve Jobs', avatar: '📱' },
    insight: "Focus on simplicity and user experience. What's the core problem you're solving?"
  },
  {
    advisor: { name: 'Albert Einstein', avatar: '⚡' },
    insight: "Look for the fundamental principles. What assumptions can you challenge?"
  },
  {
    advisor: { name: 'Leonardo da Vinci', avatar: '🎨' },
    insight: "Connect disparate fields. How does this relate to other domains?"
  }
];

const DEMO_EXTRAPOLATED_THOUGHTS = [
  {
    id: '1',
    title: 'Simplifying Complex Systems Through First Principles',
    content: 'Breaking down intricate problems to their foundational elements reveals unexpected solutions. By questioning every assumption and rebuilding from the ground up, we can create more elegant and effective approaches.',
    inspiringAdvisors: ['Einstein', 'Jobs'],
    category: 'Problem Solving',
    impact: 'High'
  },
  {
    id: '2', 
    title: 'Cross-Disciplinary Innovation Patterns',
    content: 'The most breakthrough innovations emerge at the intersection of different fields. By studying how principles from biology apply to technology, or how art informs business strategy, we unlock new paradigms.',
    inspiringAdvisors: ['Leonardo', 'Jobs'],
    category: 'Innovation',
    impact: 'Medium'
  },
  {
    id: '3',
    title: 'User-Centric Design Thinking',
    content: 'True innovation starts with deep empathy for human needs. By obsessing over the user experience and removing unnecessary complexity, we create solutions that feel magical and intuitive.',
    inspiringAdvisors: ['Jobs', 'Leonardo'],
    category: 'Design',
    impact: 'High'
  }
];

export default function CleanSynthesis() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { originalThought, selectedInsights, advisorQuestion, setSynthesizedThoughts } = useThoughtFlow();
  const [selectedThoughts, setSelectedThoughts] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showContentModal, setShowContentModal] = useState(false);
  const [selectedThoughtForContent, setSelectedThoughtForContent] = useState<any>(null);
  const [synthesisData, setSynthesisData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSynthesis = async () => {
      if (!originalThought) {
        console.log('No original thought found, using demo data');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await synthesizeThought(originalThought, {
          userId: user?.id,
          sessionId: `session_${Date.now()}`,
          preferences: {}
        });

        setSynthesisData(result);
        setSynthesizedThoughts([result]);
      } catch (err: any) {
        console.error('Synthesis failed:', err);
        setError(err.message || 'Failed to generate synthesis');
        toast.error('Failed to generate synthesis. Using demo data.');
      } finally {
        setLoading(false);
      }
    };

    loadSynthesis();
  }, [originalThought, user?.id, setSynthesizedThoughts]);

  const toggleThoughtSelection = (thoughtId: string) => {
    setSelectedThoughts(prev => 
      prev.includes(thoughtId) 
        ? prev.filter(id => id !== thoughtId)
        : [...prev, thoughtId]
    );
  };

  const saveToGallery = () => {
    if (selectedThoughts.length === 0) {
      toast.error('Please select at least one thought to save');
      return;
    }
    toast.success(`${selectedThoughts.length} thought(s) saved to your gallery`);
    navigate('/gallery');
  };

  const createContent = (thought: any) => {
    setSelectedThoughtForContent(thought);
    setShowContentModal(true);
  };
  
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  const generateSocialContent = (thought: any, format: 'twitter' | 'linkedin' | 'blog') => {
    const content = thought.content;
    
    switch(format) {
      case 'twitter':
        return `${content.slice(0, 250)}... \n\n#AI #Innovation #Thoughts`;
      case 'linkedin':
        return `💡 Key Insight: ${thought.title}\n\n${content}\n\nThis emerged from exploring "${originalThought?.slice(0, 50)}..." with AI-powered synthesis.\n\n#ThoughtLeadership #Innovation #AI`;
      case 'blog':
        return `# ${thought.title}\n\n${content}\n\n## Key Takeaways\n\n- ${thought.inspiringAdvisors.join(', ')} perspectives\n- ${thought.impact} impact potential\n- Category: ${thought.category}\n\n---\n\n*This insight was generated through AI-powered thought synthesis.*`;
      default:
        return content;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin mx-auto" />
            <p className="text-caption text-gray-600">Generating synthesis...</p>
          </div>
        </div>
      </div>
    );
  }

  // Determine which data to use
  const insights = synthesisData?.insights || {};
  const keyThemes = insights.keyThemes || [];
  const actionItems = insights.actionItems || [];
  const contentSuggestions = insights.contentSuggestions || {};
  const extrapolatedThoughts = synthesisData ? [
    {
      id: synthesisData.id,
      title: keyThemes[0]?.theme || 'Generated Insights',
      content: keyThemes[0]?.evidence?.join(' ') || originalThought,
      inspiringAdvisors: ['AI Analysis'],
      category: keyThemes[0]?.theme || 'General',
      impact: 'High'
    },
    ...keyThemes.slice(1).map((theme: any, index: number) => ({
      id: `theme_${index + 1}`,
      title: theme.theme,
      content: theme.evidence?.join(' ') || theme.relatedConcepts?.join(' ') || 'Key insight discovered',
      inspiringAdvisors: ['AI Analysis'],
      category: theme.theme,
      impact: theme.confidence > 0.8 ? 'High' : 'Medium'
    }))
  ] : DEMO_EXTRAPOLATED_THOUGHTS;

  const advisorInsights = synthesisData ? [
    {
      advisor: { name: 'AI Synthesis', avatar: '🧠' },
      insight: `Analyzed your thought: "${originalThought?.substring(0, 100)}..."`
    },
    {
      advisor: { name: 'Content Optimizer', avatar: '✨' },
      insight: contentSuggestions.twitter?.content?.substring(0, 100) + '...' || 'Generated content suggestions for multiple platforms'
    },
    {
      advisor: { name: 'Action Planner', avatar: '🎯' },
      insight: actionItems[0]?.task || 'Created actionable next steps based on your thinking'
    }
  ] : DEMO_ADVISOR_INSIGHTS;

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-6 w-6 text-purple-600" />
          <h1 className="text-4xl font-bold text-gray-900">Synthesis</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Your advisors have weighed in. Here are refined thoughts that emerged from their collective wisdom.
        </p>
      </motion.div>

      {/* Advisor Insights Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-4xl mx-auto mb-8"
      >
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-purple-600" />
              Advisory Perspectives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {advisorInsights.map((insight, index) => (
                <div key={index} className="flex gap-3 p-3 rounded-lg bg-gray-50">
                  <Avatar className="h-8 w-8 border border-white shadow-sm">
                    <AvatarFallback className="text-sm bg-gradient-to-br from-gray-100 to-gray-200">
                      {insight.advisor.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-small font-medium mb-1">{insight.advisor.name}</p>
                    <p className="text-xs text-gray-600 line-clamp-3">{insight.insight}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Extrapolated Thoughts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-6xl mx-auto mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Extrapolated Thoughts</h2>
            <p className="text-caption text-gray-600">
              Select thoughts to save to your gallery or develop into content
            </p>
          </div>
          {selectedThoughts.length > 0 && (
            <Badge className="bg-blue-100 text-blue-800">
              {selectedThoughts.length} selected
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {extrapolatedThoughts.map((thought, index) => {
            const isSelected = selectedThoughts.includes(thought.id);
            
            return (
              <motion.div
                key={thought.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card 
                  className={`shadow-lg border-0 bg-white/90 backdrop-blur cursor-pointer transition-all duration-200 hover:shadow-xl ${
                    isSelected ? 'ring-2 ring-blue-300 bg-blue-50' : ''
                  }`}
                  onClick={() => toggleThoughtSelection(thought.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex gap-2">
                        <Badge className="bg-purple-100 text-purple-800 text-xs">
                          {thought.category}
                        </Badge>
                        <Badge 
                          className={`text-xs ${
                            thought.impact === 'High' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {thought.impact} Impact
                        </Badge>
                      </div>
                      {isSelected && (
                        <CheckCircle className="h-5 w-5 text-blue-600 fill-current" />
                      )}
                    </div>
                    
                    <h3 className="text-body font-semibold mb-3 line-clamp-2">
                      {thought.title}
                    </h3>
                    
                    <p className="text-caption text-gray-600 mb-4 line-clamp-4">
                      {thought.content}
                    </p>
                    
                    <div className="flex items-center gap-1 mb-3">
                      <Lightbulb className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        Inspired by {thought.inspiringAdvisors.join(', ')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs p-1.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          createContent(thought);
                        }}
                        title="Create social content"
                      >
                        <PenTool className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs p-1.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(thought.content, thought.id);
                        }}
                        title="Copy to clipboard"
                      >
                        {copiedId === thought.id ? (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`text-xs px-2 py-1 ${
                          isSelected ? 'bg-blue-100 text-blue-600' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleThoughtSelection(thought.id);
                        }}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Action Buttons */}
      {selectedThoughts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur">
            <CardContent className="modern-card-content">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div>
                  <h3 className="text-body font-semibold mb-1">
                    {selectedThoughts.length} thought{selectedThoughts.length !== 1 ? 's' : ''} selected
                  </h3>
                  <p className="text-caption text-gray-600">
                    Choose how you'd like to proceed with your selected thoughts
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={saveToGallery}
                    variant="outline"
                    className="btn-secondary flex items-center gap-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    Save to Gallery
                  </Button>
                  <Button
                    onClick={createContent}
                    className="btn-primary flex items-center gap-2"
                  >
                    <PenTool className="h-4 w-4" />
                    Create Content
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Empty State */}
      {selectedThoughts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-2xl mx-auto text-center"
        >
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur">
            <CardContent className="modern-card-content py-12">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-title mb-2">Select thoughts to continue</h3>
              <p className="text-caption text-gray-600 mb-6">
                Choose the refined thoughts that resonate with you to either save for later or develop into content.
              </p>
              <Button
                onClick={() => navigate('/board')}
                variant="outline"
                className="btn-secondary"
              >
                Back to Advisory
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Social Content Modal */}
      {showContentModal && selectedThoughtForContent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-title mb-2">Create Social Content</h3>
              <p className="text-caption text-gray-600">
                Transform your insight into shareable content
              </p>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
              {/* Twitter */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Twitter className="h-5 w-5 text-blue-500" />
                    <h4 className="font-semibold">Twitter Thread</h4>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(
                      generateSocialContent(selectedThoughtForContent, 'twitter'),
                      'twitter'
                    )}
                  >
                    {copiedId === 'twitter' ? (
                      <><CheckCircle className="h-3 w-3 mr-1" /> Copied!</>
                    ) : (
                      <><Copy className="h-3 w-3 mr-1" /> Copy</>
                    )}
                  </Button>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-sm whitespace-pre-wrap">
                  {generateSocialContent(selectedThoughtForContent, 'twitter')}
                </div>
              </div>

              {/* LinkedIn */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-5 w-5 text-blue-700" />
                    <h4 className="font-semibold">LinkedIn Post</h4>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(
                      generateSocialContent(selectedThoughtForContent, 'linkedin'),
                      'linkedin'
                    )}
                  >
                    {copiedId === 'linkedin' ? (
                      <><CheckCircle className="h-3 w-3 mr-1" /> Copied!</>
                    ) : (
                      <><Copy className="h-3 w-3 mr-1" /> Copy</>
                    )}
                  </Button>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-sm whitespace-pre-wrap">
                  {generateSocialContent(selectedThoughtForContent, 'linkedin')}
                </div>
              </div>

              {/* Blog */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-700" />
                    <h4 className="font-semibold">Blog Draft</h4>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(
                      generateSocialContent(selectedThoughtForContent, 'blog'),
                      'blog'
                    )}
                  >
                    {copiedId === 'blog' ? (
                      <><CheckCircle className="h-3 w-3 mr-1" /> Copied!</>
                    ) : (
                      <><Copy className="h-3 w-3 mr-1" /> Copy</>
                    )}
                  </Button>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-sm whitespace-pre-wrap font-mono">
                  {generateSocialContent(selectedThoughtForContent, 'blog')}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setShowContentModal(false);
                  setSelectedThoughtForContent(null);
                }}
              >
                Close
              </Button>
              <Button
                className="btn-primary"
                onClick={() => {
                  navigate('/content');
                }}
              >
                Advanced Editor
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}