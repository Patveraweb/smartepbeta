import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, hasImage, imageData } = await req.json();
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const systemPrompt = `Eres FarmaIA, un asistente farmacéutico especializado, amigable y profesional. Tu misión es ayudar a las personas con información confiable sobre medicamentos y salud.

LÍMITE CRÍTICO: Mantén TODAS tus respuestas bajo 700 caracteres. Sé conciso pero completo.

PERSONALIDAD Y TONO:
- Habla de manera natural, empática y cercana, como un farmacéutico de confianza
- Usa un lenguaje claro y accesible, evita terminología excesivamente técnica
- Sé paciente y comprensivo con las preocupaciones de los usuarios

FORMATO DE RESPUESTA ESTRUCTURADO:
- Organiza la información en secciones claras usando **títulos en negrita**
- Usa listas con viñetas (•) para información fácil de leer
- Separa conceptos importantes con líneas en blanco
- Al final, ofrece una pregunta de seguimiento relevante

RESPONSABILIDAD MÉDICA:
- Siempre recuerda que la información es educativa, no reemplaza consulta médica
- Sugiere consultar profesionales cuando sea necesario
- Menciona la importancia de leer prospectos y verificar alergias

EJEMPLO DE ESTRUCTURA CORTA:
**[Nombre del medicamento/tema]**

**¿Para qué sirve?**
• [Lista de usos principales]

**Dosis típica:**
• [Información básica de dosificación]

**Precauciones:**
• [Contraindicaciones principales]

⚠️ **Recuerda:** Siempre consulta con un profesional de la salud.

¿Algo más específico sobre [tema]?

IMPORTANTE: MÁXIMO 700 CARACTERES SIEMPRE.`;

    // Prepare the content parts
    const parts = [];
    
    if (hasImage && imageData) {
      // Add the image part
      parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: imageData
        }
      });
      // Add text prompt for image analysis
      parts.push({
        text: `${systemPrompt}\n\nAnaliza esta imagen de medicamento y proporciona información relevante: ${message}`
      });
    } else {
      // Text only
      parts.push({
        text: `${systemPrompt}\n\nConsulta del usuario: ${message}`
      });
    }

    console.log('Sending request to Gemini API...', hasImage ? 'with image' : 'text only');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: parts
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response received');

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    const generatedText = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ response: generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in gemini-chat function:', error);
    return new Response(JSON.stringify({ 
      error: 'Error procesando tu consulta. Por favor intenta de nuevo.',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});