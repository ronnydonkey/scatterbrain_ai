import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { MiniGalleryPreview } from './MiniGalleryPreview';
import { useNavigate } from 'react-router-dom';

import { Sparkles, Brain, Zap } from 'lucide-react';

interface LandingHeroProps {
  demoText: string;
  setDemoText: (text: string) => void;
  handleDemo: () => void;
  isProcessing: boolean;
}

const sampleInputs = [
  {
    label: "Try with Meeting Notes",
    content: `Team sync - Product roadmap Q1 2024

Discussed:
- New user onboarding flow needs work, Sarah mentioned 40% drop-off at step 3
- Mobile app performance issues on Android devices, especially Galaxy S series
- Customer feedback: users want dark mode and better search functionality
- Marketing wants to push the new AI features but dev says we need 2 more weeks
- Budget approval for new analytics tool pending, CFO wants to see ROI projections

Action items:
- Fix onboarding flow by end of month
- Performance audit scheduled for next week
- Dark mode in sprint 3
- AI feature demo for marketing on Friday
- Analytics tool proposal due Thursday

Random thoughts: The coffee machine is broken again. Also, should we consider that new design system everyone's talking about?`
  },
  {
    label: "Try with Random Thoughts",
    content: `Need to remember to call mom tonight about thanksgiving plans

Just read this fascinating article about how octopuses have 3 hearts - imagine if humans had that kind of redundancy in our circulatory system. Makes me think about backup systems in general.

Project deadline is Friday but honestly feels impossible with current scope. Maybe I should talk to James about pushing back the secondary features.

Coffee shop idea keeps popping up in my head - what if there was a place that combined bookstore + coffee + coworking space? Location near campus would be perfect. Initial investment probably around 150k?

Weird dream last night about flying through a library made of clouds. Dreams are so random but this one felt meaningful somehow.

Doctor appointment moved to Tuesday 3pm
Grocery list: milk, bread, those good crackers Sarah likes
Why do I always get my best ideas in the shower???

That book recommendation from last week - "Atomic Habits" - should definitely read it. Everyone says it's life-changing.`
  },
  {
    label: "Try with Research Notes",
    content: `Climate Change Adaptation Strategies - Literature Review Notes

Smith et al. (2023): "Urban heat islands show 3-7°C temperature increases compared to rural areas. Green infrastructure reduces ambient temps by 2-8°C."

Key findings from Copenhagen study:
- Blue-green infrastructure reduced flood risk by 43%
- Property values increased 15% within 500m of green corridors
- Air quality improvements measurable up to 2km from intervention sites

Nature-based solutions effectiveness:
• Wetland restoration: 60-90% pollutant removal
• Urban forests: 10-20% air temp reduction
• Permeable pavements: 30-50% stormwater runoff reduction

Policy implications:
- Current building codes inadequate for projected climate scenarios
- Need integrated approach combining grey and green infrastructure
- Economic co-benefits often exceed implementation costs within 5-7 years

Questions to explore:
How do cultural factors influence adoption rates?
What role does community engagement play in long-term maintenance?
Can these solutions scale to megacities in developing countries?

Citation needed: Rotterdam's water management system as best practice example.`
  },
  {
    label: "Try with Voice Memo",
    content: `Hey Siri, voice memo. Um, so I just had this conversation with my neighbor about their startup and it got me thinking about a bunch of stuff.

First off, they're doing this whole subscription model for... I think it was like meal planning or something? But they're struggling with retention rates. Made me realize that maybe the problem isn't the product, it's that they're trying to solve a problem people don't actually have consistently.

Like, I meal plan for maybe two weeks and then I just... don't. It's not a habit that sticks for most people, you know?

Anyway, it reminded me of that book I read about Jobs to be Done theory. People don't want meal plans, they want to feel organized and in control of their week. Or maybe they want to eat healthier without thinking about it. The meal plan is just one possible solution.

Oh, and speaking of solutions - I should probably figure out my own dinner situation tonight. Thai food sounds good. There's that place on Fifth Street that has those amazing pad thai noodles.

Wait, where was I? Right, the startup thing. I wonder if they've actually talked to customers who canceled to understand why. Most companies just assume it's price but it's usually something totally different.

Note to self: text Sarah about the networking event next Thursday. And pick up dry cleaning tomorrow.`
  }
];

