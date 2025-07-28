import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { message, hasImage, imageData, conversationHistory = [] } = await req.json();
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Obtener información de medicamentos de la base de datos
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    
    let medicamentosInfo = '';
    try {
      const { data: medicamentos, error } = await supabaseClient
        .from('medicamentos')
        .select('*')
        .eq('disponible', true);
      
      if (!error && medicamentos) {
        medicamentosInfo = `
CATÁLOGO DE MEDICAMENTOS CETEPFARMA:
${medicamentos.map(med => 
  `- ${med.nombre} (${med.principio_activo}): ₡${med.precio} - ${med.presentacion} - Stock: ${med.stock} unidades - ${med.laboratorio}`
).join('\n')}
        `;
      }
    } catch (error) {
      console.error('Error obteniendo medicamentos:', error);
    }

    const systemPrompt = `Eres FarmaIA, un asistente farmacéutico especializado de CETEPFARMA (ubicada en Balmoral 309, Nivel -2). Tu misión es ayudar EXCLUSIVAMENTE con temas de salud médica, farmacia, medicamentos, bienestar y salud mental.

INFORMACIÓN DE LA FARMACIA:
- Nombre: CETEPFARMA
- Ubicación: Balmoral 309, Nivel -2
- Todos los medicamentos mencionados están disponibles en nuestra farmacia
- Siempre menciona que contamos con estos medicamentos en stock

TEMAS PERMITIDOS ÚNICAMENTE:
- Medicamentos y farmacología
- Salud médica y general
- Bienestar y salud mental
- Información sobre enfermedades
- Primeros auxilios
- Nutrición y vida saludable
- Prevención y cuidado de la salud

DIRECTRICES PRINCIPALES:
1. Cuando menciones un medicamento del catálogo, incluye:
   - Precio en colones costarricenses (₡)
   - Disponibilidad en stock
   - Presentación exacta
   - Laboratorio fabricante
2. Al finalizar consultas, invita a visitar CETEPFARMA en Balmoral 309, Nivel -2
3. Mantén un tono profesional pero cercano
4. Siempre recomienda consulta médica para decisiones importantes

ANÁLISIS DE IMÁGENES:
- Si la imagen no contiene medicamentos o elementos de salud, responde: "No puedo analizar esta imagen ya que no contiene elementos relacionados con medicamentos o salud. ¿Puedes compartir una imagen de un medicamento o consultar sobre algún tema de salud?"

SI EL USUARIO PREGUNTA SOBRE TEMAS NO PERMITIDOS:
"Lo siento, solo puedo ayudarte con temas relacionados con medicamentos, salud y bienestar. ¿Tienes alguna consulta sobre medicamentos o salud?"

${medicamentosInfo}

IMPORTANTE: MÁXIMO 700 CARACTERES SIEMPRE. SOLO TEMAS DE SALUD.`;

    // Prepare messages for OpenAI with conversation history
    const messages = [
      {
        role: "system",
        content: systemPrompt
      }
    ];

    // Add conversation history (excluding the system message and current message)
    if (conversationHistory && conversationHistory.length > 0) {
      // Filter out the initial bot greeting to avoid repetition
      const filteredHistory = conversationHistory.filter((msg, index) => {
        if (index === 0 && msg.role === 'assistant') {
          return false; // Skip initial greeting
        }
        return true;
      });
      
      messages.push(...filteredHistory);
    }

    if (hasImage && imageData) {
      // Add current message with image
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: `Analiza esta imagen de medicamento y proporciona información relevante: ${message}`
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${imageData}`,
              detail: "high"
            }
          }
        ]
      });
    } else {
      // Add current text only message
      messages.push({
        role: "user",
        content: message
      });
    }

    console.log('Sending request to OpenAI API...', hasImage ? 'with image' : 'text only');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: hasImage ? 'gpt-4.1-2025-04-14' : 'gpt-4.1-mini-2025-04-14',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI API response received');

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }

    const generatedText = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in openai-chat function:', error);
    return new Response(JSON.stringify({ 
      error: 'Error procesando tu consulta. Por favor intenta de nuevo.',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});