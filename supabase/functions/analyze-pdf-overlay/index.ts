
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FormData {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  license_plate: string;
  citation_numbers: string[];
  citation_dates: string[];
  selected_reason_checkbox: string;
  statement_of_facts: string;
  signature_name: string;
  signature_date: string;
}

interface AnalysisResult {
  fieldMappings: Record<string, string>;
  suggestions: string[];
  confidence: number;
  enhancedStatement: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formData, pdfFieldNames } = await req.json() as {
      formData: FormData;
      pdfFieldNames: string[];
    };

    const gmiApiKey = Deno.env.get('GMI_API_KEY');
    if (!gmiApiKey) {
      throw new Error('GMI API key not configured');
    }

    console.log('Analyzing form data for intelligent PDF overlay...');

    // Enhanced analysis prompt focused on correct field mappings
    const analysisPrompt = `You are an expert PDF form analyst for San Francisco parking citation protest forms. Analyze the available PDF field names and provide correct field mappings.

## Available PDF Fields:
${pdfFieldNames.join(', ')}

## Form Data to Map:
- **Personal Info**: 
  - Name: "${formData.name}"
  - Address: "${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}"
  - Phone: "${formData.phone}"
  - Email: "${formData.email}"
  - License Plate: "${formData.license_plate}"

- **Citation Data**:
  - Citation Numbers: ${formData.citation_numbers.map((num, i) => `#${i+1}: "${num}"`).join(', ')}
  - Citation Dates: ${formData.citation_dates.map((date, i) => `#${i+1}: "${date}"`).join(', ')}

- **Dispute Info**:
  - Reason: "${formData.selected_reason_checkbox}"
  - Statement: "${formData.statement_of_facts}"

## CRITICAL MAPPING REQUIREMENTS

Based on successful previous mappings, use these exact field assignments:

### Dispute Reason Checkbox Mapping
The user's selected dispute reason should map to "OTHER EXPLAIN DETAILS" field for marking the "Other" option with an X.

### Statement of Facts Field
The user's statement of facts should map to "Text3" field for detailed explanations.

### Other Field Mappings
- Citation numbers should map to compound fields like "1_2", "2_2", etc.
- Citation dates should map to "signature_date" field
- Phone should map to "Phone" field (area code only)
- Standard personal info fields should map to their obvious counterparts

## REQUIRED JSON RESPONSE FORMAT

{
  "fieldMappings": {
    "name": "Name",
    "address": "Address", 
    "city_state_zip": "CityStateZip Code",
    "phone": "Phone",
    "email": "Email",
    "license_plate": "License Plate",
    "Citation Number 1": "1_2",
    "Citation Date 1": "signature_date",
    "statement_of_facts": "Text3",
    "selected_reason_checkbox": "OTHER EXPLAIN DETAILS"
  },
  "suggestions": [
    "Include specific details about why the citation was issued incorrectly",
    "Provide evidence to support your dispute",
    "Reference relevant parking regulations"
  ],
  "confidence": 0.95,
  "enhancedStatement": "Enhanced statement with better legal language"
}

CRITICAL: Map dispute reason to "OTHER EXPLAIN DETAILS" and statement of facts to "Text3".`;

    // Call GMI API
    const response = await fetch('https://api.gmi-serving.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${gmiApiKey}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-4-Scout-17B-16E-Instruct',
        messages: [
          {
            role: 'system',
            content: 'You are an expert PDF form analyst. Provide accurate field mappings in valid JSON format only.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1500
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GMI API error:', errorText);
      throw new Error(`GMI API error: ${response.status}`);
    }

    const gmiResult = await response.json();
    console.log('GMI API response received');

    let analysisResult: AnalysisResult;
    try {
      // Parse the AI response
      const aiResponse = gmiResult.choices[0].message.content;
      console.log('Raw AI response:', aiResponse);
      
      // Extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
        console.log('Parsed AI analysis result:', analysisResult);
      } else {
        throw new Error('No valid JSON found in AI response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Corrected mapping based on actual PDF form structure
      analysisResult = {
        fieldMappings: {
          'name': 'Name',
          'address': 'Address', 
          'city_state_zip': 'CityStateZip Code',
          'phone': 'Phone',
          'email': 'Email',
          'license_plate': 'License Plate',
          'Citation Number 1': '1_2', // Maps to numbered citation list on right
          'Citation Date 1': 'signature_date', // Maps to signature date field
          'Citation Number 2': '2_2',
          'Citation Date 2': 'signature_date',
          'statement_of_facts': 'Text3', // Maps to Text3 field for detailed explanations
          'selected_reason_checkbox': 'OTHER EXPLAIN DETAILS' // Maps to "Other" checkbox field for marking with X
        },
        suggestions: [
          'Include specific details about why the citation was issued incorrectly',
          'Mention any evidence you have (photos, receipts, etc.)',
          'Reference specific SF parking regulations if applicable'
        ],
        confidence: 0.9,
        enhancedStatement: formData.statement_of_facts
      };
    }

    console.log('Analysis completed successfully with corrected field mappings:', analysisResult.fieldMappings);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-pdf-overlay function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Analysis failed', 
        details: error.message 
      }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
