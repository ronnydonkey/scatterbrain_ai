import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, Sparkles, ChevronRight, Star, ArrowRight, 
  MessageSquare, Lightbulb, Users, TrendingUp, Lock,
  CheckCircle, Zap, MousePointer, PenTool
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { NeuralAnimation } from '@/components/effects/NeuralAnimation';
import { toast } from 'sonner';

interface Testimonial {
  id: string;
  name: string;
  text: string;
  title: string;
  stars: number;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    text: 'Finally, my ADHD brain feels organized. This is the tool I never knew I needed.',
    title: 'Product Designer',
    stars: 5
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    text: 'Like having a thought translator in my pocket. Game-changer for my creative process.',
    title: 'Content Creator',
    stars: 5
  },
  {
    id: '3',
    name: 'Emma Thompson',
    text: 'Turns my voice memos into actual insights. Magic for busy entrepreneurs.',
    title: 'Startup Founder',
    stars: 5
  }
];

export default function ViralLanding() {
  const navigate = useNavigate();
  const [userThought, setUserThought] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [demoUsed, setDemoUsed] = useState(false);

  const handleTryDemo = async () => {
    if (!userThought.trim()) {
      toast.error('Please share a thought first!');
      return;
    }

    setIsProcessing(true);
    setDemoUsed(true);

    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowResults(true);
    }, 3000);
  };

  const handleGetStarted = () => {
    // Navigate to auth with demo state
    navigate('/auth/signin', { 
      state: { 
        from: '/landing',
        demoThought: userThought,
        hasTriedDemo: demoUsed
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      <NeuralAnimation />
      
      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <span className="text-3xl font-bold text-gray-900">Scatterbrain</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-6 leading-tight drop-shadow-sm">
            What's on your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">mind</span>?
          </h1>

          {/* Subheading */}
          <p className="text-xl text-gray-800 mb-12 max-w-2xl mx-auto drop-shadow-sm">
            Capture your thoughts and watch them transform into insights, content, and connections with the greatest minds in history.
          </p>

          {/* Demo Input */}
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur">
              <CardContent className="p-8">
                <Textarea
                  placeholder="Share what you're thinking about..."
                  value={userThought}
                  onChange={(e) => setUserThought(e.target.value)}
                  className="min-h-[150px] text-lg border-gray-200 focus:border-purple-400"
                  disabled={isProcessing}
                />
                
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    No signup required for your first synthesis
                  </p>
                  <Button
                    onClick={handleTryDemo}
                    disabled={isProcessing || !userThought.trim()}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8"
                  >
                    {isProcessing ? (
                      <>
                        <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                        Synthesizing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        Synthesize
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </section>

      {/* 4-Step Process */}
      <section className="relative z-10 container mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-black mb-2 drop-shadow-sm">Your Journey from Thought to Impact</h2>
            <p className="text-lg text-gray-800 drop-shadow-sm">
              Capture → Synthesize → Create → Share/Act
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Capture',
                description: 'Turn scattered thoughts into structured insights',
                icon: Brain,
                color: 'blue',
                step: '1'
              },
              {
                title: 'Synthesize', 
                description: 'AI finds patterns and connections',
                icon: Sparkles,
                color: 'purple',
                step: '2'
              },
              {
                title: 'Create',
                description: 'Transform insights into content that matters',
                icon: PenTool,
                color: 'green',
                step: '3'
              },
              {
                title: 'Share/Act',
                description: 'Put your ideas to work',
                icon: ArrowRight,
                color: 'orange',
                step: '4'
              }
            ].map((action, index) => {
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
                  <Card className="shadow-lg border-0 bg-white/90 backdrop-blur cursor-pointer transition-all duration-200 hover:shadow-xl h-full">
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
                        Step {action.step}
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Processing Animation */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-pulse" />
                <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                  <Brain className="h-12 w-12 text-purple-600 animate-pulse" />
                </div>
              </div>
              <p className="text-white text-xl font-medium">Processing your thoughts...</p>
              <p className="text-white/70 mt-2">Finding patterns and connections</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Demo Results */}
      <AnimatePresence>
        {showResults && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 container mx-auto px-6 pb-16"
          >
            <div className="max-w-4xl mx-auto">
              <Card className="shadow-2xl border-0 bg-white overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                  <h2 className="text-2xl font-bold mb-2">Your Synthesis Results</h2>
                  <p className="opacity-90">Here's what we discovered in your thoughts...</p>
                </div>
                
                <CardContent className="p-8">
                  {/* Insights Preview */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      Key Insights
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <p className="text-gray-700">Your main theme revolves around innovation and creative problem-solving...</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <p className="text-gray-700">There's a strong connection between your ideas about technology and human behavior...</p>
                      </div>
                      <div className="relative">
                        <div className="flex items-start gap-3 blur-sm">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                          <p className="text-gray-700">The underlying pattern suggests a focus on user-centered design principles...</p>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
                      </div>
                    </div>
                  </div>

                  {/* Action Items Teaser */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-purple-500" />
                      Action Items
                    </h3>
                    <div className="bg-purple-50 rounded-lg p-4 relative overflow-hidden">
                      <div className="blur-sm">
                        <p className="text-purple-900 font-medium">3 actionable next steps identified...</p>
                        <ul className="mt-2 space-y-1 text-purple-700">
                          <li>• Research existing solutions in this space</li>
                          <li>• Create a simple prototype to test core concept</li>
                          <li>• Connect with potential users for feedback</li>
                        </ul>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-50 via-purple-50/80 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lock className="h-8 w-8 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="text-center pt-6 border-t border-gray-200">
                    <h3 className="text-2xl font-bold mb-3">Unlock Your Complete Neural Map</h3>
                    <p className="text-gray-600 mb-6">Sign up to see all insights, save your synthesis, and create unlimited neural maps</p>
                    <Button
                      onClick={handleGetStarted}
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12"
                    >
                      Get Started Free
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                    <p className="text-sm text-gray-500 mt-3">Your first 3 syntheses are free • No credit card required</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Social Proof Section */}
      <section className="relative z-10 container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { icon: Users, value: '2,000+', label: 'Active Thinkers' },
              { icon: Brain, value: '10,000+', label: 'Insights Created' },
              { icon: TrendingUp, value: '92%', label: 'Clarity Improvement' },
              { icon: Star, value: '4.9', label: 'User Rating' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="text-center p-6 border-0 shadow-lg bg-white/90 backdrop-blur">
                  <stat.icon className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Loved by Scattered Thinkers</h2>
            <p className="text-lg text-gray-600">Join thousands finding clarity in the chaos</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="h-full border-0 shadow-lg bg-white">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {Array.from({ length: testimonial.stars }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                    <div className="mt-auto">
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.title}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      {!showResults && (
        <section className="relative z-10 container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="border-0 shadow-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white overflow-hidden">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold mb-4">Ready to organize your mind?</h2>
                <p className="text-xl mb-8 opacity-90">
                  Start your journey from scattered thoughts to clear insights
                </p>
                <Button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100 px-12"
                >
                  <MousePointer className="h-5 w-5 mr-2" />
                  Try the Demo Above
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}