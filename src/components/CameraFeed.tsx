
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
  const [bottlePosition, setBottlePosition] = useState(-1);
  const [bottles, setBottles] = useState<Array<{id: number, hasIssue: boolean, type: 'none' | 'label' | 'dent' | 'cap'}>>([]);
  const [bottleCount, setBottleCount] = useState(0);
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Simulate conveyor belt moving bottles
  useEffect(() => {
    const interval = setInterval(() => {
      // Move bottles along the conveyor
      setBottles(prev => {
        const updated = prev.map(bottle => ({
          ...bottle,
          position: bottle.position + 1
        })).filter(bottle => bottle.position < 6); // Remove bottles that exit the view
        
        // Randomly add a new bottle at the start
        if (Math.random() > 0.3) { // 70% chance to add a new bottle
          let newIssueType: 'none' | 'label' | 'dent' | 'cap' = 'none';
          const hasIssue = Math.random() < 0.2; // 20% chance for a bottle to have an issue
          
          if (hasIssue) {
            const issueRandom = Math.random();
            if (issueRandom < 0.33) {
              newIssueType = 'label';
            } else if (issueRandom < 0.66) {
              newIssueType = 'dent';
            } else {
              newIssueType = 'cap';
            }
          }
          
          updated.push({
            id: bottleCount,
            position: 0,
            hasIssue,
            type: newIssueType
          });
          
          setBottleCount(prev => prev + 1);
        }
        
        return updated;
      });
    }, 800); // Move every 800ms
    
    return () => clearInterval(interval);
  }, [bottleCount]);

  // Effect to handle detection and trigger parent component
  useEffect(() => {
    const centerBottle = bottles.find(b => b.position === 3);
    if (centerBottle && centerBottle.hasIssue) {
      // When a bottle with an issue is at the center position, trigger detection
      if (detectionType !== centerBottle.type) {
        // This is how we would normally notify the parent component
        // For now, we're just console logging it
        console.log(`Bottle issue detected: ${centerBottle.type}`);
      }
    }
  }, [bottles, detectionType]);

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
            <div className="grid grid-cols-12 h-full">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="border-r border-gray-700 h-full" />
              ))}
            </div>
          </div>
          
          {/* Bottles on the conveyor */}
          <div className="absolute bottom-1/4 left-0 right-0">
            {bottles.map((bottle) => (
              <div 
                key={bottle.id} 
                className={cn(
                  "absolute bottom-5 -translate-y-full transition-transform duration-500 ease-linear",
                  `left-[${(bottle.position * 16) + 2}%]`
                )}
                style={{ left: `${(bottle.position * 16) + 2}%` }}
              >
                <div className="w-12 h-32 relative">
                  {/* Bottle body */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-24 bg-blue-100/30 rounded-md">
                    {/* Bottle cap */}
                    <div className={cn(
                      "absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-3 rounded-t-md",
                      bottle.type === 'cap' ? 'bg-red-500' : 'bg-blue-500'
                    )}></div>
                    
                    {/* Label */}
                    <div className={cn(
                      "absolute top-1/3 left-0 w-full h-8 bg-white/70",
                      bottle.type === 'label' && 'transform -rotate-12 bg-yellow-200/70'
                    )}></div>
                    
                    {/* Dent */}
                    {bottle.type === 'dent' && (
                      <div className="absolute top-1/2 right-0 w-3 h-6 bg-gray-900 rounded-full"></div>
                    )}
                  </div>
                </div>
                
                {/* Detection highlight */}
                {bottle.position === 3 && bottle.hasIssue && (
                  <div className="absolute inset-0 border-2 border-red-500 animate-pulse-slow flex items-center justify-center z-10">
                    <span className="bg-red-500 text-white text-xs px-1">
                      {bottle.type === 'label' && "RÓTULO"}
                      {bottle.type === 'dent' && "AMASSADO"}
                      {bottle.type === 'cap' && "TAMPA"}
                    </span>
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
