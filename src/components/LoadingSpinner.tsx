import { useEffect, useState } from 'react';
import { Pill } from 'lucide-react';

interface LoadingSpinnerProps {
  onComplete: () => void;
}

const LoadingSpinner = ({ onComplete }: LoadingSpinnerProps) => {
  const [progress, setProgress] = useState(0);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [loadingText, setLoadingText] = useState('Inicializando asistente...');

  useEffect(() => {
    // Preload background image
    const img = new Image();
    img.onload = () => {
      setBackgroundLoaded(true);
      setLoadingText('Preparando interfaz...');
    };
    img.onerror = () => {
      setBackgroundLoaded(true); // Continue even if image fails to load
      setLoadingText('Preparando interfaz...');
    };
    img.src = '/macos-tahoe-wallpaper.jpeg';

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100 && backgroundLoaded) {
          clearInterval(timer);
          setTimeout(onComplete, 300);
          return 100;
        }
        // Slow down progress if background isn't loaded yet
        const incrementRate = backgroundLoaded ? 5 : 2;
        return Math.min(prev + incrementRate, backgroundLoaded ? 100 : 95);
      });
    }, 100);

    return () => clearInterval(timer);
  }, [onComplete, backgroundLoaded]);

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center font-ubuntu relative overflow-hidden"
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

      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Pill Icon Animation */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-glass border border-white/20 shadow-glass flex items-center justify-center">
            <Pill size={32} className="text-white animate-spin" />
          </div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-white/5 blur-xl animate-pulse"></div>
        </div>

        {/* App Name with Glass Morphic Style */}
        <div className="text-center space-y-2 bg-white/10 backdrop-blur-glass border border-white/20 rounded-2xl px-8 py-6 shadow-glass">
          <h1 className="text-4xl font-light text-white">Smartep</h1>
          <p className="text-white/80 text-sm">Soluciones con IA</p>
        </div>

        {/* Loading Text */}
        <div className="text-center">
          <p className="text-sm text-white/70 animate-pulse">
            {loadingText}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;