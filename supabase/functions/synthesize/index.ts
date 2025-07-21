import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SynthesizeRequest {
  input: string;
  userId?: string;
  timestamp: string;
  sessionId: string;
  preferences?: {
    preferredInput?: string;
    timeContext?: any;
    urgencyLevel?: string;
    socialPlatforms?: string[];
  };
}

interface DetectedTopic {
  topic: string;
  confidence: number;
}

interface SmartSources {
  communities: string[];
  websites: string[];
  contentFocus: string[];
  reasoning: string;
}

interface UserLearningProfile {
  userId: string;
  totalInsights: number;
  topicFrequency: Record<string, number>;
  preferredSources: Record<string, any>;
  engagementData: any[];
  adaptationLevel: number;
  createdAt: string;
  lastUpdated?: string;
}

interface ActionItem {
  id: string;
  task: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  estimatedDuration: string;
  suggestedTime: string;
  completed: boolean;
}

interface ContentSuggestion {
  content: string;
  hashtags?: string[];
  engagement_prediction?: number;
  post_type?: string;
  style?: string;
}

interface KeyTheme {
  theme: string;
  confidence: number;
  evidence: string[];
  relatedConcepts: string[];
}

interface SynthesizeResponse {
  success: boolean;
  id: string;
  processingTime: number;
  insights: {
    keyThemes: KeyTheme[];
    actionItems: ActionItem[];
    contentSuggestions: {
      twitter: ContentSuggestion;
      linkedin: ContentSuggestion;
      instagram: ContentSuggestion;
    };
    researchSuggestions: Array<{
      topic: string;
      sources: string[];
      relevance: number;
    }>;
    calendarBlocks: Array<{
      title: string;
      duration: number;
      priority: string;
      suggestedTimes: string[];
    }>;
  };
  metadata: {
    wordCount: number;
    sentiment: string;
    complexity: string;
    topics: string[];
  };
  // New adaptive intelligence fields
  detectedTopics: DetectedTopic[];
  smartSources: SmartSources;
  userProfile: {
    adaptationLevel: number;
    topInterests: string[];
    totalInsights: number;
  };
}

