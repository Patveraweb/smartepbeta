import { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, X, RotateCcw } from "lucide-react";

interface CameraInterfaceProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

const CameraInterface = ({ onCapture, onClose }: CameraInterfaceProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStreamReady, setIsStreamReady] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          setIsStreamReady(true);
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      onClose();
    }
  }, [onClose, facingMode]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsStreamReady(false);
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current && isStreamReady) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
            onCapture(file);
            stopCamera();
            onClose();
          }
        }, 'image/jpeg', 0.8);
      }
    }
  }, [isStreamReady, onCapture, onClose, stopCamera]);

  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  const toggleCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    stopCamera();
    setTimeout(() => {
      startCamera();
    }, 100);
  }, [stopCamera, startCamera]);

  // Start camera when component mounts
  useState(() => {
    startCamera();
  });

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-white/5 backdrop-blur-[40px] border-b border-white/10">
        <h2 className="text-white text-lg font-medium font-ubuntu">Capturar Foto</h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={toggleCamera}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 backdrop-blur-[20px] border border-white/20"
          >
            <RotateCcw size={20} />
          </Button>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <X size={20} />
          </Button>
        </div>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
        />
        
        <canvas
          ref={canvasRef}
          className="hidden"
        />

        {!isStreamReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[20px]">
            <div className="text-white text-center bg-white/10 backdrop-blur-[40px] border border-white/20 rounded-2xl p-6 shadow-2xl">
              <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="font-ubuntu">Iniciando cámara...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 bg-white/5 backdrop-blur-[40px] border-t border-white/10 flex justify-center items-center gap-6">
        <Button
          onClick={handleClose}
          variant="outline"
          className="px-6 py-3 bg-white/10 backdrop-blur-[25px] border-white/30 text-white hover:bg-white/20 shadow-xl font-ubuntu"
        >
          Cancelar
        </Button>
        
        <Button
          onClick={capturePhoto}
          disabled={!isStreamReady}
          className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-[25px] text-black hover:bg-white flex items-center justify-center shadow-2xl border border-white/20 disabled:opacity-50"
        >
          <Camera size={24} />
        </Button>
      </div>
    </div>
  );
};

export default CameraInterface;