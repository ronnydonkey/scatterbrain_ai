import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, Crown, Star, Gem, Flame, Sparkles, Brain, Users, MessageSquare, Search, Filter, Shuffle, X } from 'lucide-react';
import { ADVISOR_DIRECTORY, CATEGORIES, TIERS } from '@/data/advisorsDirectory';
import { AdvisorCard } from './AdvisorCard';
import { SynthesisPanel } from './SynthesisPanel';
import { CustomAdvisorModal } from './CustomAdvisorModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useBoard } from '@/hooks/useBoard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const BoardOfDirectors = ({ userId }: { userId?: string }) => {
  const {
    selectedAdvisors,
    setSelectedAdvisors,
    customAdvisors,
    addCustomAdvisor: addCustomAdvisorToDb,
    removeCustomAdvisor,
    saveBoard,
    loading: boardLoading
  } = useBoard(userId);

  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTier, setActiveTier] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userInput, setUserInput] = useState('');
  const [synthesis, setSynthesis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [viewMode, setViewMode] = useState<'select' | 'board'>('select');

  // Filter advisors based on search, category, and tier
  const filteredAdvisors = ADVISOR_DIRECTORY.filter(advisor => {
    const matchesSearch = advisor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         advisor.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         advisor.voice.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || advisor.category === activeCategory;
    const matchesTier = activeTier === 'all' || advisor.tier === activeTier;
    
    return matchesSearch && matchesCategory && matchesTier;
  });

  // Get tier icon
  const getTierIcon = (tier: string) => {
    const icons = { legendary: '👑', elite: '⭐', expert: '💎', insider: '🔥' };
    return icons[tier as keyof typeof icons] || '💎';
  };

  // Add advisor to board
  const addAdvisor = (advisor: any) => {
    if (selectedAdvisors.length >= 8) {
      alert('Maximum 8 advisors allowed on your board');
      return;
    }
    if (!selectedAdvisors.find(a => a.id === advisor.id)) {
      setSelectedAdvisors([...selectedAdvisors, advisor]);
    }
  };

  // Remove advisor from board
  const removeAdvisor = (advisorId: string) => {
    setSelectedAdvisors(selectedAdvisors.filter(a => a.id !== advisorId));
  };

  // Add custom advisor
  const addCustomAdvisor = async (advisor: any) => {
    try {
      const newAdvisor = await addCustomAdvisorToDb(advisor);
      if (newAdvisor) {
        setSelectedAdvisors([...selectedAdvisors, newAdvisor]);
        setShowCustomModal(false);
      }
    } catch (error) {
      console.error('Error adding custom advisor:', error);
    }
  };

  // Synthesize with board using real API (with demo fallback)
  const synthesizeWithBoard = async () => {
    if (!userInput.trim() || selectedAdvisors.length === 0) return;
    
    setIsLoading(true);
    setSynthesis(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/board-synthesis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          advisors: selectedAdvisors,
          input: userInput,
          userId: userId
        })
      });

      if (!response.ok) {
        throw new Error('API not available');
      }

      const result = await response.json();
      
      if (result.success) {
        setSynthesis({
          advisors: result.advisors,
          combinedSummary: result.combinedSummary,
          keyThemes: result.keyThemes,
          actionPlan: result.actionPlan,
          timestamp: result.timestamp
        });
      } else {
        throw new Error(result.error || 'Synthesis failed');
      }
    } catch (error) {
      console.warn('API synthesis failed, using demo response:', error);
      
      // Demo synthesis based on your question and selected advisors
      const demoSynthesis = {
        advisors: selectedAdvisors.map(advisor => {
          const responses = {
            'naval': `Focus on product-market fit first. Build something people desperately want, then worry about scaling. Your time investment means nothing if you're not solving a real problem. Make it so good that people can't help but talk about it.`,
            'reid-hoffman': `Network effects are key here. If ScatterbrainAI helps people think better, they'll naturally want to share insights with collaborators. Build viral loops into the product itself - make sharing and collaboration core features, not afterthoughts.`,
            'paul-graham': `Start with a small group of users who absolutely love it. Better to have 100 users who can't live without ScatterbrainAI than 10,000 who think it's "pretty good." Focus on making the core experience so valuable that growth becomes inevitable.`,
            'barbara-corcoran': `Get scrappy with user acquisition. Don't wait for perfect - get out there and hustle. Call potential users directly, demo the product face-to-face, ask for referrals. Your passion for the tool will be contagious if you believe in it.`,
            'peter-thiel': `Think about monopoly potential. What makes ScatterbrainAI 10x better than taking notes in a regular app? If it's just incrementally better, that's not enough. Find the contrarian truth about how people should really organize their thoughts.`
          };
          
          return {
            name: advisor.name,
            avatar: advisor.avatar,
            tier: advisor.tier,
            insight: responses[advisor.id as keyof typeof responses] || `As ${advisor.name}, I believe ${userInput.toLowerCase()} requires ${advisor.voice.split(',')[0].toLowerCase()} and strategic focus on creating genuine value for users.`
          };
        }),
        combinedSummary: `Your board unanimously agrees: focus on product-market fit before growth. Build something users desperately need, create natural sharing mechanisms, start with a passionate user base, hustle for early adoption, and ensure you're 10x better than alternatives. Success will come from solving a real problem exceptionally well.`,
        keyThemes: ['Product-Market Fit First', 'Build Viral Loops', 'Quality Over Quantity', 'Scrappy User Acquisition', '10x Better Not 10% Better'],
        actionPlan: [
          'Survey 50 potential users to validate the core problem ScatterbrainAI solves',
          'Identify and reach out to 10 power users who could become evangelists',
          'Build sharing/collaboration features into the core product experience',
          'Create a waitlist and personally onboard the first 100 users',
          'Define what makes ScatterbrainAI 10x better than existing note-taking tools',
          'Develop case studies showing measurable improvement in user productivity',
          'Set up referral systems and network effects within the product'
        ],
        timestamp: new Date().toISOString()
      };
      
      setSynthesis(demoSynthesis);
      
      toast({
        title: "Demo Synthesis Generated",
        description: "This is a demo response. Configure API keys for real AI synthesis.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Shuffle advisors for discovery
  const shuffleAdvisors = () => {
    const shuffled = [...ADVISOR_DIRECTORY].sort(() => Math.random() - 0.5);
    // Auto-select first 5 from shuffle if board is empty
    if (selectedAdvisors.length === 0) {
      setSelectedAdvisors(shuffled.slice(0, 5));
      setViewMode('board');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Crown className="h-8 w-8 text-yellow-500" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Board of Directors
          </h1>
          <Crown className="h-8 w-8 text-yellow-500" />
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Build your dream advisory team with the world's greatest minds. Get personalized insights from legendary entrepreneurs, thinkers, and innovators.
        </p>
        
        {/* Mode Toggle */}
        <div className="flex justify-center gap-2">
          <Button
            variant={viewMode === 'select' ? 'default' : 'outline'}
            onClick={() => setViewMode('select')}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Select Advisors ({ADVISOR_DIRECTORY.length})
          </Button>
          <Button
            variant={viewMode === 'board' ? 'default' : 'outline'}
            onClick={() => setViewMode('board')}
            className="flex items-center gap-2"
            disabled={selectedAdvisors.length === 0}
          >
            <Brain className="h-4 w-4" />
            My Board ({selectedAdvisors.length}/8)
          </Button>
        </div>
      </div>

      {viewMode === 'select' ? (
        <>
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search advisors by name, role, or expertise..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={activeCategory} onValueChange={setActiveCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={activeTier} onValueChange={setActiveTier}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="All Tiers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tiers</SelectItem>
                      {Object.entries(TIERS).map(([key, tier]) => (
                        <SelectItem key={key} value={key}>
                          {tier.icon} {tier.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={shuffleAdvisors} className="flex items-center gap-2">
                    <Shuffle className="h-4 w-4" />
                    Surprise Me
                  </Button>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCustomModal(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Custom Advisor
                </Button>
                
                {selectedAdvisors.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode('board')}
                    className="flex items-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Ask My Board ({selectedAdvisors.length})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tier Legend */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 justify-center">
                {Object.entries(TIERS).map(([key, tier]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${tier.color}`} />
                    <span className="text-sm font-medium">{tier.icon} {tier.label}</span>
                    <span className="text-xs text-muted-foreground">({tier.description})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Advisors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {filteredAdvisors.map((advisor, index) => (
                <motion.div
                  key={advisor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AdvisorCard
                    advisor={advisor}
                    isSelected={selectedAdvisors.some(a => a.id === advisor.id)}
                    onSelect={() => addAdvisor(advisor)}
                    onRemove={() => removeAdvisor(advisor.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredAdvisors.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No advisors found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or browse different categories.
                </p>
                <Button variant="outline" onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                  setActiveTier('all');
                }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        /* Board View */
        <div className="space-y-6">
          {/* Board Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Your Advisory Board ({selectedAdvisors.length}/8)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedAdvisors.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                  {selectedAdvisors.map(advisor => (
                    <div key={advisor.id} className="text-center group relative">
                      <div className="relative">
                        <Avatar className="h-16 w-16 mx-auto mb-2 border-2 border-muted">
                          <AvatarFallback className="text-2xl">
                            {advisor.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeAdvisor(advisor.id)}
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-xs font-medium truncate">{advisor.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{advisor.role}</div>
                      <div className="text-xs mt-1">{getTierIcon(advisor.tier)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No advisors selected</h3>
                  <p className="text-muted-foreground mb-4">
                    Go back to select advisors for your board.
                  </p>
                  <Button onClick={() => setViewMode('select')}>
                    Select Advisors
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Input Section */}
          {selectedAdvisors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Ask Your Board
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="What challenge are you facing? What decision do you need help with? Your board is ready to provide insights..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {selectedAdvisors.length} advisor{selectedAdvisors.length !== 1 ? 's' : ''} ready to respond
                  </div>
                  <Button 
                    onClick={synthesizeWithBoard}
                    disabled={!userInput.trim() || isLoading}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Consulting Board...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Get Board Insights
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Synthesis Results */}
          {synthesis && (
            <SynthesisPanel synthesis={synthesis} />
          )}
        </div>
      )}

      {/* Custom Advisor Modal */}
      <CustomAdvisorModal
        open={showCustomModal}
        onOpenChange={setShowCustomModal}
        onSave={addCustomAdvisor}
      />
    </div>
  );
};

export default BoardOfDirectors;