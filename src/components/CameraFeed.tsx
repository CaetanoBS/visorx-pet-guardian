
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CameraFeedProps {
  className?: string;
  simulateDetection?: boolean;
  detectionType?: 'none' | 'label' | 'dent' | 'cap';
}

const CameraFeed: React.FC<CameraFeedProps> = ({ 
  className, 
  simulateDetection = false,
  detectionType = 'none'
}) => {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const formatTime = () => {
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className={cn("bg-black rounded-lg overflow-hidden relative", className)}>
      <div className="absolute top-0 left-0 w-full p-2 flex justify-between items-center text-xs text-white bg-black/70">
        <div className="font-mono">CAM-01</div>
        <div className="font-mono">{formatTime()}</div>
      </div>
      
      <div className="relative">
        {/* Camera feed background - simulated pet bottle production line */}
        <div className="w-full aspect-video bg-gray-900 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-16 h-32 bg-blue-100/10 rounded-md relative">
                  {detectionType === 'label' && i === 3 && (
                    <div className="absolute inset-0 border-2 border-red-500 animate-pulse-slow flex items-center justify-center">
                      <span className="bg-red-500 text-white text-xs px-1">RÓTULO</span>
                    </div>
                  )}
                  {detectionType === 'dent' && i === 3 && (
                    <div className="absolute inset-0 border-2 border-red-500 animate-pulse-slow flex items-center justify-center">
                      <span className="bg-red-500 text-white text-xs px-1">AMASSADO</span>
                    </div>
                  )}
                  {detectionType === 'cap' && i === 3 && (
                    <div className="absolute inset-0 border-2 border-red-500 animate-pulse-slow flex items-center justify-center">
                      <span className="bg-red-500 text-white text-xs px-1">TAMPA</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Overlay elements - camera metrics */}
          <div className="absolute bottom-0 left-0 w-full p-2 flex justify-between bg-black/70 text-white text-xs">
            <div className="font-mono">Res: 1080p</div>
            <div className="font-mono">FPS: 60</div>
          </div>
          
          {simulateDetection && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-full max-w-md max-h-md border-2 border-green-500/50"></div>
            </div>
          )}
          
          {/* Camera grid overlay */}
          <div className="absolute inset-0 grid-pattern"></div>
        </div>
      </div>
    </div>
  );
};

export default CameraFeed;
