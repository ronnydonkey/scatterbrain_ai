import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, MessageSquare, Crown, Star, Gem, Flame, Copy, Share, Download } from 'lucide-react';
import { TIERS } from '@/data/advisorsDirectory';
import { motion } from 'framer-motion';

interface SynthesisPanelProps {
  synthesis: {
    advisors: Array<{
      name: string;
      avatar: string;
      tier: string;
      insight: string;
    }>;
    combinedSummary: string;
    keyThemes?: string[];
    actionPlan?: string[];
    timestamp: string;
  };
}

export const SynthesisPanel: React.FC<SynthesisPanelProps> = ({ synthesis }) => {
  const getTierIcon = (tier: string) => {
    const icons = {
      legendary: Crown,
      elite: Star,
      expert: Gem,
      insider: Flame
    };
    const Icon = icons[tier as keyof typeof icons] || Gem;
    return <Icon className="h-4 w-4" />;
  };

  const copyToClipboard = () => {
    const text = `Board of Directors Insights\n\n${synthesis.combinedSummary}\n\nIndividual Insights:\n${synthesis.advisors.map(a => `${a.name}: ${a.insight}`).join('\n\n')}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="bg-white border border-gray-200 shadow-lg">
        <CardHeader className="border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              Board Synthesis
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard} className="text-gray-600 hover:text-gray-900">
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy</span>
              </Button>
              <Button variant="outline" size="sm" className="text-gray-600 hover:text-gray-900">
                <Share className="h-4 w-4" />
                <span className="sr-only">Share</span>
              </Button>
              <Button variant="outline" size="sm" className="text-gray-600 hover:text-gray-900">
                <Download className="h-4 w-4" />
                <span className="sr-only">Download</span>
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Generated on {new Date(synthesis.timestamp).toLocaleString()}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Combined Summary */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageSquare className="h-4 w-4 text-purple-600" />
              </div>
              Executive Summary
            </h3>
            <p className="text-base leading-relaxed text-gray-800 font-medium">
              {synthesis.combinedSummary}
            </p>
          </div>

          <Separator />

          {/* Individual Insights */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Crown className="h-4 w-4 text-purple-600" />
              </div>
              Individual Insights ({synthesis.advisors.length})
            </h3>
            
            <ScrollArea className="h-96">
              <div className="space-y-4 pr-4">
                {synthesis.advisors.map((advisor, index) => {
                  const tierInfo = TIERS[advisor.tier as keyof typeof TIERS];
                  const TierIcon = getTierIcon(advisor.tier);
                  
                  return (
                    <motion.div
                      key={advisor.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12 border-2 border-gray-200 shadow-sm">
                              <AvatarFallback className="text-xl bg-gradient-to-br from-gray-100 to-gray-200">
                                {advisor.avatar}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-base text-gray-900">{advisor.name}</h4>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs font-medium bg-gradient-to-r ${tierInfo.color} text-white border-0 shadow-sm`}
                                >
                                  {TierIcon}
                                </Badge>
                              </div>
                              
                              <blockquote className="text-sm text-gray-700 leading-relaxed border-l-4 border-purple-400 pl-4 bg-gray-50 rounded-r-lg p-3">
                                "{advisor.insight}"
                              </blockquote>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Key Themes */}
          {synthesis.keyThemes && synthesis.keyThemes.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                </div>
                Key Themes
              </h3>
              <div className="flex flex-wrap gap-3">
                {synthesis.keyThemes.map((theme, index) => (
                  <Badge key={index} className="bg-blue-100 text-blue-800 border border-blue-200 px-3 py-1 text-sm font-medium hover:bg-blue-200 transition-colors">
                    {theme}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Plan */}
          {synthesis.actionPlan && synthesis.actionPlan.length > 0 ? (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Crown className="h-4 w-4 text-green-600" />
                </div>
                Action Plan
              </h3>
              <ul className="space-y-3">
                {synthesis.actionPlan.map((action, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-gray-800">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      {index + 1}
                    </div>
                    <span className="leading-relaxed">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                </div>
                Next Steps
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-gray-800">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    1
                  </div>
                  <span className="leading-relaxed">Review each advisor's perspective for unique angles</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-800">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    2
                  </div>
                  <span className="leading-relaxed">Identify common themes across insights</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-800">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    3
                  </div>
                  <span className="leading-relaxed">Create an action plan based on the synthesis</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-800">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    4
                  </div>
                  <span className="leading-relaxed">Return to the board for follow-up questions</span>
                </li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};