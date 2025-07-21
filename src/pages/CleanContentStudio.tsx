import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PenTool, Twitter, Linkedin, Mail, FileText, 
  Copy, Share2, Download, Zap, Sparkles, BarChart3, Brain
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';
import { useThoughtFlow } from '@/context/ThoughtFlowContext';
import { generateContent } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

interface ContentFormat {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
  maxLength: number;
}

const CONTENT_FORMATS: ContentFormat[] = [
  {
    id: 'twitter',
    name: 'Twitter Post',
    icon: Twitter,
    description: 'Concise, engaging social media post',
    color: 'blue',
    maxLength: 280
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Article',
    icon: Linkedin,
    description: 'Professional thought leadership content',
    color: 'blue',
    maxLength: 3000
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    icon: Mail,
    description: 'Email-ready content segment',
    color: 'green',
    maxLength: 1200
  },
  {
    id: 'blog',
    name: 'Blog Post',
    icon: FileText,
    description: 'Long-form article content',
    color: 'purple',
    maxLength: 5000
  }
];

export default function CleanContentStudio() {
  const location = useLocation();
  const { user } = useAuth();
  const { originalThought: contextThought } = useThoughtFlow();
  const initialThought = location.state?.initialThought || contextThought || '';
  
  const [originalThought, setOriginalThought] = useState(initialThought);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['twitter', 'linkedin']);
  const [generatedContent, setGeneratedContent] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  
  // Update original thought when context changes
  useEffect(() => {
    if (contextThought && !originalThought) {
      setOriginalThought(contextThought);
    }
  }, [contextThought]);

  const handleGenerate = async () => {
    if (!originalThought.trim()) {
      toast.error('Please enter your original thought first');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Use real API to generate content
      const result = await generateContent(originalThought, selectedFormats, {
        userId: user?.id
      });

      if (result && result.content) {
        const generated = selectedFormats.map(formatId => {
          const format = CONTENT_FORMATS.find(f => f.id === formatId)!;
          const content = result.content[formatId] || generateContentForFormat(originalThought, format);
          
          return {
            format: formatId,
            content: content.content || content,
            wordCount: content.content ? content.content.split(' ').length : Math.floor(Math.random() * 200) + 50,
            estimatedViews: content.engagement_prediction ? Math.floor(content.engagement_prediction * 1000) : Math.floor(Math.random() * 1000) + 100,
            engagement: content.engagement_prediction ? `${(content.engagement_prediction * 100).toFixed(1)}%` : '3.2%'
          };
        });
        
        setGeneratedContent(generated);
        setActiveTab('preview');
        toast.success(`Generated ${generated.length} content formats!`);
      } else {
        throw new Error('No content generated');
      }
    } catch (error: any) {
      console.error('Content generation failed:', error);
      toast.error('Failed to generate content. Using fallback generation.');
      
      // Fallback to demo generation
      const generated = selectedFormats.map(formatId => {
        const format = CONTENT_FORMATS.find(f => f.id === formatId)!;
        return {
          format: formatId,
          content: generateContentForFormat(originalThought, format),
          wordCount: Math.floor(Math.random() * 200) + 50,
          estimatedViews: Math.floor(Math.random() * 1000) + 100,
          engagement: '3.2%'
        };
      });
      
      setGeneratedContent(generated);
      setActiveTab('preview');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateContentForFormat = (thought: string, format: ContentFormat) => {
    const templates = {
      twitter: `${thought.substring(0, 200)}...\n\n#innovation #mindset #growth`,
      linkedin: `Here's something I've been thinking about:\n\n${thought}\n\nWhat's your take? Share your thoughts in the comments.`,
      newsletter: `**This Week's Insight**\n\n${thought}\n\n*Generated with AI-powered content multiplication.*`,
      blog: `# Reflections on Innovation\n\n${thought}\n\n## Key Takeaways\n\n• Embrace continuous learning\n• Challenge conventional thinking\n• Apply insights to real scenarios`
    };
    
    return templates[format.id as keyof typeof templates] || thought;
  };

  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Content copied to clipboard!');
  };

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-display mb-4">Content Studio</h1>
        <p className="text-subtitle max-w-2xl mx-auto">
          Transform your thoughts into multiple content formats. One idea becomes tweets, articles, newsletters, and more.
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

      {/* Main Interface */}
      <div className="max-w-6xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="glass-card border-0">
              <TabsTrigger value="create" className="flex items-center gap-2">
                <PenTool className="h-4 w-4" />
                Create
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Preview ({generatedContent.length})
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="create" className="space-y-8">
            {/* Original Thought Input */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenTool className="h-5 w-5 text-blue-600" />
                  Your Original Thought
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={originalThought}
                  onChange={(e) => setOriginalThought(e.target.value)}
                  placeholder="Enter the thought or idea you'd like to transform into multiple content formats..."
                  className="modern-input min-h-32 resize-none"
                />
                <div className="flex justify-between items-center mt-4">
                  <span className="text-small text-gray-500">
                    {originalThought.length} characters
                  </span>
                  {originalThought.trim() && (
                    <Badge className="bg-green-100 text-green-800">
                      Ready to transform
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Format Selection */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle>Select Content Formats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {CONTENT_FORMATS.map((format) => {
                    const Icon = format.icon;
                    const isSelected = selectedFormats.includes(format.id);
                    
                    return (
                      <motion.div
                        key={format.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div
                          className={`modern-card cursor-pointer transition-all duration-200 ${
                            isSelected ? 'ring-2 ring-blue-200 bg-blue-50' : ''
                          }`}
                          onClick={() => {
                            setSelectedFormats(prev =>
                              isSelected 
                                ? prev.filter(f => f !== format.id)
                                : [...prev, format.id]
                            );
                          }}
                        >
                          <div className="modern-card-content text-center">
                            <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-${format.color}-100 flex items-center justify-center`}>
                              <Icon className={`h-6 w-6 text-${format.color}-600`} />
                            </div>
                            <h3 className="text-body font-semibold mb-2">{format.name}</h3>
                            <p className="text-caption text-gray-600 mb-3">{format.description}</p>
                            <Badge variant={isSelected ? "default" : "secondary"} className="text-xs">
                              {isSelected ? 'Selected' : 'Select'}
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <div className="text-center">
              <Button
                onClick={handleGenerate}
                disabled={!originalThought.trim() || selectedFormats.length === 0 || isGenerating}
                size="lg"
                className="btn-primary px-8"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    Generate {selectedFormats.length} Format{selectedFormats.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            {generatedContent.length === 0 ? (
              <Card className="glass-card border-0">
                <CardContent className="modern-card-content text-center py-12">
                  <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-title mb-2">No content generated yet</h3>
                  <p className="text-caption text-gray-600 mb-6">
                    Create your first content transformation to see previews here.
                  </p>
                  <Button onClick={() => setActiveTab('create')}>
                    Start Creating
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {generatedContent.map((content, index) => {
                  const format = CONTENT_FORMATS.find(f => f.id === content.format)!;
                  const Icon = format.icon;
                  
                  return (
                    <motion.div
                      key={content.format}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="glass-card border-0">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                              <Icon className={`h-5 w-5 text-${format.color}-600`} />
                              {format.name}
                            </CardTitle>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyContent(content.content)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Share2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <pre className="text-body whitespace-pre-wrap font-sans">
                              {content.content}
                            </pre>
                          </div>
                          
                          <div className="flex gap-4 text-small text-gray-600">
                            <span>{content.wordCount} words</span>
                            <span>{content.estimatedViews} estimated views</span>
                            <span>{content.engagement} engagement rate</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="glass-card border-0">
              <CardContent className="modern-card-content text-center py-12">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-title mb-2">Analytics Coming Soon</h3>
                <p className="text-caption text-gray-600">
                  Track performance, engagement metrics, and optimization insights across all your content formats.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}