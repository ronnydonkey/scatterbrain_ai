import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, PenTool, Lightbulb, Crown, Mic, Upload, 
  ArrowRight, Sparkles, MessageSquare, TrendingUp, Target, Share2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useThoughtFlow } from '@/context/ThoughtFlowContext';
import { NeuralAnimation } from '@/components/effects/NeuralAnimation';
import { analyzeThought } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

export default function CleanHomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setOriginalThought } = useThoughtFlow();
  const [thought, setThought] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleQuickCapture = async () => {
    if (!thought.trim()) {
      toast.error('Please enter a thought first');
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      // Analyze the thought with real API
      const analysis = await analyzeThought(thought, { userId: user?.id });
      
      // Store the thought in context
      setOriginalThought(thought);
      
      // Process the thought
      toast.success('Thought captured! Let\'s explore insights and get advisor perspectives.');
      
      // Navigate to insights gallery to start the flow
      navigate('/gallery');
    } catch (error: any) {
      console.error('Thought analysis failed:', error);
      toast.error('Analysis failed, but we\'ll still explore your thought!');
      
      // Store the thought in context anyway
      setOriginalThought(thought);
      
      // Navigate to insights gallery to start the flow
      navigate('/gallery');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const quickActions = [
    {
      title: 'Capture',
      description: 'Turn scattered thoughts into structured insights',
      icon: Brain,
      color: 'blue',
      action: () => navigate('/gallery'),
      primary: false,
      step: '1'
    },
    {
      title: 'Synthesize', 
      description: 'AI finds patterns and connections',
      icon: Sparkles,
      color: 'purple',
      action: () => navigate('/board'),
      primary: false,
      step: '2'
    },
    {
      title: 'Create',
      description: 'Transform insights into content that matters',
      icon: PenTool,
      color: 'green',
      action: () => navigate('/synthesis'),
      primary: false,
      step: '3'
    },
    {
      title: 'Share/Act',
      description: 'Put your ideas to work',
      icon: Share2,
      color: 'orange',
      action: () => navigate('/synthesis'),
      primary: true,
      step: '4'
    }
  ];

  const recentInsights = [
    {
      title: 'The Future of Remote Work',
      date: '2 days ago',
      preview: 'Exploring how distributed teams will shape innovation...'
    },
    {
      title: 'Learning in Public',
      date: '1 week ago',
      preview: 'The power of sharing your journey as you learn...'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      <NeuralAnimation />
      
      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            What's on your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">mind</span>?
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Capture your thoughts and watch them transform into insights, content, and connections with the greatest minds in history.
          </p>
        </motion.div>

        {/* Main Thought Capture */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur">
            <CardContent className="p-8">
              {/* Input Area */}
              <div className="space-y-6">
                <Textarea
                  value={thought}
                  onChange={(e) => setThought(e.target.value)}
                  placeholder="Share what you're thinking about..."
                  className="modern-input min-h-32 text-lg leading-relaxed resize-none border-0 bg-transparent focus:ring-0 p-0"
                />

                {/* Input Methods */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="border-gray-300 hover:border-purple-400 bg-white/90 backdrop-blur text-gray-700"
                      onClick={() => setIsRecording(!isRecording)}
                    >
                      <Mic className={`h-4 w-4 ${isRecording ? 'text-red-500' : ''}`} />
                      <span className="ml-2 text-sm">Voice</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="border-gray-300 hover:border-purple-400 bg-white/90 backdrop-blur text-gray-700"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      <span className="ml-2 text-sm">Upload</span>
                    </Button>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.md,.doc,.docx"
                      className="hidden"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      {thought.length} characters
                    </span>
                    <Button
                      onClick={handleQuickCapture}
                      disabled={!thought.trim() || isAnalyzing}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Explore This Thought
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-6xl mx-auto mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Journey from Thought to Impact</h2>
            <p className="text-lg text-gray-600">
              Capture → Synthesize → Create → Share/Act
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`shadow-lg border-0 bg-white/90 backdrop-blur cursor-pointer transition-all duration-200 hover:shadow-xl ${
                      action.primary ? 'ring-2 ring-purple-200 bg-purple-50' : ''
                    }`}
                    onClick={action.action}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="relative">
                        <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-${action.color}-100 flex items-center justify-center`}>
                          <Icon className={`h-6 w-6 text-${action.color}-600`} />
                        </div>
                        <Badge className="absolute -top-2 -right-8 w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs flex items-center justify-center">
                          {action.step}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                      <div className="flex items-center justify-center text-sm text-purple-600 font-medium">
                        {action.primary ? 'Start flow' : 'Step ' + action.step}
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Insights */}
        {recentInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Insights</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/gallery')}
                className="text-purple-600 hover:text-purple-700"
              >
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="space-y-4">
              {recentInsights.map((insight, index) => (
                <motion.div
                  key={insight.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Card className="modern-card cursor-pointer">
                    <CardContent className="modern-card-content">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-body font-semibold mb-1">{insight.title}</h3>
                          <p className="text-caption text-gray-600 mb-2">{insight.preview}</p>
                          <Badge variant="secondary" className="text-xs">
                            {insight.date}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}