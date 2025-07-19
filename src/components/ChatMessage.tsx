import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Pill } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: string;
  isBot: boolean;
  timestamp: Date;
}

const ChatMessage = ({ message, isBot, timestamp }: ChatMessageProps) => {
  const formatBotMessage = (text: string) => {
    // Custom markdown components for better styling
    const components = {
      h1: ({ children }: any) => <h1 className="text-lg font-bold text-white mb-2">{children}</h1>,
      h2: ({ children }: any) => <h2 className="text-base font-semibold text-white mb-2">{children}</h2>,
      h3: ({ children }: any) => <h3 className="text-sm font-medium text-white mb-1">{children}</h3>,
      strong: ({ children }: any) => <strong className="font-semibold text-white">{children}</strong>,
      ul: ({ children }: any) => <ul className="list-none space-y-1 my-2">{children}</ul>,
      li: ({ children }: any) => <li className="flex items-start"><span className="text-blue-300 mr-2 mt-1">•</span><span className="flex-1">{children}</span></li>,
      p: ({ children }: any) => <p className="mb-2 last:mb-0">{children}</p>,
      em: ({ children }: any) => <em className="text-yellow-200 font-medium">{children}</em>,
    };

    return (
      <ReactMarkdown components={components}>
        {text}
      </ReactMarkdown>
    );
  };

  return (
    <div className={`flex items-end gap-2 mb-4 animate-fade-in ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <Avatar className="w-6 h-6 mb-1 flex-shrink-0 animate-scale-in">
          <AvatarFallback className="bg-white/10 backdrop-blur-[20px] border border-white/30 text-white text-xs shadow-2xl">
            <Pill size={10} className="text-white" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[75%] animate-slide-in-right ${isBot ? '' : 'flex flex-col items-end'}`}>
        <div 
          className={`
            px-4 py-3 rounded-2xl text-sm leading-relaxed backdrop-blur-[25px] border shadow-2xl
            ${isBot 
              ? 'bg-white/15 text-white border-white/30 rounded-bl-sm' 
              : 'bg-black/20 text-white border-white/20 rounded-br-sm'
            }
          `}
        >
          {isBot ? (
            <div className="prose prose-sm prose-invert max-w-none">
              {formatBotMessage(message)}
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message}</p>
          )}
        </div>
        <p className={`text-xs text-white/60 mt-1 animate-fade-in ${isBot ? 'text-left' : 'text-right'}`} style={{animationDelay: '0.2s'}}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {!isBot && (
        <Avatar className="w-6 h-6 mb-1 flex-shrink-0 animate-scale-in">
          <AvatarFallback className="bg-black/20 backdrop-blur-[20px] border border-white/20 text-white text-xs shadow-2xl">
            <User size={12} />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessage;