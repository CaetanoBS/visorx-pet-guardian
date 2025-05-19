
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
  // Adjusted production rate to 5928 units per hour
  const [productionRate, setProductionRate] = useState({ 
    perHour: 5928, 
    perMinute: 98.8, 
    perSecond: 1.65
  });
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

  // Move bottles based on real-time animation with adjusted speed
  useEffect(() => {
    const updateBottles = (timestamp: number) => {
      const elapsed = timestamp - lastUpdateTimeRef.current;
      
      if (elapsed > 16) { // Update at ~60fps for smoother animation
        lastUpdateTimeRef.current = timestamp;
        
        // Adjusted movement speed for better visibility
        const movementPerSecond = 1.5; // Slower traversal compared to previous setting
        const movementThisFrame = (movementPerSecond * elapsed) / 1000;
        
        setBottles(prev => {
          // Move existing bottles
          const updated = prev.map(bottle => ({
            ...bottle,
            position: bottle.position + movementThisFrame
          })).filter(bottle => bottle.position < 6); // Remove bottles that exit view
          
          // Randomly add new bottles based on adjusted production rate
          const bottlesPerMs = productionRate.perSecond / 1000;
          const shouldAddBottle = Math.random() < (bottlesPerMs * elapsed);
          
          if (shouldAddBottle) {
            // Decide if bottle has issues (15% chance)
            const hasIssue = Math.random() < 0.15;
            const defectTypes: ('none' | 'label' | 'dent' | 'cap' | 'liquid')[] = [];
            
            if (hasIssue) {
              // Randomly select 1 or 2 defect types
              const defectCount = Math.random() < 0.3 ? 2 : 1;
              
              // First defect - with weighted probabilities
              const issueRandom = Math.random();
              if (issueRandom < 0.30) {
                defectTypes.push('label'); // More common label issues
              } else if (issueRandom < 0.60) {
                defectTypes.push('dent'); // More common dent issues
              } else if (issueRandom < 0.80) {
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

  // Effect to handle detection and trigger parent component - increased frequency
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
    
    // More frequent detection to match higher speed
    detectionIntervalRef.current = window.setInterval(detectBottles, 100); 
    
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [bottles, onDetect, lastDetectedBottleId]);

  const formatTime = () => {
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Enhanced realistic visuals and display
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
        {/* Camera feed background - conveyor belt with more realistic elements */}
        <div className="w-full aspect-video bg-gray-900 relative overflow-hidden">
          {/* Enhanced conveyor belt with more industrial look */}
          <div className="absolute bottom-1/4 left-0 right-0 h-10 bg-gray-800 border-t border-b border-gray-700 flex">
            <div className="grid grid-cols-48 h-full w-full">
              {Array.from({ length: 48 }).map((_, i) => (
                <div key={i} className="border-r border-gray-700 h-full flex items-center justify-center">
                  {i % 3 === 0 && <div className="w-1 h-4 bg-gray-600"></div>}
                </div>
              ))}
            </div>
          </div>
          
          {/* Enhanced background machinery elements */}
          <div className="absolute top-1/4 left-10 w-20 h-20 bg-gray-800 rounded-md opacity-20 blur-sm"></div>
          <div className="absolute top-10 right-10 w-16 h-8 bg-gray-700 rounded-sm opacity-20 blur-sm"></div>
          
          {/* Bottles on the conveyor - enhanced realism */}
          <div className="absolute bottom-1/4 left-0 right-0">
            {bottles.map((bottle) => (
              <div 
                key={bottle.id} 
                className="absolute bottom-8 -translate-y-full"
                style={{ 
                  left: `${(bottle.position * 16) + 2}%`,
                  transition: 'none', // Use CSS transform for smoother animation
                  filter: bottle.hasIssue ? 'none' : 'brightness(1.05)'
                }}
              >
                <div className="w-12 h-32 relative">
                  {/* Enhanced bottle body with shadow and reflection */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-24 bg-blue-100/20 rounded-md overflow-hidden"
                      style={{
                        boxShadow: 'inset 1px 1px 3px rgba(255,255,255,0.3), inset -1px -1px 3px rgba(0,0,0,0.2)'
                      }}>
                    {/* Bottle cap with realistic effect */}
                    <div className={cn(
                      "absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-3 rounded-t-md",
                      bottle.types.includes('cap') ? 'bg-red-500' : 'bg-blue-500',
                      bottle.types.includes('cap') ? 'rotate-3' : ''
                    )}
                    style={{
                      boxShadow: bottle.types.includes('cap') ? 'none' : '0 1px 2px rgba(0,0,0,0.3)'
                    }}></div>
                    
                    {/* Enhanced label with shadow effect */}
                    <div className={cn(
                      "absolute top-1/3 left-0 w-full h-8",
                      bottle.types.includes('label') 
                        ? 'transform -rotate-12 bg-yellow-200/70' 
                        : 'bg-white/60'
                    )}
                    style={{
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                      {/* Simulated text on label */}
                      <div className="w-full h-full flex flex-col justify-center">
                        <div className="w-3/4 h-1 mx-auto bg-gray-400/30 mb-1"></div>
                        <div className="w-1/2 h-1 mx-auto bg-gray-400/30"></div>
                      </div>
                    </div>
                    
                    {/* Enhanced Dent visualization */}
                    {bottle.types.includes('dent') && (
                      <div className="absolute top-1/2 right-0 w-3 h-6 bg-gray-900/80 rounded-full"
                          style={{
                            boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.8)'
                          }}></div>
                    )}
                    
                    {/* Enhanced liquid fill level with reflective effect */}
                    <div 
                      className={cn(
                        "absolute bottom-0 left-0 w-full transition-all duration-100",
                        bottle.types.includes('liquid') ? 'bg-red-500/40' : 'bg-blue-500/40'
                      )}
                      style={{ 
                        height: `${bottle.fillLevel || 80}%`,
                        backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)'
                      }}
                    >
                      {/* Surface reflection */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced detection highlight */}
                {bottle.position >= 2.8 && bottle.position <= 3.2 && bottle.hasIssue && (
                  <div className="absolute inset-0 border-2 border-red-500 animate-pulse-slow flex items-center justify-center z-10">
                    <div className="bg-red-500/80 text-white text-[7px] px-1 py-0.5 flex flex-col items-center rounded-sm backdrop-blur-sm">
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
          
          {/* Enhanced camera targeting overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full h-full max-w-md max-h-md border-2 border-green-500/40 flex items-center justify-center">
              <div className="absolute w-24 h-24 border border-green-500/20 rounded-full"></div>
              <div className="absolute w-12 h-12 border border-green-500/30 rounded-full"></div>
            </div>
            {/* Enhanced camera crosshairs */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-0.5 bg-green-500/20"></div>
              <div className="h-48 w-0.5 bg-green-500/20"></div>
            </div>
          </div>
          
          {/* Enhanced overlay elements - camera metrics */}
          <div className="absolute bottom-0 left-0 w-full p-2 flex justify-between bg-black/70 text-white text-xs z-10">
            <div className="font-mono">Res: 1080p</div>
            <div className="font-mono flex items-center gap-3">
              <span>FPS: 60</span>
              <span className="text-green-400">{productionRate.perHour} un/h</span>
            </div>
          </div>
          
          {/* Enhanced camera grid overlay */}
          <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 pointer-events-none">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="border border-green-500/10"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraFeed;
