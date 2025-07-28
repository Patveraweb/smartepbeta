import { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { Button } from "@/components/ui/button";
import { RotateCcw, Pill } from "lucide-react";
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
  image?: string;
}
const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    content: '¡Hola! Soy FarmaIA, tu asistente farmacéutico inteligente de Cetepfarma. Puedo ayudarte con información sobre medicamentos, precios, disponibilidad y responder cualquier consulta relacionada con farmacología. También puedo analizar imágenes de medicamentos. ¿En qué puedo ayudarte hoy?',
    isBot: true,
    timestamp: new Date()
  }]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Timeout de inactividad
  useEffect(() => {
    const checkInactivity = () => {
      const now = Date.now();
      const inactiveTime = now - lastActivity;
      
      if (inactiveTime >= 120000 && !showInactivityWarning) { // 2 minutos
        setShowInactivityWarning(true);
      }
    };

    const interval = setInterval(checkInactivity, 10000); // Verificar cada 10 segundos
    return () => clearInterval(interval);
  }, [lastActivity, showInactivityWarning]);

  const resetActivity = () => {
    setLastActivity(Date.now());
    setShowInactivityWarning(false);
  };
  const callOpenAIAPI = async (userMessage: string, imageFile?: File): Promise<string> => {
    try {
      let imageData = null;
      
      if (imageFile) {
        // Convert image to base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            // Remove the data URL prefix to get only the base64 data
            const base64Data = result.split(',')[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
        imageData = base64;
      }

      // Convert messages to OpenAI format for conversation context
      const conversationHistory = messages.map(msg => ({
        role: msg.isBot ? 'assistant' : 'user',
        content: msg.content
      }));

      const {
        data,
        error
      } = await supabase.functions.invoke('openai-chat', {
        body: {
          message: userMessage,
          hasImage: !!imageFile,
          imageData: imageData,
          conversationHistory: conversationHistory
        }
      });
      if (error) {
        console.error('Error calling OpenAI API:', error);
        return 'Lo siento, hubo un error procesando tu consulta. Por favor intenta de nuevo.';
      }
      return data.response || 'No pude generar una respuesta. Por favor intenta de nuevo.';
    } catch (error) {
      console.error('Error in callOpenAIAPI:', error);
      return 'Lo siento, hubo un problema de conexión. Por favor intenta de nuevo.';
    }
  };
  const handleSendMessage = async (content: string, image?: File) => {
    if (!content.trim() && !image) return;

    resetActivity(); // Resetear actividad al enviar mensaje

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isBot: false,
      timestamp: new Date(),
      image: image ? URL.createObjectURL(image) : undefined
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    try {
      // Call OpenAI API
      const response = await callOpenAIAPI(content, image);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      if (image) {
        toast.success('Imagen analizada correctamente');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Lo siento, hubo un error procesando tu mensaje. Por favor intenta de nuevo.',
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
      toast.error('Error procesando mensaje');
    } finally {
      setIsLoading(false);
    }
  };
  const clearChat = () => {
    setMessages([{
      id: '1',
      content: '¡Hola! Soy FarmaIA, tu asistente farmacéutico inteligente de Cetepfarma. Puedo ayudarte con información sobre medicamentos, precios, disponibilidad y responder cualquier consulta relacionada con farmacología. También puedo analizar imágenes de medicamentos. ¿En qué puedo ayudarte hoy?',
      isBot: true,
      timestamp: new Date()
    }]);
    resetActivity();
    setShowInactivityWarning(false);
    toast.info('Conversación reiniciada');
  };
  return <div className="flex flex-col h-screen font-ubuntu relative overflow-hidden" style={{
    backgroundImage: 'url(/macos-tahoe-wallpaper.jpeg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }}>
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 relative z-10">
        <div className="max-w-4xl mx-auto pt-6">
          {messages.map(message => <ChatMessage key={message.id} message={message.content} isBot={message.isBot} timestamp={message.timestamp} />)}
          {isLoading && <div className="flex items-start gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-glass flex items-center justify-center shadow-glass border border-white/20">
                <Pill size={14} className="text-white" />
              </div>
              <div className="bg-white/10 backdrop-blur-glass border border-white/20 rounded-2xl rounded-bl-md px-4 py-3 shadow-glass">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{
                animationDelay: '0.2s'
              }}></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{
                animationDelay: '0.4s'
              }}></div>
                </div>
              </div>
            </div>}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Advertencia de inactividad */}
      {showInactivityWarning && (
        <div className="mb-4 mx-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg relative z-10">
          <p className="text-yellow-800 text-sm">
            Has estado inactivo por más de 2 minutos. ¿Te gustaría continuar con la sesión o cerrar el chat?
          </p>
          <div className="mt-2 space-x-2">
            <button
              onClick={resetActivity}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Continuar
            </button>
            <button
              onClick={clearChat}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              Cerrar Chat
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="relative z-10">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} onActivity={resetActivity} />
      </div>
    </div>;
};
export default ChatInterface;