export function LandingHero({ demoText, setDemoText, handleDemo, isProcessing }: LandingHeroProps) {
  const navigate = useNavigate();
  
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Neural Background Animation */}
      <div className="absolute inset-0 opacity-20">
        <div className="neural-network-bg h-full w-full" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headlines */}
          <div className="space-y-6 mb-12">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight">
              Transform scattered thoughts into clear, actionable insights
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Stop drowning in random ideas. Our AI finds the method in your madness and turns chaos into clarity.
            </p>
          </div>

          {/* Demo Input */}
          <Card className="max-w-2xl mx-auto shadow-xl border-primary/20 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-center space-x-2 text-primary mb-4">
                  <Brain className="w-5 h-5" />
                  <span className="font-medium">Try it now</span>
                  <Sparkles className="w-5 h-5" />
                </div>
                
                {/* Example Input Buttons */}
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  {sampleInputs.map((sample) => (
                    <Button
                      key={sample.label}
                      variant="outline"
                      size="sm"
                      onClick={() => setDemoText(sample.content)}
                      disabled={isProcessing}
                      className="text-xs border-primary/20 text-primary hover:bg-primary/10 hover:border-primary/40 transition-all duration-200"
                    >
                      {sample.label}
                    </Button>
                  ))}
                </div>

                <Textarea
                  placeholder="Drop your scattered thoughts here... voice memos, meeting notes, random ideas..."
                  value={demoText}
                  onChange={(e) => setDemoText(e.target.value)}
                  className="min-h-32 resize-none border-primary/20 focus:border-primary/40 text-base transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  disabled={isProcessing}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !isProcessing && demoText.trim()) {
                      e.preventDefault();
                      handleDemo();
                    }
                  }}
                />
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={handleDemo}
                    data-synthesis-submit
                    disabled={!demoText.trim() || isProcessing}
                    className="flex-1 py-6 text-lg font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300"
                  >
                    {isProcessing ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Finding the method...</span>
                        <Zap className="w-5 h-5 animate-pulse" />
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Brain className="w-5 h-5" />
                        <span>Unlock My Insights</span>
                        <Sparkles className="w-5 h-5" />
                      </div>
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/gallery')}
                    className="sm:w-auto py-6 text-lg font-medium border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50"
                  >
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5" />
                      <span>Try Demo</span>
                    </div>
                  </Button>
                </div>
                
                {/* Keyboard shortcut hint */}
                <div className="text-center mt-4">
                  <p className="text-xs text-muted-foreground">
                    Press <kbd className="px-1.5 py-0.5 bg-muted/50 rounded text-xs">⌘ Enter</kbd> to synthesize
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Value Props */}
          <div className="grid md:grid-cols-4 gap-6 mt-16 max-w-6xl mx-auto">
            {[
              { icon: Brain, title: "Neural Processing", desc: "AI finds patterns in your chaos" },
              { icon: Zap, title: "Instant Clarity", desc: "Seconds to structured insights" },
              { icon: Sparkles, title: "Actionable Results", desc: "Clear next steps, not more confusion" }
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="bg-gradient-to-br from-card/50 to-card/30 border-primary/10 hover:border-primary/20 transition-colors">
                <CardContent className="p-6 text-center">
                  <Icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
            
            {/* Mini Gallery Preview */}
            <div className="md:col-span-1">
              <Card className="bg-gradient-to-br from-card/50 to-card/30 border-primary/10 hover:border-primary/20 transition-colors h-full">
                <CardContent className="p-6">
                  <MiniGalleryPreview />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional CTA for Demo */}
          <div className="mt-12">
            <p className="text-muted-foreground mb-4">See the magic in action</p>
            <Button
              variant="outline"
              onClick={() => navigate('/gallery')}
              className="border-primary/30 text-primary hover:bg-primary/10"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Explore Examples
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}