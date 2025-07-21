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

interface Advisor {
  id: string;
  name: string;
  role: string;
  avatar: string;
  voice: string;
  category: string;
  tier: string;
  isCustom?: boolean;
}

interface BoardSynthesisRequest {
  advisors: Advisor[];
  input: string;
  userId?: string;
}

interface AdvisorInsight {
  name: string;
  avatar: string;
  tier: string;
  insight: string;
  reasoning?: string;
}

interface BoardSynthesisResponse {
  success: boolean;
  advisors: AdvisorInsight[];
  combinedSummary: string;
  keyThemes: string[];
  actionPlan: string[];
  timestamp: string;
  processingTime: number;
}

async function generateAdvisorInsight(advisor: Advisor, input: string): Promise<string> {
  const prompt = `You are ${advisor.name}, ${advisor.role}.

Your core beliefs, thinking style, and approach: ${advisor.voice}

A user is asking for advice on: "${input}"

Respond as ${advisor.name} would, incorporating your specific perspective, expertise, and unique viewpoint. Provide actionable advice that reflects your philosophy and approach. Keep your response to 2-3 sentences that capture your unique wisdom and specific recommendations.

Response as ${advisor.name}:`;

  const aiProvider = openAIApiKey ? 'openai' : 'anthropic';
  
  if (aiProvider === 'openai') {
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
            content: `You are an expert at embodying the mindset and voice of ${advisor.name}. Respond exactly as they would, with their specific terminology, priorities, and perspective.` 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } else if (anthropicApiKey) {
    // Anthropic implementation
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anthropicApiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 200,
        temperature: 0.8,
        messages: [
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text.trim();
  } else {
    throw new Error('No AI API key configured');
  }
}

async function generateCombinedSummary(input: string, advisorInsights: AdvisorInsight[]): Promise<{ summary: string; themes: string[]; actionPlan: string[] }> {
  const insightText = advisorInsights.map(a => `${a.name}: ${a.insight}`).join('\n\n');
  
  const prompt = `Based on these advisor perspectives on "${input}":

${insightText}

Provide a JSON response with:
1. A cohesive 2-3 sentence summary that synthesizes the key recommendations
2. 3-5 key themes that emerge across the advice
3. 5-7 specific action items for implementation

Format as JSON:
{
  "summary": "Cohesive synthesis of the advice...",
  "themes": ["Theme 1", "Theme 2", "Theme 3"],
  "actionPlan": ["Action 1", "Action 2", "Action 3", "Action 4", "Action 5"]
}`;

  const aiProvider = openAIApiKey ? 'openai' : 'anthropic';
  
  if (aiProvider === 'openai') {
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
            content: 'You are an expert at synthesizing multiple perspectives into coherent action-oriented advice. Always respond with valid JSON only.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 400,
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
      console.error('Failed to parse synthesis response:', rawContent);
      throw new Error('Invalid JSON response from AI');
    }
  } else if (anthropicApiKey) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anthropicApiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 400,
        temperature: 0.7,
        messages: [
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.content[0].text;
    
    try {
      return JSON.parse(rawContent);
    } catch (parseError) {
      console.error('Failed to parse synthesis response:', rawContent);
      throw new Error('Invalid JSON response from AI');
    }
  } else {
    throw new Error('No AI API key configured');
  }
}

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    if (!openAIApiKey && !anthropicApiKey) {
      throw new Error('No AI API key configured');
    }

    // Authenticate user (optional for board synthesis)
    const authResult = await authenticateUser(req);
    const userId = authResult?.userId;

    const requestData: BoardSynthesisRequest = await req.json();
    const { advisors, input } = requestData;

    // Validation
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

    if (!advisors || advisors.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'At least one advisor is required',
          code: 'NO_ADVISORS'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (advisors.length > 8) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Maximum 8 advisors allowed',
          code: 'TOO_MANY_ADVISORS'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (input.length > 5000) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Input text too long (max 5,000 characters)',
          code: 'INPUT_TOO_LONG'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Generating board synthesis for ${advisors.length} advisors: ${input.substring(0, 100)}...`);

    // Generate insights from each advisor in parallel
    const advisorInsightPromises = advisors.map(async (advisor): Promise<AdvisorInsight> => {
      try {
        const insight = await generateAdvisorInsight(advisor, input);
        return {
          name: advisor.name,
          avatar: advisor.avatar,
          tier: advisor.tier,
          insight: insight
        };
      } catch (error) {
        console.error(`Error generating insight for ${advisor.name}:`, error);
        // Fallback insight if AI fails
        return {
          name: advisor.name,
          avatar: advisor.avatar,
          tier: advisor.tier,
          insight: `As ${advisor.name}, I'd approach this challenge by focusing on ${advisor.voice.split(',')[0].toLowerCase()}. This situation requires strategic thinking and decisive action based on core principles.`
        };
      }
    });

    const advisorInsights = await Promise.all(advisorInsightPromises);

    // Generate combined summary
    const synthesis = await generateCombinedSummary(input, advisorInsights);

    const processingTime = (Date.now() - startTime) / 1000;

    const response: BoardSynthesisResponse = {
      success: true,
      advisors: advisorInsights,
      combinedSummary: synthesis.summary,
      keyThemes: synthesis.themes,
      actionPlan: synthesis.actionPlan,
      timestamp: new Date().toISOString(),
      processingTime: processingTime
    };

    // Save to synthesis history if user is authenticated
    if (userId) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase
          .from('synthesis_history')
          .insert({
            user_id: userId,
            input_text: input,
            advisor_ids: advisors.map(a => a.id),
            results: response
          });
      } catch (saveError) {
        console.error('Error saving synthesis history:', saveError);
        // Don't fail the request if we can't save history
      }
    }

    console.log(`Successfully generated board synthesis in ${processingTime}s`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in board-synthesis function:', error);
    
    const processingTime = (Date.now() - startTime) / 1000;
    
    let statusCode = 500;
    let errorCode = 'INTERNAL_ERROR';
    let errorMessage = 'An internal error occurred';
    
    if (error.message?.includes('API error')) {
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
    } else if (error.message?.includes('No AI API key')) {
      statusCode = 503;
      errorCode = 'SERVICE_UNAVAILABLE';
      errorMessage = 'AI service not configured';
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