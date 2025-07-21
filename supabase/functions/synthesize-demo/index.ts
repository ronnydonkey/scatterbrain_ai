import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting for demo requests (per IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkDemoRateLimit(identifier: string, limit: number = 3, windowMs: number = 300000): boolean {
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

async function analyzeWithOpenAI(input: string): Promise<any> {
  const prompt = `Analyze this thought/input and extract insights in the following JSON format.
Make the insights COMPELLING and ACTIONABLE to showcase the power of AI analysis.

{
  "keyThemes": [
    {
      "theme": "clear, powerful theme name",
      "confidence": 0.85-0.95,
      "evidence": ["specific keywords from input"],
      "relatedConcepts": ["relevant concepts"]
    }
  ],
  "actionItems": [
    {
      "task": "specific, actionable task that feels immediately valuable",
      "priority": "high|medium",
      "category": "planning|creative|research|communication",
      "estimatedDuration": "15-60 minutes",
      "suggestedTime": "morning|afternoon|evening"
    }
  ],
  "contentSuggestions": {
    "twitter": {
      "content": "engaging, viral-worthy tweet content",
      "hashtags": ["#relevant", "#hashtags"]
    },
    "linkedin": {
      "content": "professional LinkedIn post that gets engagement",
      "post_type": "insight_sharing"
    },
    "instagram": {
      "content": "visual-friendly caption that drives action",
      "style": "motivational"
    }
  },
  "researchSuggestions": [
    {
      "topic": "specific research topic that sounds valuable",
      "sources": ["credible sources"],
      "relevance": 0.8-0.95
    }
  ],
  "calendarBlocks": [
    {
      "title": "compelling calendar event title",
      "duration": 30-120,
      "priority": "high|medium",
      "suggestedTimes": ["specific time suggestions"]
    }
  ],
  "metadata": {
    "sentiment": "optimistic|determined|focused|ambitious",
    "complexity": "medium|complex",
    "topics": ["main topics identified"]
  }
}

Input to analyze: "${input}"

CRITICAL: Make this analysis so good that the person feels compelled to see more. Focus on insights that feel like mind-reading and actions that feel immediately valuable.

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
          content: 'You are an expert at analyzing thoughts and creating compelling, actionable insights that showcase the power of AI analysis. Always respond with valid JSON only.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8, // Higher creativity for demo
      max_tokens: 2500,
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    // Rate limiting - 3 demo requests per 5 minutes per IP
    if (!checkDemoRateLimit(clientIP, 3, 300000)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Demo rate limit exceeded. Please try again in 5 minutes.',
          code: 'DEMO_RATE_LIMIT'
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const requestData = await req.json();
    const { input } = requestData;

    if (!input || input.trim().length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Please enter some text to analyze',
          code: 'INVALID_INPUT'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Input validation for demo
    if (input.length > 2000) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Demo text too long (max 2,000 characters)',
          code: 'INPUT_TOO_LONG'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Processing demo thought: ${input.substring(0, 100)}...`);

    // Analyze with AI
    const aiInsights = await analyzeWithOpenAI(input);
    
    // Generate unique insight ID for demo
    const insightId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const processingTime = (Date.now() - startTime) / 1000;
    const wordCount = input.split(/\s+/).length;

    // Enhance action items with IDs
    const enhancedActionItems = aiInsights.actionItems.map((item: any, index: number) => ({
      id: `demo_action_${Date.now()}_${index}`,
      task: item.task,
      priority: item.priority || 'medium',
      category: item.category || 'planning',
      estimatedDuration: item.estimatedDuration || '30 minutes',
      suggestedTime: item.suggestedTime || 'morning',
      completed: false,
    }));

    const response = {
      success: true,
      id: insightId,
      processingTime: processingTime,
      insights: {
        keyThemes: aiInsights.keyThemes || [],
        actionItems: enhancedActionItems,
        contentSuggestions: aiInsights.contentSuggestions || {},
        researchSuggestions: aiInsights.researchSuggestions || [],
        calendarBlocks: aiInsights.calendarBlocks || [],
      },
      metadata: {
        wordCount: wordCount,
        sentiment: aiInsights.metadata?.sentiment || 'optimistic',
        complexity: aiInsights.metadata?.complexity || 'medium',
        topics: aiInsights.metadata?.topics || [],
      },
      isDemo: true
    };

    console.log(`Successfully processed demo insight ${insightId} in ${processingTime}s`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in synthesize-demo function:', error);
    
    const processingTime = (Date.now() - startTime) / 1000;
    
    // Provide specific error codes for different error types
    let statusCode = 500;
    let errorCode = 'DEMO_ERROR';
    let errorMessage = 'Demo temporarily unavailable';
    
    if (error.message?.includes('OpenAI API error')) {
      statusCode = 502;
      errorCode = 'AI_SERVICE_ERROR';
      errorMessage = 'AI analysis temporarily unavailable';
    } else if (error.message?.includes('Invalid JSON')) {
      statusCode = 502;
      errorCode = 'AI_RESPONSE_ERROR';
      errorMessage = 'AI service returned unexpected response';
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