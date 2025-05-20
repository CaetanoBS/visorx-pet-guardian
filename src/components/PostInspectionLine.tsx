
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { PackageX, ShieldCheck, MoveHorizontal, ArrowRight } from 'lucide-react';

interface PostInspectionLineProps {
  className?: string;
  bottlesPerMinute: number;
  recentDetections: {
    id: number;
    hasIssue: boolean;
    types: ('none' | 'label' | 'dent' | 'cap' | 'liquid')[];
  }[];
}

const PostInspectionLine: React.FC<PostInspectionLineProps> = ({ 
  className,
  bottlesPerMinute = 99,
  recentDetections = []
}) => {
  const [bottles, setBottles] = useState<{
    id: number;
    position: number;
    hasIssue: boolean;
    types: ('none' | 'label' | 'dent' | 'cap' | 'liquid')[];
    inQuarantine: boolean;
    ejected: boolean;
  }[]>([]);

  // Process detected bottles moving through post-inspection
  useEffect(() => {
    // Add recently detected bottles to the beginning of the line
    if (recentDetections.length > 0) {
      setBottles(prev => {
        const newBottles = [...prev];
        
        // Add new bottles at start of conveyor
        recentDetections.forEach(bottle => {
          // Only add bottles that aren't already in the system
          if (!newBottles.some(b => b.id === bottle.id)) {
            newBottles.push({
              id: bottle.id,
              position: 0,
              hasIssue: bottle.hasIssue,
              types: bottle.types,
              inQuarantine: false,
              ejected: false
            });
          }
        });
        
        return newBottles;
      });
    }
  }, [recentDetections]);

  // Move bottles along the line and handle ejection
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setBottles(prev => {
        return prev.map(bottle => {
          // Bottles with issues get ejected at the separation point
          if (bottle.hasIssue && bottle.position >= 3 && bottle.position < 3.1 && !bottle.ejected) {
            return {
              ...bottle,
              position: bottle.position + 0.05,
              ejected: true
            };
          }
          
          // Ejected bottles move to quarantine (downward)
          if (bottle.ejected && !bottle.inQuarantine) {
            // When bottle reaches quarantine area, mark it as in quarantine
            if (bottle.position >= 3.5) {
              return {
                ...bottle,
                inQuarantine: true
              };
            }
            return {
              ...bottle,
              position: bottle.position + 0.05
            };
          }
          
          // Normal bottles continue moving right
          if (!bottle.ejected) {
            return {
              ...bottle,
              position: bottle.position + 0.05
            };
          }
          
          return bottle;
        }).filter(bottle => {
          // Remove bottles that have reached the end or are in quarantine for too long
          return (bottle.position < 7 && !bottle.inQuarantine) || 
                 (bottle.inQuarantine && bottle.position < 5);
        });
      });
    }, 16); // ~60fps for smooth animation
    
    return () => clearInterval(animationInterval);
  }, []);

  return (
    <div className={cn("bg-card p-4 rounded-lg shadow relative", className)}>
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span>Linha de Produção Pós-Inspeção</span>
        <ArrowRight className="h-4 w-4" />
        <span className="text-sm font-normal text-muted-foreground">Automação em tempo real</span>
      </h3>
      
      <div className="relative bg-gray-900 rounded-lg w-full aspect-video overflow-hidden">
        {/* Main conveyor belt */}
        <div className="absolute top-1/2 left-0 right-0 h-8 bg-gray-800 border-t border-b border-gray-700 transform -translate-y-1/2">
          <div className="grid grid-cols-24 h-full">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="border-r border-gray-700 h-full" />
            ))}
          </div>
        </div>
        
        {/* VisorX exit indicator */}
        <div className="absolute top-1/2 left-0 h-20 w-12 bg-industrial-dark transform -translate-y-1/2 border-r-2 border-industrial-silver flex items-center justify-center">
          <div className="text-white text-[8px] font-mono rotate-90">SAÍDA VISORX</div>
        </div>
        
        {/* Ejection mechanism - pneumatic/mechanical separator */}
        <div className="absolute top-1/2 left-1/3 transform -translate-y-1/2">
          <div className="h-8 w-2 bg-industrial-medium"></div>
          <div className="absolute top-8 left-0 w-2 h-20 bg-industrial-medium"></div>
        </div>
        
        {/* Quarantine zone */}
        <div className="absolute bottom-4 left-1/3 right-0 h-20 w-1/4 mx-auto">
          <div className="h-full border-2 border-dashed border-status-error p-1 rounded bg-status-error/10 flex flex-col items-center">
            <PackageX className="h-4 w-4 text-status-error" />
            <div className="text-status-error text-[8px] font-mono">ZONA DE QUARENTENA</div>
          </div>
        </div>
        
        {/* Approval zone */}
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 h-12 w-12 flex flex-col items-center">
          <ShieldCheck className="h-6 w-6 text-status-success" />
          <div className="text-status-success text-[8px] font-mono">APROVADOS</div>
        </div>
        
        {/* Separator mechanism label */}
        <div className="absolute top-12 left-1/3 transform -translate-x-1/2">
          <MoveHorizontal className="h-4 w-4 text-industrial-silver" />
          <div className="text-industrial-silver text-[8px] font-mono">SEPARADOR</div>
        </div>
        
        {/* Bottles on the conveyor */}
        {bottles.map((bottle) => (
          <div 
            key={bottle.id} 
            className={cn(
              "absolute transition-all duration-16 ease-linear",
              bottle.ejected ? "transform translate-y-px" : "top-1/2 transform -translate-y-1/2"
            )}
            style={{ 
              left: `${(bottle.position * 12) + 6}%`,
              top: bottle.ejected ? `calc(50% + ${(bottle.position - 3) * 100}px)` : '50%',
              transition: 'all 16ms linear'  // For smoother animation
            }}
          >
            <div className="w-8 h-20 relative scale-75">
              {/* Bottle body */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-18 bg-blue-100/30 rounded-md">
                {/* Bottle cap */}
                <div className={cn(
                  "absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-2 rounded-t-md",
                  bottle.types.includes('cap') ? 'bg-red-500' : 'bg-blue-500'
                )}></div>
                
                {/* Bottle neck */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-2 bg-blue-100/30"></div>
                
                {/* Label */}
                <div className={cn(
                  "absolute top-1/3 left-0 w-full h-6 bg-white/70",
                  bottle.types.includes('label') && 'transform -rotate-12 bg-yellow-200/70'
                )}></div>
                
                {/* Subtle bottle texture */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 rounded-md"></div>
                
                {/* Dent */}
                {bottle.types.includes('dent') && (
                  <div className="absolute top-1/2 right-0 w-2 h-4 bg-gray-900 rounded-full"></div>
                )}
                
                {/* Liquid fill level */}
                <div 
                  className={cn(
                    "absolute bottom-0 left-0 w-full transition-all duration-300",
                    bottle.types.includes('liquid') ? 'bg-red-500/50' : 'bg-blue-500/50'
                  )}
                  style={{ 
                    height: bottle.types.includes('liquid') ? '60%' : '90%',
                    borderBottomLeftRadius: '0.375rem',
                    borderBottomRightRadius: '0.375rem'
                  }}
                >
                  {/* Liquid shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20"></div>
                </div>
              </div>
              
              {/* Detection highlight */}
              {bottle.hasIssue && (
                <div className="absolute inset-0 border-2 border-red-500 animate-pulse-slow z-10" />
              )}
            </div>
          </div>
        ))}

        {/* Overlay elements - camera metrics */}
        <div className="absolute bottom-0 left-0 w-full p-2 flex justify-between bg-black/70 text-white text-xs z-10">
          <div className="font-mono">Aprovados: {bottles.filter(b => !b.hasIssue).length}</div>
          <div className="font-mono">Rejeitados: {bottles.filter(b => b.hasIssue).length}</div>
        </div>
      </div>
    </div>
  );
};

export default PostInspectionLine;
