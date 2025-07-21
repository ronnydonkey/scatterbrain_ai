import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Check, Crown, Star, Gem, Flame } from 'lucide-react';
import { TIERS } from '@/data/advisorsDirectory';
import { motion } from 'framer-motion';

interface AdvisorCardProps {
  advisor: {
    id: string;
    name: string;
    role: string;
    avatar: string;
    voice: string;
    category: string;
    tier: string;
  };
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

export const AdvisorCard: React.FC<AdvisorCardProps> = ({
  advisor,
  isSelected,
  onSelect,
  onRemove
}) => {
  const tierInfo = TIERS[advisor.tier as keyof typeof TIERS];
  
  const getTierIcon = () => {
    const icons = {
      legendary: Crown,
      elite: Star,
      expert: Gem,
      insider: Flame
    };
    const Icon = icons[advisor.tier as keyof typeof icons] || Gem;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="h-full"
    >
      <Card className={`h-full cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'ring-2 ring-primary border-primary bg-primary/5' 
          : 'hover:shadow-lg hover:border-primary/20'
      }`}>
        <CardContent className="p-4 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-xl bg-gradient-to-br from-gray-100 to-gray-200">
                    {advisor.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <h3 className="font-semibold text-sm leading-tight">{advisor.name}</h3>
                  <p className="text-xs text-muted-foreground">{advisor.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tier and Category */}
          <div className="flex flex-wrap gap-1 mb-3">
            <Badge 
              variant="outline" 
              className={`text-xs bg-gradient-to-r ${tierInfo.color} text-white border-0`}
            >
              {getTierIcon()}
              <span className="ml-1">{tierInfo.label}</span>
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {advisor.category}
            </Badge>
          </div>

          {/* Voice/Expertise */}
          <div className="flex-1 mb-4">
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {advisor.voice}
            </p>
          </div>

          {/* Action Button */}
          <Button
            variant={isSelected ? "secondary" : "default"}
            size="sm"
            onClick={isSelected ? onRemove : onSelect}
            className="w-full"
          >
            {isSelected ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                On Board
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
};