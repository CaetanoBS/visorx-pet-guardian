import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CameraFeedProps {
  className?: string;
  simulateDetection?: boolean;
  detectionType?: 'none' | 'label' | 'dent' | 'cap' | 'liquid';
  onDetect?: (types: ('none' | 'label' | 'dent' | 'cap' | 'liquid')[], bottleId: number) => void;
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
  const [bottles, setBottles] = useState<Bottle[]>([]);
  const [bottleCount, setBottleCount] = useState(0);
  const [lastDetectedBottleId, setLastDetectedBottleId] = useState<number | null>(null);
  
  // Production metrics - 99 bottles per minute = 5,940 per hour
  const bottlesPerMinute = 99;
  const bottlesPerHour = bottlesPerMinute * 60;
  const bottlesPerSecond = bottlesPerMinute / 60;
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Simulate conveyor belt moving bottles with smoother animation
  useEffect(() => {
    // Calculate interval based on bottles per minute (60,000ms / bottlesPerMinute)
    const interval = 60000 / bottlesPerMinute;
    
    const bottleGenerator = setInterval(() => {
      // Add a new bottle
      const defectTypes: ('none' | 'label' | 'dent' | 'cap' | 'liquid')[] = [];
      const hasIssue = Math.random() < 0.25; // 25% chance for a bottle to have an issue
      
      if (hasIssue) {
        // Decide how many defects (1 or 2)
        const defectCount = Math.random() < 0.3 ? 2 : 1; // 30% chance for multiple defects
        
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
        
        // Add a second defect if needed, ensuring it's different from the first
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
      
      setBottles(prev => {
        // Add new bottle at position 0
        const newBottle = {
          id: bottleCount,
          position: 0,
          hasIssue: hasIssue,
          types: defectTypes,
          fillLevel
        };
        
        // Return updated bottles array
        return [...prev, newBottle];
      });
      
      setBottleCount(prev => prev + 1);
    }, interval);
    
    // Create a more frequent animation frame for smoother movement
    const animationInterval = setInterval(() => {
      setBottles(prev => {
        return prev.map(bottle => ({
          ...bottle,
          // Make movement smaller but more frequent for smoother animation
          position: bottle.position + 0.05
        })).filter(bottle => bottle.position < 6); // Remove bottles that exit the view
      });
    }, 16); // ~60fps for smooth animation
    
    return () => {
      clearInterval(bottleGenerator);
      clearInterval(animationInterval);
    };
  }, [bottleCount]);

  // Effect to handle detection and trigger parent component
  useEffect(() => {
    // Center inspection zone is at position 3
    const centerBottles = bottles.filter(b => b.position >= 2.95 && b.position <= 3.05);
    
    centerBottles.forEach(centerBottle => {
      if (centerBottle && centerBottle.id !== lastDetectedBottleId) {
        // When a bottle reaches the center position, notify parent component
        if (onDetect) {
          setLastDetectedBottleId(centerBottle.id);
          // Pass the bottle's issue types (or ['none'] if no issue) AND the bottle ID
          onDetect(centerBottle.hasIssue ? centerBottle.types : ['none'], centerBottle.id);
          
          // Log for debugging
          if (centerBottle.hasIssue) {
            console.log(`Bottle issue detected: ${centerBottle.types.join(', ')}`);
          }
        }
      }
    });
  }, [bottles, onDetect, lastDetectedBottleId]);

  const formatTime = () => {
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className={cn("bg-black rounded-lg overflow-hidden relative", className)}>
      <div className="absolute top-0 left-0 w-full p-2 flex justify-between items-center text-xs text-white bg-black/70 z-10">
        <div className="font-mono">CAM-01</div>
        <div className="font-mono">{formatTime()}</div>
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
          
          {/* Production metrics */}
          <div className="absolute top-8 right-2 bg-black/50 rounded p-1 text-white text-xs font-mono">
            <div>{bottlesPerHour} uds/h</div>
            <div>{bottlesPerMinute} uds/min</div>
          </div>
          
          {/* Bottles on the conveyor */}
          <div className="absolute bottom-1/4 left-0 right-0">
            {bottles.map((bottle) => (
              <div 
                key={bottle.id} 
                className="absolute bottom-5 -translate-y-full transition-transform duration-16 ease-linear"
                style={{ 
                  left: `${(bottle.position * 16) + 2}%`,
                  transition: 'left 16ms linear'  // For smoother animation
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
                    
                    {/* Bottle neck */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-3 bg-blue-100/30"></div>
                    
                    {/* Label */}
                    <div className={cn(
                      "absolute top-1/3 left-0 w-full h-8 bg-white/70",
                      bottle.types.includes('label') && 'transform -rotate-12 bg-yellow-200/70'
                    )}></div>
                    
                    {/* Subtle bottle texture */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 rounded-md"></div>
                    
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
                      style={{ 
                        height: `${bottle.fillLevel || 80}%`,
                        borderBottomLeftRadius: '0.375rem',
                        borderBottomRightRadius: '0.375rem'
                      }}
                    >
                      {/* Liquid shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20"></div>
                    </div>
                  </div>
                </div>
                
                {/* Detection highlight */}
                {bottle.position >= 2.95 && bottle.position <= 3.05 && bottle.hasIssue && (
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
            <div className="font-mono">FPS: 60</div>
          </div>
          
          {/* Camera grid overlay */}
          <div className="absolute inset-0 grid-pattern"></div>
        </div>
      </div>
    </div>
  );
};

export default CameraFeed;
