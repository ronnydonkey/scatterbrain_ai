import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Crown, Search, Plus, X, Users, MessageSquare, Sparkles, Star, Gem,
  Brain, Lightbulb, ChevronLeft, ChevronRight, Filter, Settings
} from 'lucide-react';
import { NeuralAnimation } from '@/components/effects/NeuralAnimation';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useThoughtFlow } from '@/context/ThoughtFlowContext';
import { useAdvisorSelection } from '@/hooks/useAdvisorSelection';
import { 
  ADVISORS, 
  ADVISOR_CATEGORIES, 
  ADVISOR_TIERS, 
  ADVISOR_ERAS,
  ADVISORS_PER_PAGE,
  Advisor 
} from '@/data/advisors';

const TIER_COLORS = {
  legendary: 'from-yellow-400 to-orange-500',
  elite: 'from-purple-400 to-pink-500',
  expert: 'from-blue-400 to-cyan-500'
};

export default function CleanAdvisoryBoard() {
  const navigate = useNavigate();
  const { originalThought, selectedInsights, setAdvisorQuestion } = useThoughtFlow();
  const {
    selectedAdvisors,
    addAdvisor,
    removeAdvisor,
    isSelected,
    canAddMore
  } = useAdvisorSelection();

  // State for filtering and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [tierFilter, setTierFilter] = useState('All');
  const [eraFilter, setEraFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [question, setQuestion] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-populate question based on original thought
  useEffect(() => {
    if (originalThought && !question) {
      const autoQuestion = `Based on my thought: "${originalThought.slice(0, 100)}..." - what are the key implications and opportunities I should consider?`;
      setQuestion(autoQuestion);
      setAdvisorQuestion(autoQuestion);
    }
  }, [originalThought, setAdvisorQuestion]);

  // Filter advisors
  const filteredAdvisors = ADVISORS.filter(advisor => {
    const matchesSearch = advisor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         advisor.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         advisor.specialty.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'All' || advisor.category === categoryFilter;
    const matchesTier = tierFilter === 'All' || advisor.tier === tierFilter;
    const matchesEra = eraFilter === 'All' || advisor.era === eraFilter;
    
    return matchesSearch && matchesCategory && matchesTier && matchesEra;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAdvisors.length / ADVISORS_PER_PAGE);
  const startIndex = (currentPage - 1) * ADVISORS_PER_PAGE;
  const paginatedAdvisors = filteredAdvisors.slice(startIndex, startIndex + ADVISORS_PER_PAGE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, tierFilter, eraFilter]);

  const handleAddAdvisor = (advisor: Advisor) => {
    const success = addAdvisor(advisor);
    if (!success) {
      if (!canAddMore) {
        toast.error('Maximum 5 advisors allowed on your board');
      } else {
        toast.error('Advisor already selected');
      }
    } else {
      toast.success(`${advisor.name} added to your board`);
    }
  };

  const handleRemoveAdvisor = (advisorId: string) => {
    const advisor = selectedAdvisors.find(a => a.id === advisorId);
    removeAdvisor(advisorId);
    if (advisor) {
      toast.success(`${advisor.name} removed from your board`);
    }
  };

  const askBoard = () => {
    if (!question.trim()) {
      toast.error('Please ask a question first');
      return;
    }
    if (selectedAdvisors.length === 0) {
      toast.error('Please select advisors for your board');
      return;
    }
    
    // Store the question in context
    setAdvisorQuestion(question);
    
    // Start processing animation
    setIsProcessing(true);
    
    // Simulate processing time then navigate to synthesis
    setTimeout(() => {
      setIsProcessing(false);
      navigate('/synthesis');
    }, 3500);
  };

  return (
    <>
      {/* Processing Animation */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center"
          >
            <NeuralAnimation />
            
            <div className="relative z-10 text-center">
              {/* Scatterbrain Logo */}
              <div className="flex justify-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Brain className="h-7 w-7 text-white animate-pulse" />
                  </div>
                  <span className="text-3xl font-bold text-gray-900">Scatterbrain</span>
                </div>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-6">
                Convening Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Advisory Board</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Your selected advisors are deliberating on your question...
              </p>
              
              {/* Selected Advisors Preview */}
              <div className="flex justify-center gap-4 mb-8">
                {selectedAdvisors.slice(0, 5).map((advisor, index) => (
                  <motion.div
                    key={advisor.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.2 }}
                    className="relative"
                  >
                    <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                      <AvatarFallback className="text-lg bg-gradient-to-br from-gray-100 to-gray-200">
                        {advisor.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <motion.div
                      className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                  </motion.div>
                ))}
              </div>
              
              <p className="text-sm text-gray-500">
                Synthesizing insights from {selectedAdvisors.length} advisor{selectedAdvisors.length !== 1 ? 's' : ''}...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-6 py-12">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-display mb-4">Advisory Board</h1>
        <p className="text-subtitle max-w-2xl mx-auto">
          Choose from {ADVISORS.length} legendary minds across history. Build your dream advisory team.
        </p>
      </motion.div>

      {/* Context Display */}
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
                  <p className="text-small font-medium text-gray-700 mb-1">Your thinking journey:</p>
                  <p className="text-body text-gray-900 mb-2">{originalThought}</p>
                  {selectedInsights.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-small text-gray-600">
                        <Lightbulb className="h-3 w-3 inline mr-1" />
                        {selectedInsights.length} insights selected for advisor perspective
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Current Board */}
      {selectedAdvisors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-600" />
                Your Advisory Board ({selectedAdvisors.length}/5)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {selectedAdvisors.map(advisor => (
                  <div key={advisor.id} className="text-center group relative">
                    <Avatar className="h-16 w-16 mx-auto mb-2 border-2 border-white shadow-md">
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                        {advisor.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveAdvisor(advisor.id)}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <p className="text-small font-medium truncate">{advisor.name}</p>
                    <p className="text-xs text-gray-500 truncate">{advisor.role}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Question Input */}
      {selectedAdvisors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Ask Your Board
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What challenge are you facing? What decision do you need help with?"
                  className="modern-input"
                />
                <div className="flex justify-between items-center">
                  <p className="text-small text-gray-500">
                    {selectedAdvisors.length} advisor{selectedAdvisors.length !== 1 ? 's' : ''} ready to respond
                  </p>
                  <Button onClick={askBoard} className="btn-primary">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Synthesis
                  </Button>
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
        transition={{ delay: 0.3 }}
        className="max-w-6xl mx-auto mb-6"
      >
        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search and Filter Toggle */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search advisors by name, role, or specialty..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="modern-input pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>

              {/* Advanced Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 border-t border-gray-200 pt-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Category Filter */}
                      <div>
                        <label className="text-small font-medium text-gray-700 mb-2 block">Category</label>
                        <select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="w-full modern-input"
                        >
                          {ADVISOR_CATEGORIES.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>

                      {/* Tier Filter */}
                      <div>
                        <label className="text-small font-medium text-gray-700 mb-2 block">Tier</label>
                        <select
                          value={tierFilter}
                          onChange={(e) => setTierFilter(e.target.value)}
                          className="w-full modern-input"
                        >
                          {ADVISOR_TIERS.map(tier => (
                            <option key={tier} value={tier}>
                              {tier === 'All' ? 'All Tiers' : tier.charAt(0).toUpperCase() + tier.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Era Filter */}
                      <div>
                        <label className="text-small font-medium text-gray-700 mb-2 block">Era</label>
                        <select
                          value={eraFilter}
                          onChange={(e) => setEraFilter(e.target.value)}
                          className="w-full modern-input"
                        >
                          {ADVISOR_ERAS.map(era => (
                            <option key={era} value={era}>{era}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results Summary and Pagination */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-small text-gray-600">
            Showing {startIndex + 1}-{Math.min(startIndex + ADVISORS_PER_PAGE, filteredAdvisors.length)} of {filteredAdvisors.length} advisors
          </p>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn-secondary"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn-secondary"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Advisors Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="max-w-6xl mx-auto"
      >
        {paginatedAdvisors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {paginatedAdvisors.map((advisor, index) => {
                const advisorSelected = isSelected(advisor.id);
                
                return (
                  <motion.div
                    key={advisor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card className={`modern-card cursor-pointer transition-all duration-200 ${
                      advisorSelected ? 'ring-2 ring-blue-200 bg-blue-50' : ''
                    }`}>
                      <CardContent className="modern-card-content">
                        <div className="flex items-start justify-between mb-3">
                          <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                            <AvatarFallback className="text-xl bg-gradient-to-br from-gray-100 to-gray-200">
                              {advisor.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <Badge className={`text-xs text-white bg-gradient-to-r ${TIER_COLORS[advisor.tier]}`}>
                            {advisor.tier === 'legendary' && <Crown className="h-3 w-3 mr-1" />}
                            {advisor.tier === 'elite' && <Star className="h-3 w-3 mr-1" />}
                            {advisor.tier === 'expert' && <Gem className="h-3 w-3 mr-1" />}
                            {advisor.tier}
                          </Badge>
                        </div>
                        
                        <h3 className="text-body font-semibold mb-1">{advisor.name}</h3>
                        <p className="text-caption text-gray-600 mb-2">{advisor.role}</p>
                        <p className="text-xs text-gray-500 mb-3">{advisor.era} • {advisor.category}</p>
                        <p className="text-small text-gray-700 line-clamp-2 mb-3">{advisor.voice}</p>
                        
                        <div className="flex flex-wrap gap-1 mb-4">
                          {advisor.specialty.slice(0, 2).map(spec => (
                            <Badge key={spec} className="text-xs bg-gray-100 text-gray-700">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                        
                        <Button
                          onClick={() => advisorSelected ? handleRemoveAdvisor(advisor.id) : handleAddAdvisor(advisor)}
                          variant={advisorSelected ? "outline" : "default"}
                          size="sm"
                          className={`w-full ${advisorSelected ? 'border-red-200 text-red-600 hover:bg-red-50' : 'btn-primary'}`}
                          disabled={!advisorSelected && !canAddMore}
                        >
                          {advisorSelected ? (
                            <>
                              <X className="h-3 w-3 mr-1" />
                              Remove
                            </>
                          ) : (
                            <>
                              <Plus className="h-3 w-3 mr-1" />
                              Add to Board
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <Card className="glass-card border-0">
            <CardContent className="modern-card-content text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-title mb-2">No advisors found</h3>
              <p className="text-caption text-gray-600 mb-4">
                Try adjusting your search criteria or filters.
              </p>
              <Button 
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('All');
                  setTierFilter('All');
                  setEraFilter('All');
                }}
                variant="outline"
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Bottom Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-6xl mx-auto mt-8"
        >
          <Card className="glass-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-2">
                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum ? "btn-primary" : "btn-secondary"}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="text-gray-400">...</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        className="btn-secondary"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-secondary flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-center mt-3">
                <p className="text-small text-gray-600">
                  {filteredAdvisors.length} advisors total
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
    </>
  );
}