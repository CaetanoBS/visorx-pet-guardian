
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface CameraFeedProps {
  className?: string;
  simulateDetection?: boolean;
  detectionType?: 'none' | 'label' | 'dent' | 'cap' | 'liquid';
  onDetect?: (types: ('none' | 'label' | 'dent' | 'cap' | 'liquid')[]) => void;
}

interface Bottle {
  id: number;
  hasIssue: boolean;
  types: ('none' | 'label' | 'dent' | 'cap' | 'liquid')[];
  position: number;
  fillLevel?: number; // 0-100 percentage of fill
}

const CameraFeed: React.FC<CameraFeedProps> = ({ 
  className, 
  simulateDetection = false,
  detectionType = 'none',
  onDetect
}) => {
  const [time, setTime] = useState(new Date());
  const [bottlePosition, setBottlePosition] = useState(-1);
  const [bottles, setBottles] = useState<Bottle[]>([]);
  const [bottleCount, setBottleCount] = useState(0);
  const [lastDetectedBottleId, setLastDetectedBottleId] = useState<number | null>(null);
  const [productionRate, setProductionRate] = useState({ perHour: 5928, perMinute: 98.8, perSecond: 1.65 });
  const detectionIntervalRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(Date.now());
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Move bottles based on real-time animation
  useEffect(() => {
    const updateBottles = (timestamp: number) => {
      const elapsed = timestamp - lastUpdateTimeRef.current;
      
      if (elapsed > 25) { // Update at ~40fps
        lastUpdateTimeRef.current = timestamp;
        
        // Calculate movement based on bottles per second
        const movementPerSecond = 3; // Full screen traversal in 2 seconds
        const movementThisFrame = (movementPerSecond * elapsed) / 1000;
        
        setBottles(prev => {
          // Move existing bottles
          const updated = prev.map(bottle => ({
            ...bottle,
            position: bottle.position + movementThisFrame
          })).filter(bottle => bottle.position < 6); // Remove bottles that exit view
          
          // Randomly add new bottles based on production rate
          const bottlesPerMs = productionRate.perSecond / 1000;
          const shouldAddBottle = Math.random() < (bottlesPerMs * elapsed * 1.2); // Slight randomness
          
          if (shouldAddBottle) {
            // Decide if bottle has issues (25% chance)
            const hasIssue = Math.random() < 0.25;
            const defectTypes: ('none' | 'label' | 'dent' | 'cap' | 'liquid')[] = [];
            
            if (hasIssue) {
              // Randomly select 1 or 2 defect types
              const defectCount = Math.random() < 0.3 ? 2 : 1;
              
              // First defect
              const issueRandom = Math.random();
              if (issueRandom < 0.25) {
                defectTypes.push('label');
              } else if (issueRandom < 0.5) {
                defectTypes.push('dent');
              } else if (issueRandom < 0.75) {
                defectTypes.push('cap');
              } else {
                defectTypes.push('liquid');
              }
              
              // Add second defect if needed
              if (defectCount > 1) {
                const availableDefects = ['label', 'dent', 'cap', 'liquid'].filter(
                  d => d !== defectTypes[0]
                ) as ('label' | 'dent' | 'cap' | 'liquid')[];
                
                const secondDefect = availableDefects[Math.floor(Math.random() * availableDefects.length)];
                defectTypes.push(secondDefect);
              }
            } else {
              defectTypes.push('none');
            }
            
            // Create fill level (75-100% for normal, 40-85% for liquid issues)
            const fillLevel = defectTypes.includes('liquid') 
              ? Math.floor(Math.random() * 45) + 40 
              : Math.floor(Math.random() * 15) + 85;
            
            // Add new bottle at start of conveyor
            updated.push({
              id: bottleCount,
              position: 0,
              hasIssue: hasIssue,
              types: defectTypes,
              fillLevel
            });
            
            setBottleCount(prev => prev + 1);
          }
          
          return updated;
        });
      }
      
      animationFrameRef.current = requestAnimationFrame(updateBottles);
    };
    
    animationFrameRef.current = requestAnimationFrame(updateBottles);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [bottleCount, productionRate.perSecond]);

  // Effect to handle detection and trigger parent component
  useEffect(() => {
    const detectBottles = () => {
      const centerBottles = bottles.filter(b => b.position >= 2.8 && b.position <= 3.2);
      
      centerBottles.forEach(bottle => {
        if (bottle.id !== lastDetectedBottleId) {
          setLastDetectedBottleId(bottle.id);
          
          // Notify parent component
          if (onDetect) {
            onDetect(bottle.hasIssue ? bottle.types : ['none']);
            
            // Log for debugging
            if (bottle.hasIssue) {
              console.log(`Bottle issue detected: ${bottle.types.join(', ')}`);
            }
          }
        }
      });
    };
    
    detectionIntervalRef.current = window.setInterval(detectBottles, 200);
    
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [bottles, onDetect, lastDetectedBottleId]);

  const formatTime = () => {
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className={cn("bg-black rounded-lg overflow-hidden relative", className)}>
      <div className="absolute top-0 left-0 w-full p-2 flex justify-between items-center text-xs text-white bg-black/70 z-10">
        <div className="font-mono">CAM-01</div>
        <div className="font-mono flex items-center space-x-3">
          <span>{productionRate.perMinute.toFixed(1)} un/min</span>
          <span>{formatTime()}</span>
        </div>
      </div>
      
      <div className="relative">
        {/* Camera feed background - conveyor belt */}
        <div className="w-full aspect-video bg-gray-900 relative overflow-hidden">
          {/* Conveyor belt */}
          <div className="absolute bottom-1/4 left-0 right-0 h-8 bg-gray-800 border-t border-b border-gray-700">
            <div className="grid grid-cols-24 h-full">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="border-r border-gray-700 h-full" />
              ))}
            </div>
          </div>
          
          {/* Bottles on the conveyor */}
          <div className="absolute bottom-1/4 left-0 right-0">
            {bottles.map((bottle) => (
              <div 
                key={bottle.id} 
                className="absolute bottom-5 -translate-y-full transition-all duration-100 ease-linear"
                style={{ 
                  left: `${(bottle.position * 16) + 2}%`,
                  transition: 'none' // Use CSS transform for smoother animation
                }}
              >
                <div className="w-12 h-32 relative">
                  {/* Bottle body */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-24 bg-blue-100/30 rounded-md">
                    {/* Bottle cap */}
                    <div className={cn(
                      "absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-3 rounded-t-md",
                      bottle.types.includes('cap') ? 'bg-red-500' : 'bg-blue-500'
                    )}></div>
                    
                    {/* Label */}
                    <div className={cn(
                      "absolute top-1/3 left-0 w-full h-8 bg-white/70",
                      bottle.types.includes('label') && 'transform -rotate-12 bg-yellow-200/70'
                    )}></div>
                    
                    {/* Dent */}
                    {bottle.types.includes('dent') && (
                      <div className="absolute top-1/2 right-0 w-3 h-6 bg-gray-900 rounded-full"></div>
                    )}
                    
                    {/* Liquid fill level */}
                    <div 
                      className={cn(
                        "absolute bottom-0 left-0 w-full transition-all duration-300",
                        bottle.types.includes('liquid') ? 'bg-red-500/50' : 'bg-blue-500/50'
                      )}
                      style={{ height: `${bottle.fillLevel || 80}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Detection highlight */}
                {bottle.position >= 2.8 && bottle.position <= 3.2 && bottle.hasIssue && (
                  <div className="absolute inset-0 border-2 border-red-500 animate-pulse-slow flex items-center justify-center z-10">
                    <div className="bg-red-500 text-white text-[7px] px-1 flex flex-col items-center">
                      {bottle.types.includes('label') && <span>RÓTULO</span>}
                      {bottle.types.includes('dent') && <span>AMASSADO</span>}
                      {bottle.types.includes('cap') && <span>TAMPA</span>}
                      {bottle.types.includes('liquid') && <span>NÍVEL</span>}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Stationary camera view overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full h-full max-w-md max-h-md border-2 border-green-500/50"></div>
          </div>
          
          {/* Overlay elements - camera metrics */}
          <div className="absolute bottom-0 left-0 w-full p-2 flex justify-between bg-black/70 text-white text-xs z-10">
            <div className="font-mono">Res: 1080p</div>
            <div className="font-mono flex items-center gap-3">
              <span>FPS: 60</span>
              <span className="text-green-400">{productionRate.perHour} un/h</span>
            </div>
          </div>
          
          {/* Camera grid overlay */}
          <div className="absolute inset-0 grid-pattern"></div>
        </div>
      </div>
    </div>
  );
};

export default CameraFeed;
