import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function authenticateUser(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Authentication required');
  }

  const token = authHeader.substring(7);
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Invalid authentication');
  }

  return { userId: user.id, email: user.email || '' };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Authenticate user first
    const authResult = await authenticateUser(req);
    
    const { thoughtId, content } = await req.json();
    
    if (!thoughtId || !content) {
      throw new Error('Missing thoughtId or content');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`Analyzing thought: ${thoughtId}`);

    // Create comprehensive analysis prompt
    const analysisPrompt = `You are an expert thought analyst and content strategist. Analyze the following thought and provide insights.

Thought content: "${content}"

Please provide a JSON response with the following structure:
{
  "summary": "A concise 2-3 sentence summary of the core message and themes",
  "keyInsights": [
    "First key insight or quote from the thought (max 100 chars)",
    "Second key insight or quote (max 100 chars)", 
    "Third key insight or quote (max 100 chars)"
  ],
  "themes": ["theme1", "theme2", "theme3"],
  "mood": "thoughtful|excited|contemplative|inspired|frustrated|curious",
  "tweetSuggestion": {
    "text": "An engaging tweet based on the thought (under 280 chars)",
    "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
    "engagementPotential": "high|medium|low"
  },
  "linkedinPost": {
    "title": "Professional headline for LinkedIn post",
    "text": "Expanded professional post version (500-800 chars)",
    "hashtags": ["professional", "hashtags"],
    "voiceMatch": 95
  },
  "actionableInsights": [
    "Specific insight the person could act on",
    "Another actionable insight"
  ],
  "contentAngles": [
    "Different angle to explore this topic",
    "Another content angle"
  ]
}

Make the analysis personal, insightful, and actionable. Focus on extracting the core message and suggesting ways to share it effectively.`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: 'You are an expert thought analyst and content strategist. Always respond with valid JSON.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const analysisText = aiResponse.choices[0].message.content;
    
    // Parse the JSON response
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', analysisText);
      throw new Error('AI response was not valid JSON');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Update the thought with analysis
    const { error: updateError } = await supabase
      .from('thoughts')
      .update({
        mood: analysis.mood,
        tags: analysis.themes,
        processed_at: new Date().toISOString(),
        is_processed: true,
        // Store full analysis in context field
        context: JSON.stringify(analysis)
      })
      .eq('id', thoughtId);

    if (updateError) {
      console.error('Failed to update thought:', updateError);
      throw new Error('Failed to save analysis to database');
    }

    console.log(`Successfully analyzed thought ${thoughtId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: analysis,
        thoughtId: thoughtId
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Analysis error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});