async function analyzeWithOpenAI(input: string): Promise<any> {
  const prompt = `Analyze this thought/input and extract insights in the following JSON format:

{
  "keyThemes": [
    {
      "theme": "theme name",
      "confidence": 0.0-1.0,
      "evidence": ["keyword1", "keyword2"],
      "relatedConcepts": ["concept1", "concept2"]
    }
  ],
  "actionItems": [
    {
      "task": "specific actionable task",
      "priority": "low|medium|high",
      "category": "planning|creative|research|communication",
      "estimatedDuration": "30 minutes",
      "suggestedTime": "morning|afternoon|evening|specific time"
    }
  ],
  "contentSuggestions": {
    "twitter": {
      "content": "engaging tweet content",
      "hashtags": ["#relevant", "#hashtags"]
    },
    "linkedin": {
      "content": "professional LinkedIn post",
      "post_type": "insight_sharing|question|announcement"
    },
    "instagram": {
      "content": "visual-friendly caption",
      "style": "motivational|behind_scenes|educational"
    }
  },
  "researchSuggestions": [
    {
      "topic": "relevant research topic",
      "sources": ["academic papers", "expert blogs", "industry reports"],
      "relevance": 0.0-1.0
    }
  ],
  "calendarBlocks": [
    {
      "title": "specific calendar event title",
      "duration": 60,
      "priority": "low|medium|high",
      "suggestedTimes": ["tomorrow_9am", "thursday_2pm"]
    }
  ],
  "metadata": {
    "sentiment": "positive|neutral|negative|optimistic|concerned",
    "complexity": "simple|medium|complex",
    "topics": ["topic1", "topic2"]
  }
}

Input to analyze: "${input}"

Return only valid JSON, no explanations.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert at analyzing thoughts and extracting actionable insights. Always respond with valid JSON only.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const rawContent = data.choices[0].message.content;
  
  try {
    return JSON.parse(rawContent);
  } catch (parseError) {
    console.error('Failed to parse AI response:', rawContent);
    throw new Error('Invalid JSON response from AI');
  }
}

function generateInsightId(): string {
  return `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateActionId(index: number): string {
  return `action_${Date.now()}_${index}`;
}

// Topic Detection Function
function detectTopics(input: string): DetectedTopic[] {
  const topicPatterns = {
    business: ['startup', 'revenue', 'customer', 'business', 'marketing', 'sales', 'product', 'growth', 'strategy', 'founder', 'entrepreneur', 'saas', 'metrics'],
    technology: ['code', 'programming', 'software', 'app', 'development', 'ai', 'tech', 'api', 'database', 'frontend', 'backend', 'framework'],
    creative: ['design', 'art', 'creative', 'content', 'video', 'photography', 'writing', 'brand', 'aesthetic', 'portfolio', 'inspiration'],
    health: ['fitness', 'health', 'workout', 'nutrition', 'wellness', 'mental health', 'diet', 'exercise', 'sleep', 'meditation'],
    finance: ['money', 'investment', 'crypto', 'stocks', 'budget', 'savings', 'trading', 'portfolio', 'wealth', 'income'],
    education: ['learning', 'study', 'course', 'skill', 'knowledge', 'tutorial', 'practice', 'certification', 'book', 'research'],
    lifestyle: ['travel', 'food', 'cooking', 'hobby', 'personal', 'family', 'relationships', 'goals', 'productivity', 'habits'],
    gaming: ['game', 'gaming', 'esports', 'streaming', 'twitch', 'console', 'pc gaming', 'mobile games', 'indie games']
  };

  const words = input.toLowerCase().split(/\s+/);
  const scores: Record<string, number> = {};
  
  Object.entries(topicPatterns).forEach(([topic, keywords]) => {
    scores[topic] = keywords.filter(keyword => 
      words.some(word => word.includes(keyword) || keyword.includes(word))
    ).length;
  });

  return Object.entries(scores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([topic, score]) => ({ 
      topic, 
      confidence: score > 0 ? Math.min(score / Math.max(words.length * 0.1, 1), 1) : 0 
    }))
    .filter(t => t.confidence > 0);
}

// Smart Research Sources
function getSmartSources(detectedTopics: DetectedTopic[], userProfile?: UserLearningProfile): SmartSources {
  const sourceMaps: Record<string, Omit<SmartSources, 'reasoning'>> = {
    business: {
      communities: ['r/entrepreneur', 'r/startups', 'r/SaaS', 'IndieHackers'],
      websites: ['ycombinator.com', 'producthunt.com', 'techcrunch.com'],
      contentFocus: ['case studies', 'growth strategies', 'market analysis', 'founder stories']
    },
    technology: {
      communities: ['r/programming', 'r/webdev', 'HackerNews', 'r/MachineLearning'],
      websites: ['stackoverflow.com', 'github.com/trending', 'dev.to'],
      contentFocus: ['tutorials', 'technical guides', 'tool comparisons', 'best practices']
    },
    creative: {
      communities: ['r/design', 'r/creativity', 'Behance', 'Dribbble'],
      websites: ['awwwards.com', 'creativebloq.com', 'designinspiration.com'],
      contentFocus: ['portfolios', 'design trends', 'creative process', 'inspiration']
    },
    health: {
      communities: ['r/fitness', 'r/nutrition', 'r/GetMotivated'],
      websites: ['healthline.com', 'mayoclinic.org', 'nutrition.gov'],
      contentFocus: ['evidence-based advice', 'workout plans', 'nutrition guides']
    },
    finance: {
      communities: ['r/investing', 'r/personalfinance', 'r/SecurityAnalysis'],
      websites: ['investopedia.com', 'morningstar.com', 'sec.gov'],
      contentFocus: ['market analysis', 'investment strategies', 'financial education']
    },
    education: {
      communities: ['r/learnprogramming', 'r/studytips', 'r/GetStudying'],
      websites: ['coursera.org', 'khanacademy.org', 'edx.org'],
      contentFocus: ['learning paths', 'study techniques', 'skill development']
    },
    lifestyle: {
      communities: ['r/productivity', 'r/selfimprovement', 'r/getmotivated'],
      websites: ['zenhabits.net', 'lifehacker.com', 'tinybuddha.com'],
      contentFocus: ['habit formation', 'personal growth', 'life optimization']
    },
    gaming: {
      communities: ['r/gaming', 'r/gamedev', 'r/indiegaming'],
      websites: ['gamasutra.com', 'polygon.com', 'kotaku.com'],
      contentFocus: ['game reviews', 'industry news', 'development insights']
    }
  };

  const primaryTopic = detectedTopics[0]?.topic || 'business';
  const sources = sourceMaps[primaryTopic] || sourceMaps.business;
  
  // If user has preferences, blend with defaults
  if (userProfile?.preferredSources?.[primaryTopic]) {
    const userSources = userProfile.preferredSources[primaryTopic];
    return {
      communities: [...(userSources.communities || []), ...sources.communities].slice(0, 6),
      websites: [...(userSources.websites || []), ...sources.websites].slice(0, 6),
      contentFocus: sources.contentFocus,
      reasoning: `Blending your preferences with ${primaryTopic} recommendations`
    };
  }
  
  return {
    ...sources,
    reasoning: `Smart defaults for ${primaryTopic} topics`
  };
}

// User Profile Management
function getUserProfile(userId: string): UserLearningProfile | null {
  // In a real implementation, this would fetch from a database
  // For now, we'll return a default profile structure
  if (!userId) return null;
  
  return {
    userId,
    totalInsights: 1,
    topicFrequency: {},
    preferredSources: {},
    engagementData: [],
    adaptationLevel: 0.05,
    createdAt: new Date().toISOString()
  };
}

function updateUserProfile(userId: string, interaction: { input: string; detectedTopics: DetectedTopic[]; timestamp: string }): UserLearningProfile {
  const profile = getUserProfile(userId) || {
    userId,
    totalInsights: 0,
    topicFrequency: {},
    preferredSources: {},
    engagementData: [],
    adaptationLevel: 0,
    createdAt: new Date().toISOString()
  };
  
  // Update topic frequency
  interaction.detectedTopics.forEach(({ topic, confidence }) => {
    profile.topicFrequency[topic] = (profile.topicFrequency[topic] || 0) + confidence;
  });
  
  profile.totalInsights += 1;
  profile.adaptationLevel = Math.min(profile.totalInsights / 20, 1); // Fully adapted after 20 insights
  profile.lastUpdated = new Date().toISOString();
  
  // In a real implementation, this would save to database
  
  return profile;
}

function calculateAdaptationLevel(userProfile: UserLearningProfile | null): number {
  return userProfile?.adaptationLevel || 0;
}

function getTopInterests(userProfile: UserLearningProfile | null): string[] {
  if (!userProfile?.topicFrequency) return [];
  
  return Object.entries(userProfile.topicFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([topic]) => topic);
}

function calculateEngagementPrediction(content: string, platform: string): number {
  // Simple heuristic for engagement prediction
  const hasHashtags = content.includes('#');
  const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(content);
  const length = content.length;
  
  let score = 0.5; // base score
  
  if (hasHashtags) score += 0.1;
  if (hasEmojis) score += 0.1;
  
  // Platform-specific adjustments
  switch (platform) {
    case 'twitter':
      score += length < 280 && length > 50 ? 0.2 : 0;
      break;
    case 'linkedin':
      score += length > 100 && length < 1500 ? 0.2 : 0;
      break;
    case 'instagram':
      score += length < 500 && hasEmojis ? 0.2 : 0;
      break;
  }
  
  return Math.min(Math.max(score, 0.1), 1.0);
}

// Rate limiting for unauthenticated requests
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

async function authenticateUser(req: Request): Promise<{ userId: string; email: string } | null> {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Authentication failed:', error?.message);
      return null;
    }

    return { userId: user.id, email: user.email || '' };
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

function checkRateLimit(identifier: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(identifier);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (userLimit.count >= limit) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Authenticate user
    const authResult = await authenticateUser(req);
    if (!authResult) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { userId, email } = authResult;

    // Rate limiting per user
    if (!checkRateLimit(userId, 20, 60000)) { // 20 requests per minute per user
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Rate limit exceeded. Please try again in a minute.',
          code: 'RATE_LIMIT_EXCEEDED'
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const requestData: SynthesizeRequest = await req.json();
    const { input, timestamp, sessionId, preferences } = requestData;

    if (!input || input.trim().length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Input text is required',
          code: 'INVALID_INPUT'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Input validation
    if (input.length > 10000) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Input text too long (max 10,000 characters)',
          code: 'INPUT_TOO_LONG'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Processing thought for user ${userId}: ${input.substring(0, 100)}...`);

    // Step 1: Detect topics from user input
    const detectedTopics = detectTopics(input);
    console.log(`Detected topics:`, detectedTopics);
    
    // Step 2: Get user's learning profile (if exists)
    const userProfile = getUserProfile(userId || '');
    
    // Step 3: Select smart research sources
    const smartSources = getSmartSources(detectedTopics, userProfile);

    // Step 4: Analyze with AI
    const aiInsights = await analyzeWithOpenAI(input);
    
    // Step 5: Update user profile with this interaction
    if (userId) {
      updateUserProfile(userId, { 
        input, 
        detectedTopics, 
        timestamp: new Date().toISOString() 
      });
    }
    
    // Process and enhance the AI response
    const insightId = generateInsightId();
    const processingTime = (Date.now() - startTime) / 1000;
    const wordCount = input.split(/\s+/).length;

    // Add IDs to action items and enhance them
    const enhancedActionItems: ActionItem[] = aiInsights.actionItems.map((item: any, index: number) => ({
      id: generateActionId(index),
      task: item.task,
      priority: item.priority || 'medium',
      category: item.category || 'planning',
      estimatedDuration: item.estimatedDuration || '30 minutes',
      suggestedTime: item.suggestedTime || 'morning',
      completed: false,
    }));

    // Enhance content suggestions with engagement predictions
    const enhancedContentSuggestions = {
      twitter: {
        ...aiInsights.contentSuggestions.twitter,
        engagement_prediction: calculateEngagementPrediction(
          aiInsights.contentSuggestions.twitter.content, 
          'twitter'
        ),
      },
      linkedin: {
        ...aiInsights.contentSuggestions.linkedin,
        engagement_prediction: calculateEngagementPrediction(
          aiInsights.contentSuggestions.linkedin.content, 
          'linkedin'
        ),
      },
      instagram: {
        ...aiInsights.contentSuggestions.instagram,
        engagement_prediction: calculateEngagementPrediction(
          aiInsights.contentSuggestions.instagram.content, 
          'instagram'
        ),
      },
    };

    const response: SynthesizeResponse = {
      success: true,
      id: insightId,
      processingTime: processingTime,
      insights: {
        keyThemes: aiInsights.keyThemes || [],
        actionItems: enhancedActionItems,
        contentSuggestions: enhancedContentSuggestions,
        researchSuggestions: aiInsights.researchSuggestions || [],
        calendarBlocks: aiInsights.calendarBlocks || [],
      },
      metadata: {
        wordCount: wordCount,
        sentiment: aiInsights.metadata?.sentiment || 'neutral',
        complexity: aiInsights.metadata?.complexity || 'medium',
        topics: aiInsights.metadata?.topics || [],
      },
      // New adaptive intelligence data
      detectedTopics: detectedTopics,
      smartSources: smartSources,
      userProfile: {
        adaptationLevel: calculateAdaptationLevel(userProfile),
        topInterests: getTopInterests(userProfile),
        totalInsights: userProfile?.totalInsights || 1
      }
    };

    console.log(`Successfully processed insight ${insightId} in ${processingTime}s`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in synthesize function:', error);
    
    const processingTime = (Date.now() - startTime) / 1000;
    
    // Provide specific error codes for different error types
    let statusCode = 500;
    let errorCode = 'INTERNAL_ERROR';
    let errorMessage = 'An internal error occurred';
    
    if (error.message?.includes('OpenAI API error')) {
      statusCode = 502;
      errorCode = 'AI_SERVICE_ERROR';
      errorMessage = 'AI service temporarily unavailable';
    } else if (error.message?.includes('Invalid JSON')) {
      statusCode = 502;
      errorCode = 'AI_RESPONSE_ERROR';
      errorMessage = 'AI service returned invalid response';
    } else if (error.message?.includes('timeout')) {
      statusCode = 504;
      errorCode = 'TIMEOUT_ERROR';
      errorMessage = 'Request timed out, please try again';
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        code: errorCode,
        processingTime: processingTime,
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});