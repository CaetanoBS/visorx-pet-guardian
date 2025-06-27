
import React from 'react';
import { cn } from '@/lib/utils';
import { PackageX, ShieldCheck, MoveHorizontal } from 'lucide-react';
import { Bottle, SystemStatus } from './types';

interface TopViewProps {
  bottles: Bottle[];
  systemStatus: SystemStatus;
}

const TopView: React.FC<TopViewProps> = ({ bottles, systemStatus }) => {
  const { conveyorSpeed } = systemStatus;

  return (
    <div className="flex-1 relative bg-gray-900 rounded-lg aspect-video overflow-hidden">
      <div className="absolute top-0 left-0 px-2 py-1 bg-black/70 text-xs text-white font-mono z-10">
        VISÃO SUPERIOR
      </div>
      
      {/* Main conveyor belt */}
      <div className="absolute top-1/2 left-0 right-0 h-8 bg-gray-800 border-t border-b border-gray-700 transform -translate-y-1/2">
        <div className="grid grid-cols-24 h-full">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="border-r border-gray-700 h-full" />
          ))}
        </div>
        
        {/* Animated texture for movement */}
        <div className="absolute inset-0 opacity-30">
          <div className="h-full w-[200%] bg-repeat-x animate-conveyor"
              style={{
                backgroundImage: 'linear-gradient(90deg, transparent 0%, transparent 49%, #444 50%, transparent 51%, transparent 100%)',
                backgroundSize: '24px 100%',
                animation: `conveyor ${20 / (conveyorSpeed / 100)}s linear infinite`,
              }}
          />
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
          key={`top-${bottle.id}`} 
          className={cn(
            "absolute transition-all duration-16 ease-linear",
            bottle.ejected ? "transform translate-y-px" : "top-1/2 transform -translate-y-1/2"
          )}
          style={{ 
            left: `${(bottle.position * 12) + 6}%`,
            top: bottle.ejected ? `calc(50% + ${(bottle.position - 3) * 100}px)` : '50%',
            transition: 'all 16ms linear'
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
    </div>
  );
};

export default TopView;
