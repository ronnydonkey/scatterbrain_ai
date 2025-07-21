import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Sparkles } from 'lucide-react';
import { CATEGORIES } from '@/data/advisorsDirectory';

interface CustomAdvisorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (advisor: any) => void;
}

const AVATAR_OPTIONS = [
  '👤', '👨‍💼', '👩‍💼', '🧑‍🎓', '👨‍🔬', '👩‍🔬', '👨‍🎨', '👩‍🎨', 
  '🧙‍♂️', '🧙‍♀️', '👨‍⚖️', '👩‍⚖️', '👨‍💻', '👩‍💻', '🦸‍♂️', '🦸‍♀️',
  '🤖', '👑', '🎯', '💡', '🚀', '⭐', '🔥', '💎', '🌟', '✨'
];

export const CustomAdvisorModal: React.FC<CustomAdvisorModalProps> = ({
  open,
  onOpenChange,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    avatar: '👤',
    voice: '',
    category: 'Business'
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.role.trim() || !formData.voice.trim()) {
      return;
    }

    setIsLoading(true);
    
    // Simulate processing
    setTimeout(() => {
      onSave(formData);
      setFormData({
        name: '',
        role: '',
        avatar: '👤',
        voice: '',
        category: 'Business'
      });
      setIsLoading(false);
    }, 500);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Custom Advisor
          </DialogTitle>
          <DialogDescription>
            Add someone who inspires you to your board. This could be a mentor, industry expert, or even a fictional character.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Selection */}
          <div className="space-y-2">
            <Label>Avatar</Label>
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="text-xl">
                  {formData.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm text-muted-foreground">
                Choose an avatar that represents your advisor
              </div>
            </div>
            <div className="grid grid-cols-10 gap-1 max-h-20 overflow-y-auto p-2 border rounded-md">
              {AVATAR_OPTIONS.map(avatar => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => updateFormData('avatar', avatar)}
                  className={`p-1 rounded text-lg hover:bg-gray-100 ${
                    formData.avatar === avatar ? 'bg-primary/10 ring-2 ring-primary' : ''
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Richard Branson, Oprah, Einstein..."
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
              required
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">Role / Title *</Label>
            <Input
              id="role"
              placeholder="e.g., Virgin Founder, Media Mogul, Physicist..."
              value={formData.role}
              onChange={(e) => updateFormData('role', e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={formData.category} onValueChange={(value) => updateFormData('category', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.filter(cat => cat !== 'All').map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Voice/Approach */}
          <div className="space-y-2">
            <Label htmlFor="voice">Voice & Approach *</Label>
            <Textarea
              id="voice"
              placeholder="Describe their thinking style, core beliefs, and approach to problems. What would they prioritize? How do they make decisions?"
              value={formData.voice}
              onChange={(e) => updateFormData('voice', e.target.value)}
              rows={3}
              required
            />
            <div className="text-xs text-muted-foreground">
              This helps the AI understand how this advisor would respond to your questions.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.name.trim() || !formData.role.trim() || !formData.voice.trim() || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Add to Board
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};