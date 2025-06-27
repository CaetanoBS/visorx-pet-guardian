
import React from 'react';
import { cn } from '@/lib/utils';
import { PackageX, CheckCircle } from 'lucide-react';
import { Bottle, SystemStatus } from './types';

interface SideViewProps {
  bottles: Bottle[];
  systemStatus: SystemStatus;
}

const SideView: React.FC<SideViewProps> = ({ bottles, systemStatus }) => {
  const { conveyorSpeed, separatorActive, currentEjection } = systemStatus;

  return (
    <div className="flex-1 relative bg-gray-900 rounded-lg aspect-video overflow-hidden">
      <div className="absolute top-0 left-0 px-2 py-1 bg-black/70 text-xs text-white font-mono z-10">
        VISÃO LATERAL
      </div>

      {/* Background textures representing the environment */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="h-full w-full"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '12px 12px'
          }}
        />
      </div>

      {/* Background environment lines */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gray-800 border-t border-gray-700">
        <div className="absolute inset-0 grid grid-cols-12 grid-rows-4">
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className="border-r border-b border-gray-700 opacity-30" />
          ))}
        </div>
      </div>

      {/* Conveyor belt */}
      <div className="absolute bottom-1/3 left-0 right-0 h-6 bg-gray-700">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-600"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800"></div>
        
        <div className="absolute inset-0 opacity-40">
          <div className="h-full w-[200%] bg-repeat-x"
              style={{
                backgroundImage: 'linear-gradient(90deg, transparent 0%, transparent 49%, #222 50%, transparent 51%, transparent 100%)',
                backgroundSize: '24px 100%',
                animation: `conveyor ${20 / (conveyorSpeed / 100)}s linear infinite`,
              }}
          />
        </div>
      </div>

      {/* VisorX exit tunnel */}
      <div className="absolute left-0 bottom-1/3 w-32 h-32 bg-industrial-dark border-r-2 border-industrial-silver flex flex-col items-center justify-center">
        <div className="absolute bottom-0 right-0 w-20 h-10 bg-gray-900"></div>
        <div className="absolute top-4 right-4 px-1 bg-industrial-silver/20 rounded">
          <div className="text-white text-[8px] font-mono">VISORX</div>
        </div>
        
        <div className="absolute top-8 right-4 flex items-center">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-1"></div>
          <div className="text-green-500 text-[6px] font-mono">ATIVO</div>
        </div>
        
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="w-10 h-4 bg-industrial-silver/30 mb-1"></div>
          <div className="w-10 h-4 bg-industrial-silver/30 mb-1"></div>
          <div className="w-10 h-4 bg-industrial-silver/30"></div>
        </div>
      </div>

      {/* Pneumatic separation system */}
      <div className="absolute left-1/3 bottom-[calc(33.3%+6px)] flex flex-col items-center">
        <div className="w-16 h-3 bg-industrial-medium rounded-t-md flex justify-center items-center">
          <div className="text-[6px] text-industrial-dark font-bold">SEPARATOR</div>
        </div>
        
        <div className="relative w-8 h-6 bg-industrial-silver/70 flex justify-center items-center overflow-hidden rounded-sm">
          <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-green-500/70 animate-pulse"></div>
          <div className={cn(
            "absolute bg-industrial-dark/70 h-1 w-3",
            separatorActive ? "animate-ping" : ""
          )}></div>
        </div>
        
        <div className="relative w-4 bg-industrial-silver h-12 rounded-md flex justify-center">
          <div className={cn(
            "absolute top-0 w-8 h-2 bg-industrial-medium transition-all duration-150 transform origin-top",
            separatorActive ? "rotate-90" : "rotate-0"
          )}></div>
          
          <div 
            className={cn(
              "absolute w-14 h-1.5 bg-industrial-dark transition-all duration-150",
              separatorActive ? "rotate-90 top-4" : "rotate-0 top-1"
            )}
            style={{
              transformOrigin: "left center"
            }}
          >
            <div className="absolute top-0 right-0 text-[5px] text-white font-mono">EJCT</div>
          </div>
          
          <div className="absolute -top-3 right-0 w-1 h-3 bg-industrial-dark rounded-t-sm"></div>
        </div>
      </div>

      {/* Quarantine drop channel */}
      <div className="absolute left-1/3 bottom-0 w-20 h-28 flex justify-start items-start">
        <div className="w-16 h-full bg-status-error/10 border-l-2 border-r-2 border-dashed border-status-error">
          <div className="absolute top-1/4 -left-1 w-1 h-1 rounded-full bg-red-500 animate-pulse"></div>
          <div className="absolute top-1/2 -left-1 w-1 h-1 rounded-full bg-red-500 animate-pulse delay-150"></div>
          <div className="absolute top-3/4 -left-1 w-1 h-1 rounded-full bg-red-500 animate-pulse delay-300"></div>
          
          <div className="absolute top-1/4 -right-1 w-1 h-1 rounded-full bg-red-500 animate-pulse"></div>
          <div className="absolute top-1/2 -right-1 w-1 h-1 rounded-full bg-red-500 animate-pulse delay-150"></div>
          <div className="absolute top-3/4 -right-1 w-1 h-1 rounded-full bg-red-500 animate-pulse delay-300"></div>
        </div>
      </div>

      {/* Bottles in side view */}
      {bottles.map((bottle) => {
        let xPos = `${(bottle.position * 12) + 6}%`;
        let yPos = "calc(66.7% - 30px)";
        let rotation = "rotate-0";
        
        if (bottle.ejected) {
          if (bottle.inQuarantine) {
            yPos = "calc(95% - 30px)";
            rotation = "rotate-12";
          } else {
            const fallProgress = (bottle.position - 3) * 1.5;
            yPos = `calc(66.7% - 30px + ${Math.min(fallProgress * 60, 90)}px)`;
            rotation = `rotate(${Math.min(fallProgress * 25, 30)}deg)`;
          }
        }
        
        return (
          <div 
            key={`side-${bottle.id}`} 
            className={cn(
              "absolute transition-all duration-16 ease-linear",
              bottle.id === currentEjection ? "z-30" : "z-20"
            )}
            style={{ 
              left: xPos,
              top: yPos,
              transform: rotation,
              transition: 'all 16ms linear'
            }}
          >
            <div className="w-8 h-28 relative scale-75">
              <div className="absolute bottom-0 w-8 h-24 bg-blue-100/30 rounded-md flex items-center justify-center">
                <div className="absolute top-0 w-4 h-4 bg-blue-100/30 rounded-t-lg"></div>
                <div className="absolute top-1 w-5 h-2 rounded-t-md bg-blue-500"></div>
                
                <div className={cn(
                  "absolute top-1/3 w-8 h-6 bg-white/70",
                  bottle.types.includes('label') && 'bg-yellow-200/70'
                )}></div>
                
                <div 
                  className={cn(
                    "absolute bottom-0 w-8 rounded-b-md",
                    bottle.types.includes('liquid') ? 'bg-red-500/50' : 'bg-blue-500/50'
                  )}
                  style={{ 
                    height: bottle.types.includes('liquid') ? '60%' : '90%'
                  }}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 transform -translate-y-1/2"></div>
                </div>
              </div>
            </div>
            
            {bottle.hasIssue && (
              <div className="absolute inset-0 border-2 border-red-500 animate-pulse-slow" />
            )}
          </div>
        );
      })}

      {/* Visual indicators */}
      <div className="absolute top-4 left-1/3 bg-black/70 px-2 py-1 rounded text-[8px] text-white font-mono flex flex-col items-center">
        <div>SISTEMA PNEUMÁTICO</div>
        <div className={cn(
          "w-2 h-2 rounded-full mt-1",
          separatorActive ? "bg-green-500 animate-pulse" : "bg-gray-500"
        )}></div>
      </div>

      <div className="absolute bottom-4 left-1/3 transform translate-x-6">
        <div className="text-status-error text-[8px] font-mono flex items-center">
          <PackageX className="h-3 w-3 mr-1" />
          ZONA DE QUARENTENA
        </div>
      </div>
      
      <div className="absolute bottom-1/3 right-4 transform translate-y-6">
        <div className="text-status-success text-[8px] font-mono flex items-center">
          <CheckCircle className="h-3 w-3 mr-1" />
          ZONA DE VALIDAÇÃO
        </div>
      </div>
    </div>
  );
};

export default SideView;
