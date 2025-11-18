
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('🚀 enhance-statement function called');
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { statement, disputeReason, supportingDocuments } = await req.json()
    console.log('📝 Request data:', { statement, disputeReason, supportingDocuments });

    const GMI_API_KEY = Deno.env.get('GMI_API_KEY')
    if (!GMI_API_KEY) {
      console.error('❌ GMI_API_KEY not configured');
      throw new Error('GMI_API_KEY not configured')
    }

    const prompt = `You are CiteRight, an expert legal assistant for parking citation disputes. 

CURRENT STATEMENT: "${statement}"
DISPUTE REASON: "${disputeReason}"
SUPPORTING DOCUMENTS: ${supportingDocuments?.map((doc: any) => doc.name).join(', ') || 'None'}

Please analyze this statement and provide:
1. FEEDBACK: What's missing or could be improved (be specific)
2. ENHANCED_STATEMENT: A rewritten version that's more compelling and legally sound
3. COMPLETENESS_SCORE: Rate 1-100 how complete the statement is
4. SUGGESTIONS: Specific tips to make it stronger

For parking citation disputes, strong statements should include:
- Specific dates, times, and locations
- Clear description of circumstances
- Reference to relevant parking regulations
- How supporting evidence proves the case
- Professional, factual tone

Respond in JSON format:
{
  "feedback": "specific feedback here",
  "enhancedStatement": "improved statement here", 
  "completenessScore": 85,
  "suggestions": ["suggestion 1", "suggestion 2"]
}`

    console.log('📡 Calling Deepseek API...');
    const response = await fetch('https://api.gmi-serving.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GMI_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-ai/DeepSeek-R1-0528",
        messages: [
          {
            role: "system",
            content: "You are CiteRight, an expert legal assistant for parking citation disputes. You specialize in creating extremely detailed, formal, and legally sound statements."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2048
      })
    })

    console.log('📥 Deepseek API response status:', response.status);
    
    if (!response.ok) {
      console.error('❌ Deepseek API error:', response.statusText);
      throw new Error(`Deepseek API error: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('📄 Deepseek API response:', JSON.stringify(data, null, 2));
    
    const aiResponse = data.choices[0].message.content
    console.log('🤖 AI response content:', aiResponse);

    // Extract JSON from response
    let result
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0])
        console.log('✅ Parsed JSON result:', result);
      } else {
        console.warn('⚠️ No JSON found in response, using fallback');
        throw new Error('No JSON found in response');
      }
    } catch (e) {
      console.error('❌ JSON parsing failed:', e);
      // Fallback if JSON parsing fails
      result = {
        feedback: "I've analyzed your statement and provided suggestions for improvement.",
        enhancedStatement: statement, // Use original statement as fallback
        completenessScore: 60,
        suggestions: ["Add specific dates and times", "Include more details about the parking situation", "Reference any relevant parking regulations"]
      }
      console.log('🔄 Using fallback result:', result);
    }

    console.log('✅ Returning result:', result);
    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('💥 Error enhancing statement:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to enhance statement',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
