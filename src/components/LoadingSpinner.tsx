import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  onComplete: () => void;
}

const LoadingSpinner = ({ onComplete }: LoadingSpinnerProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center font-ubuntu relative overflow-hidden"
      style={{
        backgroundImage: 'url(/macos-tahoe-wallpaper.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full blur-3xl"></div>
      </div>

      {/* Loading content */}
      <div className="relative z-10 flex flex-col items-center space-y-6">
        {/* Glass morphism container */}
        <div className="bg-white/10 backdrop-blur-glass border border-white/20 rounded-3xl p-8 shadow-glass">
          <div className="flex flex-col items-center space-y-4">
            {/* Futuristic loader */}
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-white" />
              <div className="absolute inset-0 rounded-full bg-white/10 blur-md animate-pulse"></div>
            </div>
            
            {/* Minimalist text */}
            <p className="text-white/80 text-sm font-light tracking-wide">
              Inicializando...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;