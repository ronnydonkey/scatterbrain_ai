import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, Lightbulb, Plus, Calendar, TrendingUp, BarChart3, Star, Brain, CheckCircle,
  ArrowRight, Crown, MessageCircle, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useThoughtFlow } from '@/context/ThoughtFlowContext';
import { toast } from 'sonner';
import { ADVISORS, type Advisor } from '@/data/advisors';

export default function CleanInsightGallery() {
  const navigate = useNavigate();
  const { originalThought, selectedInsights, setSelectedInsights } = useThoughtFlow();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [generatedInsights, setGeneratedInsights] = useState<any[]>([]);
  const [selectedAdvisorInsight, setSelectedAdvisorInsight] = useState<any>(null);
  const [advisorModalOpen, setAdvisorModalOpen] = useState(false);

  // Get relevant advisors for an insight based on category
  const getRelevantAdvisors = (category: string) => {
    // Map insight categories to advisor specialties
    const categoryMapping: Record<string, string[]> = {
      'Strategy': ['Business', 'Leadership', 'Innovation'],
      'History': ['History', 'Philosophy', 'Politics'],
      'Futurism': ['Innovation', 'Technology', 'Science'],
      'Psychology': ['Psychology', 'Philosophy', 'Human Behavior'],
      'Business': ['Business', 'Economics', 'Entrepreneurship'],
      'Personal Growth': ['Psychology', 'Philosophy', 'Self-Improvement'],
      'Design': ['Art', 'Design', 'Innovation']
    };

    const relevantSpecialties = categoryMapping[category] || ['Innovation'];
    
    // Find advisors with matching specialties
    const relevantAdvisors = ADVISORS.filter(advisor => 
      advisor.specialty.some(spec => 
        relevantSpecialties.some(relSpec => 
          spec.toLowerCase().includes(relSpec.toLowerCase()) ||
          relSpec.toLowerCase().includes(spec.toLowerCase())
        )
      )
    ).slice(0, 3); // Max 3 advisors per insight

    return relevantAdvisors;
  };

  // Generate insights based on original thought
  useEffect(() => {
    if (originalThought) {
      // Simulate AI generating insights from the original thought
      const generated = [
        {
          id: 'g1',
          title: 'Strategic Implications',
          preview: `Exploring the strategic dimensions of "${originalThought.slice(0, 50)}..." - how this could reshape industry dynamics and competitive advantages.`,
          category: 'Strategy',
          isGenerated: true,
          confidence: 0.92
        },
        {
          id: 'g2', 
          title: 'Historical Parallels',
          preview: `Similar patterns emerged during past technological shifts. Your thought echoes themes from the industrial revolution's transformation of work.`,
          category: 'History',
          isGenerated: true,
          confidence: 0.87
        },
        {
          id: 'g3',
          title: 'Future Scenarios',
          preview: `Three possible futures emerge from this idea: decentralized networks, hybrid ecosystems, or consolidated platforms. Each has unique implications.`,
          category: 'Futurism',
          isGenerated: true,
          confidence: 0.89
        },
        {
          id: 'g4',
          title: 'Psychological Dimensions',
          preview: `The human element in your thought reveals deep needs for autonomy, mastery, and purpose - core drivers of motivation and behavior change.`,
          category: 'Psychology',
          isGenerated: true,
          confidence: 0.85
        }
      ];
      setGeneratedInsights(generated);
    }
  }, [originalThought]);

  // Demo insights data
  const existingInsights = [
    {
      id: '1',
      title: 'The Future of Remote Work',
      preview: 'Exploring how distributed teams will shape innovation and collaboration in the next decade...',
      date: '2 days ago',
      category: 'Business',
      starred: true
    },
    {
      id: '2', 
      title: 'Learning in Public',
      preview: 'The power of sharing your journey as you learn - building audience and accelerating growth...',
      date: '1 week ago',
      category: 'Personal Growth',
      starred: false
    },
    {
      id: '3',
      title: 'Design Thinking Process',
      preview: 'Breaking down complex problems through human-centered design methodology...',
      date: '2 weeks ago',
      category: 'Design',
      starred: true
    }
  ];

  const filters = ['All', 'Strategy', 'History', 'Futurism', 'Psychology', 'Business', 'Personal Growth', 'Design'];

  // Combine generated and existing insights
  const allInsights = [...generatedInsights, ...existingInsights];

  const filteredInsights = allInsights.filter(insight => {
    const matchesSearch = insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         insight.preview.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'All' || insight.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-display mb-4">Insight Gallery</h1>
        <p className="text-subtitle max-w-2xl mx-auto">
          Explore your thoughts, discover patterns, and track your intellectual journey over time.
        </p>
      </motion.div>

      {/* Original Thought Display */}
      {originalThought && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <Card className="glass-card border-0 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Brain className="h-5 w-5 text-blue-600 mt-1" />
                <div className="flex-1">
                  <p className="text-small font-medium text-gray-700 mb-1">Your original thought:</p>
                  <p className="text-body text-gray-900">{originalThought}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-4xl mx-auto mb-8"
      >
        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search insights..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="modern-input pl-10"
                />
              </div>
              
              <div className="flex gap-2 flex-wrap">
                {filters.map(filter => (
                  <Button
                    key={filter}
                    variant={activeFilter === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter(filter)}
                    className={activeFilter === filter ? "btn-primary" : "btn-secondary"}
                  >
                    {filter}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Flow Continuation - Moved Above Grid */}
      {selectedInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <Card className="glass-card border-0 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="modern-card-content">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-left">
                  <h3 className="text-title mb-2">
                    {selectedInsights.length} Insight{selectedInsights.length !== 1 ? 's' : ''} Selected
                  </h3>
                  <p className="text-caption text-gray-600">
                    Ready to get perspectives from history's greatest minds?
                  </p>
                </div>
                <Button 
                  onClick={() => {
                    toast.success('Taking your insights to the advisory board...');
                    navigate('/board');
                  }}
                  className="btn-primary flex items-center gap-2"
                >
                  <Crown className="h-4 w-4" />
                  Consult Advisory Board
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Insights Grid */}
      {filteredInsights.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-6xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInsights.map((insight, index) => {
              const isSelected = selectedInsights.includes(insight.id);
              const isGenerated = insight.isGenerated;
              
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className={`group relative h-full cursor-pointer transition-all duration-300 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg ${
                    isSelected ? 'ring-2 ring-blue-400 shadow-lg bg-blue-50/30' : ''
                  } ${isGenerated ? 'border-l-4 border-l-purple-400' : ''} rounded-xl`}>
                    <CardContent className="p-6">
                      {/* Header with badges and status */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex gap-2 flex-wrap">
                          <Badge className={`text-xs font-medium px-2 py-1 rounded-full ${
                            isGenerated ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}>
                            {insight.category}
                          </Badge>
                          {isGenerated && (
                            <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full border border-purple-200">
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI Generated
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <div className="flex items-center gap-1 text-blue-600 text-xs font-medium">
                              <CheckCircle className="h-4 w-4 fill-current" />
                              Selected
                            </div>
                          )}
                          {insight.starred && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 leading-snug">
                        {insight.title}
                      </h3>

                      {/* Relevant Advisors */}
                      {(() => {
                        const relevantAdvisors = getRelevantAdvisors(insight.category);
                        return relevantAdvisors.length > 0 && (
                          <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-lg">
                            <span className="text-xs font-medium text-gray-600">Ask wisdom from:</span>
                            <div className="flex -space-x-2">
                              {relevantAdvisors.map((advisor, idx) => (
                                <button
                                  key={advisor.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAdvisorInsight({ insight, advisors: relevantAdvisors });
                                    setAdvisorModalOpen(true);
                                  }}
                                  className="w-8 h-8 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center text-sm hover:z-10 transition-all hover:scale-110 hover:shadow-md cursor-pointer"
                                  title={`Ask ${advisor.name} - ${advisor.role}`}
                                >
                                  {advisor.avatar}
                                </button>
                              ))}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAdvisorInsight({ insight, advisors: relevantAdvisors });
                                setAdvisorModalOpen(true);
                              }}
                              className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 px-2 py-1 rounded-md hover:bg-purple-50 transition-colors"
                            >
                              <MessageCircle className="h-3 w-3" />
                              Ask
                            </button>
                          </div>
                        );
                      })()}
                      
                      {/* Preview Text */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                        {insight.preview}
                      </p>
                      
                      {/* Confidence Indicator for AI Generated */}
                      {isGenerated && insight.confidence && (
                        <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                          <div className="flex justify-between items-center text-xs text-purple-700 mb-2">
                            <span className="font-medium flex items-center gap-1">
                              <Brain className="h-3 w-3" />
                              AI Confidence
                            </span>
                            <span className="font-semibold">{Math.round(insight.confidence * 100)}%</span>
                          </div>
                          <div className="w-full bg-purple-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${insight.confidence * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Bottom Section */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {isGenerated ? (
                            <>
                              <div className="p-1 bg-purple-100 rounded-full">
                                <Lightbulb className="h-3 w-3 text-purple-600" />
                              </div>
                              <span className="font-medium">Just generated</span>
                            </>
                          ) : (
                            <>
                              <div className="p-1 bg-blue-100 rounded-full">
                                <Calendar className="h-3 w-3 text-blue-600" />
                              </div>
                              <span className="font-medium">{insight.date}</span>
                            </>
                          )}
                        </div>
                        <Button 
                          variant={isSelected ? "default" : "ghost"}
                          size="sm" 
                          className={`transition-all duration-200 ${
                            isSelected 
                              ? "bg-blue-100 text-blue-700 hover:bg-blue-200" 
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isGenerated) {
                              // Toggle selection for generated insights
                              if (isSelected) {
                                setSelectedInsights(prev => prev.filter(id => id !== insight.id));
                              } else {
                                setSelectedInsights(prev => [...prev, insight.id]);
                              }
                            } else {
                              // View existing insight
                            }
                          }}
                        >
                          {isGenerated ? (
                            isSelected ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Selected
                              </>
                            ) : (
                              'Select'
                            )
                          ) : (
                            <>
                              <ArrowRight className="h-4 w-4 mr-1" />
                              View
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ) : (
        // Empty State
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="glass-card border-0">
            <CardContent className="modern-card-content text-center py-16">
              <Lightbulb className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-title mb-4">Your Gallery Awaits</h3>
              <p className="text-caption text-gray-600 mb-8 max-w-md mx-auto">
                Ready to transform scattered thoughts into organized insights? Your first synthesis is just a thought away.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => navigate('/')}
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Start Thinking
                </Button>
                <Button variant="outline" className="btn-secondary">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Try Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Stats */}
      {filteredInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto mt-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card border-0 text-center">
              <CardContent className="modern-card-content">
                <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-title">{allInsights.length}</p>
                <p className="text-caption text-gray-600">Total Insights</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-0 text-center">
              <CardContent className="modern-card-content">
                <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-title">{existingInsights.filter(i => i.starred).length}</p>
                <p className="text-caption text-gray-600">Starred</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-0 text-center">
              <CardContent className="modern-card-content">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-title">12</p>
                <p className="text-caption text-gray-600">Day Streak</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Advisor Modal */}
      <Dialog open={advisorModalOpen} onOpenChange={setAdvisorModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Get Wisdom on "{selectedAdvisorInsight?.insight?.title}"
            </DialogTitle>
          </DialogHeader>
          
          {selectedAdvisorInsight && (
            <div className="space-y-6">
              {/* Insight Preview */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-purple-200">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-700 mb-2">Your insight:</p>
                  <p className="text-gray-900 font-medium">{selectedAdvisorInsight.insight.preview}</p>
                </CardContent>
              </Card>

              {/* Available Advisors */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Choose Your Advisor
                </h3>
                <div className="grid gap-3">
                  {selectedAdvisorInsight.advisors.map((advisor: Advisor) => (
                    <Card 
                      key={advisor.id}
                      className="cursor-pointer hover:ring-2 hover:ring-purple-300 transition-all"
                      onClick={() => {
                        toast.success(`Consulting ${advisor.name}...`);
                        navigate('/board', { 
                          state: { 
                            selectedAdvisor: advisor, 
                            insight: selectedAdvisorInsight.insight 
                          } 
                        });
                        setAdvisorModalOpen(false);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{advisor.avatar}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-gray-900">{advisor.name}</h4>
                              <Badge 
                                className={`text-xs ${
                                  advisor.tier === 'legendary' 
                                    ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800'
                                    : advisor.tier === 'elite'
                                    ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800'
                                    : 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800'
                                }`}
                              >
                                {advisor.tier}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{advisor.role}</p>
                            <p className="text-xs text-gray-500">{advisor.voice}</p>
                          </div>
                          <div className="flex items-center text-purple-600">
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    navigate('/board', { state: { insight: selectedAdvisorInsight.insight } });
                    setAdvisorModalOpen(false);
                  }}
                  className="btn-primary flex-1"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Consult Full Board
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setAdvisorModalOpen(false)}
                >
                  Later
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}