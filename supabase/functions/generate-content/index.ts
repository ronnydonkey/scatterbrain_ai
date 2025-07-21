import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting generate-content function');
    
    // Authenticate user first
    const authResult = await authenticateUser(req);
    const authenticatedUserId = authResult.userId;
    
    const { 
      thoughtId,
      platform,
      contentType, 
      tone, 
      length,
      targetAudience
    } = await req.json();

    console.log('Request data:', { thoughtId, platform, contentType, tone, length, targetAudience });

    // Get the thought content if thoughtId is provided
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let thoughtContent = '';
    let organizationId = '';
    let userId = authenticatedUserId;

    if (thoughtId) {
      const { data: thought, error: thoughtError } = await supabase
        .from('thoughts')
        .select('content, user_id, organization_id')
        .eq('id', thoughtId)
        .eq('user_id', authenticatedUserId) // Ensure user can only access their own thoughts
        .single();

      if (thoughtError) {
        console.error('Error fetching thought:', thoughtError);
        throw new Error('Thought not found or access denied');
      }

      thoughtContent = thought.content;
      organizationId = thought.organization_id;
      userId = thought.user_id;
    } else {
      throw new Error('Thought ID is required');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create system prompt for content generation
    const systemPrompt = `You are an expert content creator specializing in ${platform} content.

Platform: ${platform}
Content Type: ${contentType}
Target Tone: ${tone}
Length: ${length}
Target Audience: ${targetAudience}

Create engaging, authentic content that:
1. Is optimized for ${platform}
2. Maintains the requested ${tone} tone throughout
3. Is appropriate for ${length} length content
4. Resonates with ${targetAudience} audience
5. Provides genuine value and engagement

Original Thought: ${thoughtContent}

Generate comprehensive content including:
- A compelling title/hook
- Main content body optimized for ${platform}
- Key takeaways or call-to-action
- Suggested hashtags (if applicable for the platform)

Keep the content authentic and engaging for ${platform}.`;

    // Generate content with OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 2000,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Transform this thought into ${contentType} content for ${platform}: "${thoughtContent}"`
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    // Calculate engagement prediction (simple heuristic)
    const lengthScore = Math.min(generatedContent.length / 1000, 1) * 0.5;
    const platformScore = platform ? 0.3 : 0.1;
    const toneScore = tone ? 0.2 : 0.1;
    const engagementPrediction = Math.min((lengthScore + platformScore + toneScore) * 100, 95);

    // Extract title from generated content (assumes first line is title)
    const lines = generatedContent.split('\n').filter(line => line.trim());
    const title = lines[0]?.replace(/^#+\s*/, '').trim() || `${platform} content from thought`;
    
    // Store content suggestion in database
    const { data: suggestion, error: dbError } = await supabase
      .from('content_suggestions')
      .insert({
        organization_id: organizationId,
        user_id: userId,
        title,
        description: `AI-generated ${contentType} content for ${platform}`,
        content_type: contentType,
        ai_generated_content: generatedContent,
        target_keywords: [],
        suggested_tone: tone,
        engagement_prediction: engagementPrediction,
        voice_authenticity_score: 75,
        estimated_word_count: generatedContent.split(' ').length,
        thought_id: thoughtId || null
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save content suggestion');
    }

    // Track usage for tier limits
    await supabase
      .from('usage_tracking')
      .insert({
        organization_id: organizationId,
        user_id: userId,
        resource_type: 'content_generation',
        count: 1,
        tier: 'unknown', // Will be determined by frontend
        metadata: { content_type: contentType, platform: platform }
      });

    return new Response(JSON.stringify({
      success: true,
      suggestion,
      content: generatedContent
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});