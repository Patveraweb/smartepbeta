import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Send, Camera, Image, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import CameraInterface from './CameraInterface';

interface ChatInputProps {
  onSendMessage: (message: string, image?: File) => void;
  isLoading: boolean;
  onActivity?: () => void;
}

const ChatInput = ({ onSendMessage, isLoading, onActivity }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input for mobile devices
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile && textInputRef.current) {
      // Small delay to ensure the component is fully mounted
      const timer = setTimeout(() => {
        textInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || attachedImage) && !isLoading) {
      onSendMessage(message.trim() || 'Analiza esta imagen', attachedImage || undefined);
      setMessage('');
      clearAttachedImage();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCameraCapture = (file: File) => {
    setAttachedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setShowCamera(false);
  };

  const clearAttachedImage = () => {
    setAttachedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (showCamera) {
    return (
      <CameraInterface 
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        
        {/* Image preview */}
        {imagePreview && (
          <div className="mb-3 relative inline-block animate-fade-in">
            <img 
              src={imagePreview} 
              alt="Imagen adjunta" 
              className="max-w-[200px] max-h-[200px] rounded-lg border border-white/30 shadow-lg"
            />
            <Button
              type="button"
              onClick={clearAttachedImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 p-0"
            >
              <X size={12} />
            </Button>
          </div>
        )}
        
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-[25px] border border-white/30 rounded-full px-4 py-3 shadow-2xl">
          {/* Camera dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/70 hover:text-white hover:bg-transparent"
              >
                <Camera size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white/10 backdrop-blur-[25px] border border-white/30 text-white">
              <DropdownMenuItem 
                onClick={() => fileInputRef.current?.click()}
                className="hover:bg-white/20 cursor-pointer"
              >
                <Image size={16} className="mr-2" />
                Adjuntar desde dispositivo
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setShowCamera(true)}
                className="hover:bg-white/20 cursor-pointer"
              >
                <Camera size={16} className="mr-2" />
                Capturar foto
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>


          {/* Message input */}
          <div className="flex-1">
            <input
              ref={textInputRef}
              type="text"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                onActivity?.(); // Notificar actividad al escribir
              }}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tus dudas"
              className="w-full bg-transparent border-none outline-none text-white placeholder-white/50 font-ubuntu"
              disabled={isLoading}
            />
          </div>

          {/* Send button */}
          <Button
            type="submit"
            disabled={(!message.trim() && !attachedImage) || isLoading}
            className="h-10 w-10 rounded-full bg-transparent hover:bg-white/10 text-white border border-white/30 shadow-2xl backdrop-blur-[20px]"
          >
            <Send size={18} />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;