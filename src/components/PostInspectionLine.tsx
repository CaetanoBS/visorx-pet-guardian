
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

  // Controle do separador pneumático
  const [separatorActive, setSeparatorActive] = useState(false);
  const [currentEjection, setCurrentEjection] = useState<number | null>(null);

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
        const updatedBottles = prev.map(bottle => {
          // Verifique se há garrafas com problemas que estão na zona de ejeção
          if (bottle.hasIssue && bottle.position >= 3 && bottle.position < 3.1 && !bottle.ejected) {
            // Ative o separador pneumático
            setSeparatorActive(true);
            setCurrentEjection(bottle.id);
            
            return {
              ...bottle,
              position: bottle.position + 0.05,
              ejected: true
            };
          }
          
          // Garrafas ejetadas vão para a quarentena (para baixo)
          if (bottle.ejected && !bottle.inQuarantine) {
            // Quando a garrafa alcança a área de quarentena, marque como em quarentena
            if (bottle.position >= 3.5) {
              // Desative o separador pneumático quando a garrafa estiver totalmente na quarentena
              setSeparatorActive(false);
              setCurrentEjection(null);
              
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
          
          // Garrafas normais continuam se movendo para a direita
          if (!bottle.ejected) {
            return {
              ...bottle,
              position: bottle.position + 0.05
            };
          }
          
          return bottle;
        }).filter(bottle => {
          // Remova garrafas que alcançaram o fim ou estão na quarentena por muito tempo
          return (bottle.position < 7 && !bottle.inQuarantine) || 
                 (bottle.inQuarantine && bottle.position < 5);
        });

        // Se não houver garrafas sendo ejetadas, certifique-se de que o separador está inativo
        if (!updatedBottles.some(b => b.hasIssue && b.position >= 3 && b.position < 3.5 && !b.inQuarantine)) {
          setSeparatorActive(false);
          setCurrentEjection(null);
        }

        return updatedBottles;
      });
    }, 16); // ~60fps para animação suave
    
    return () => clearInterval(animationInterval);
  }, []);

  return (
    <div className={cn("bg-card p-4 rounded-lg shadow relative", className)}>
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span>Linha de Produção Pós-Inspeção</span>
        <ArrowRight className="h-4 w-4" />
        <span className="text-sm font-normal text-muted-foreground">Automação em tempo real</span>
      </h3>
      
      <div className="flex gap-4">
        {/* Visão superior */}
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
                transition: 'all 16ms linear'  // Para animação mais suave
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

        {/* NOVA VISÃO LATERAL */}
        <div className="flex-1 relative bg-gray-900 rounded-lg aspect-video overflow-hidden">
          <div className="absolute top-0 left-0 px-2 py-1 bg-black/70 text-xs text-white font-mono z-10">
            VISÃO LATERAL
          </div>

          {/* Linhas de fundo representando o ambiente */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gray-800 border-t border-gray-700">
            {/* Grid de fundo */}
            <div className="absolute inset-0 grid grid-cols-12 grid-rows-4">
              {Array.from({ length: 48 }).map((_, i) => (
                <div key={i} className="border-r border-b border-gray-700 opacity-30" />
              ))}
            </div>
          </div>

          {/* Esteira transportadora */}
          <div className="absolute bottom-1/3 left-0 right-0 h-6 bg-gray-700">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-600"></div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800"></div>
          </div>

          {/* Túnel de saída do VisorX */}
          <div className="absolute left-0 bottom-1/3 w-32 h-32 bg-industrial-dark border-r-2 border-industrial-silver">
            <div className="absolute bottom-0 right-0 w-20 h-10 bg-gray-900"></div>
            <div className="absolute top-1/3 right-1/4 text-white text-[8px] font-mono">VISORX</div>
          </div>

          {/* Sistema pneumático de separação */}
          <div className="absolute left-1/3 bottom-1/3 flex flex-col items-center">
            {/* Base do mecanismo */}
            <div className="w-16 h-6 bg-industrial-medium rounded-t-md"></div>
            
            {/* Cilindro pneumático */}
            <div className="relative w-4 bg-industrial-silver h-12 rounded-md flex justify-center">
              {/* Pistão */}
              <div className={cn(
                "absolute top-0 w-8 h-2 bg-industrial-medium transition-all duration-150 transform origin-top",
                separatorActive ? "rotate-90" : "rotate-0"
              )}></div>
              
              {/* Lingueta móvel */}
              <div 
                className={cn(
                  "absolute w-14 h-1.5 bg-industrial-dark transition-all duration-150",
                  separatorActive ? "rotate-90 top-4" : "rotate-0 top-1"
                )}
                style={{
                  transformOrigin: "left center"
                }}
              ></div>
            </div>
          </div>

          {/* Canal de descida para quarentena */}
          <div className="absolute left-1/3 bottom-0 w-20 h-28 flex justify-start items-start">
            <div className="w-16 h-full bg-status-error/10 border-l-2 border-r-2 border-dashed border-status-error"></div>
          </div>

          {/* Garrafas na visão lateral */}
          {bottles.map((bottle) => {
            // Posição na visão lateral
            let xPos = `${(bottle.position * 12) + 6}%`;
            let yPos = "calc(66.7% - 30px)"; // Padrão em cima da esteira
            
            if (bottle.ejected) {
              if (bottle.inQuarantine) {
                // Garrafa na área de quarentena
                yPos = "calc(95% - 30px)";
              } else {
                // Garrafa caindo para a quarentena
                const fallProgress = (bottle.position - 3) * 1.5;
                yPos = `calc(66.7% - 30px + ${Math.min(fallProgress * 60, 90)}px)`;
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
                  transition: 'all 16ms linear'
                }}
              >
                {/* Garrafa na visão lateral */}
                <div className="w-8 h-28 relative scale-75">
                  <div className="absolute bottom-0 w-8 h-24 bg-blue-100/30 rounded-md flex items-center justify-center">
                    <div className="absolute top-0 w-4 h-4 bg-blue-100/30 rounded-t-lg"></div>
                    <div className="absolute top-1 w-5 h-2 rounded-t-md bg-blue-500"></div>
                    
                    {/* Rótulo do lado */}
                    <div className={cn(
                      "absolute top-1/3 w-8 h-6 bg-white/70",
                      bottle.types.includes('label') && 'bg-yellow-200/70'
                    )}></div>
                    
                    {/* Nível do líquido */}
                    <div 
                      className={cn(
                        "absolute bottom-0 w-8 rounded-b-md",
                        bottle.types.includes('liquid') ? 'bg-red-500/50' : 'bg-blue-500/50'
                      )}
                      style={{ 
                        height: bottle.types.includes('liquid') ? '60%' : '90%'
                      }}
                    ></div>
                  </div>
                </div>
                
                {/* Indicador de detecção */}
                {bottle.hasIssue && (
                  <div className="absolute inset-0 border-2 border-red-500 animate-pulse-slow" />
                )}
              </div>
            );
          })}

          {/* Indicadores visuais */}
          <div className="absolute top-4 left-1/3 bg-black/70 px-2 py-1 rounded text-[8px] text-white font-mono flex flex-col items-center">
            <div>SISTEMA PNEUMÁTICO</div>
            <div className={cn(
              "w-2 h-2 rounded-full mt-1",
              separatorActive ? "bg-green-500" : "bg-gray-500"
            )}></div>
          </div>

          {/* Indicador de zona de quarentena */}
          <div className="absolute bottom-4 left-1/3 transform translate-x-6">
            <div className="text-status-error text-[8px] font-mono flex items-center">
              <PackageX className="h-3 w-3 mr-1" />
              ZONA DE QUARENTENA
            </div>
          </div>
        </div>
      </div>

      {/* Overlay elements - camera metrics */}
      <div className="mt-2 p-2 bg-black/90 rounded-md text-white text-xs flex justify-between">
        <div className="font-mono">Aprovados: {bottles.filter(b => !b.hasIssue).length}</div>
        <div className="font-mono">Rejeitados: {bottles.filter(b => b.hasIssue).length}</div>
        <div className="font-mono">Sistema pneumático: {separatorActive ? "ATIVO" : "INATIVO"}</div>
      </div>
    </div>
  );
};

export default PostInspectionLine;
