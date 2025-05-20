
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { PackageX, ShieldCheck, MoveHorizontal, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import StatusIndicator from './StatusIndicator';

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
  
  // Machine status indicators
  const [conveyorSpeed, setConveyorSpeed] = useState(100); // % of full speed
  const [pressureStatus, setPressureStatus] = useState(95); // % of nominal pressure
  const [systemStatus, setSystemStatus] = useState<'normal' | 'warning' | 'error'>('normal');
  const [lastEjectionTime, setLastEjectionTime] = useState<string>('-');
  
  // Estatísticas em tempo real
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);

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
        let updatedSystemStatus = 'normal';
        const currentTime = new Date();
        
        const updatedBottles = prev.map(bottle => {
          // Verifique se há garrafas com problemas que estão na zona de ejeção
          if (bottle.hasIssue && bottle.position >= 3 && bottle.position < 3.1 && !bottle.ejected) {
            // Ative o separador pneumático
            setSeparatorActive(true);
            setCurrentEjection(bottle.id);
            setLastEjectionTime(
              `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}:${currentTime.getSeconds().toString().padStart(2, '0')}`
            );
            
            // Simular queda temporária de pressão ao ativar o separador
            setPressureStatus(prev => Math.max(70, prev - Math.floor(Math.random() * 15)));
            
            // Simular desaceleração da esteira ao ejetar
            setConveyorSpeed(prev => Math.max(85, prev - Math.floor(Math.random() * 8)));
            
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
              setRejectedCount(prev => prev + 1);
              
              // Restaurar gradualmente a pressão e velocidade da esteira
              setPressureStatus(prev => Math.min(98, prev + Math.floor(Math.random() * 5)));
              setConveyorSpeed(prev => Math.min(100, prev + Math.floor(Math.random() * 5)));
              
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
            // Quando garrafas boas alcançam o final da linha, conte-as como aprovadas
            if (bottle.position >= 6.8 && !bottle.hasIssue) {
              setApprovedCount(prev => prev + 1);
            }
            
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
        
        // Simular oscilações aleatórias da linha
        if (Math.random() > 0.97) {
          setPressureStatus(prev => Math.min(98, Math.max(75, prev + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3))));
        }
        
        if (Math.random() > 0.98) {
          setConveyorSpeed(prev => Math.min(100, Math.max(90, prev + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2))));
        }
        
        // Determinar status do sistema baseado nas condições atuais
        if (pressureStatus < 80 || conveyorSpeed < 85) {
          updatedSystemStatus = 'warning';
        }
        if (pressureStatus < 70 || conveyorSpeed < 75) {
          updatedSystemStatus = 'error';
        }
        
        setSystemStatus(updatedSystemStatus as 'normal' | 'warning' | 'error');

        return updatedBottles;
      });
    }, 16); // ~60fps para animação suave
    
    return () => clearInterval(animationInterval);
  }, []);

  return (
    <div className={cn("bg-card p-4 rounded-lg shadow relative", className)}>
      <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
        <span>Linha de Produção Pós-Inspeção</span>
        <ArrowRight className="h-4 w-4" />
        <span className="text-sm font-normal text-muted-foreground">Automação em tempo real</span>
      </h3>
      
      {/* Painel de status do sistema */}
      <div className="grid grid-cols-4 gap-2 mb-4 text-xs font-mono">
        <div className="bg-gray-900/30 p-2 rounded flex flex-col items-center">
          <div className="text-muted-foreground mb-1">Velocidade Esteira</div>
          <div className="flex items-center gap-2">
            <div className="w-16 bg-gray-700 rounded-full h-1.5">
              <div 
                className={cn(
                  "h-1.5 rounded-full",
                  conveyorSpeed > 90 ? "bg-status-success" :
                  conveyorSpeed > 80 ? "bg-status-warning" : "bg-status-error"
                )}
                style={{width: `${conveyorSpeed}%`}}
              ></div>
            </div>
            <span>{conveyorSpeed}%</span>
          </div>
        </div>
        <div className="bg-gray-900/30 p-2 rounded flex flex-col items-center">
          <div className="text-muted-foreground mb-1">Pressão Sistema</div>
          <div className="flex items-center gap-2">
            <div className="w-16 bg-gray-700 rounded-full h-1.5">
              <div 
                className={cn(
                  "h-1.5 rounded-full",
                  pressureStatus > 90 ? "bg-status-success" :
                  pressureStatus > 80 ? "bg-status-warning" : "bg-status-error"
                )}
                style={{width: `${pressureStatus}%`}}
              ></div>
            </div>
            <span>{pressureStatus}%</span>
          </div>
        </div>
        <div className="bg-gray-900/30 p-2 rounded flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="text-muted-foreground mb-1">Estado do Sistema</div>
            <StatusIndicator 
              status={
                systemStatus === 'normal' ? 'success' :
                systemStatus === 'warning' ? 'warning' : 'error'
              }
              size="md"
              blinking={systemStatus !== 'normal'}
              label={
                systemStatus === 'normal' ? 'Normal' :
                systemStatus === 'warning' ? 'Atenção' : 'Crítico'
              }
            />
          </div>
        </div>
        <div className="bg-gray-900/30 p-2 rounded flex flex-col justify-center items-center">
          <div className="text-muted-foreground mb-1">Última Separação</div>
          <div className="flex items-center gap-1">
            <AlertTriangle className={cn(
              "h-3.5 w-3.5",
              separatorActive ? "text-status-warning animate-pulse" : "text-muted-foreground"
            )} />
            <span>{lastEjectionTime}</span>
          </div>
        </div>
      </div>
      
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

        {/* VISÃO LATERAL */}
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
            
            {/* Animated texture for conveyor movement */}
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

          {/* Túnel de saída do VisorX */}
          <div className="absolute left-0 bottom-1/3 w-32 h-32 bg-industrial-dark border-r-2 border-industrial-silver flex flex-col items-center justify-center">
            <div className="absolute bottom-0 right-0 w-20 h-10 bg-gray-900"></div>
            <div className="absolute top-4 right-4 px-1 bg-industrial-silver/20 rounded">
              <div className="text-white text-[8px] font-mono">VISORX</div>
            </div>
            
            {/* VisorX operational light */}
            <div className="absolute top-8 right-4 flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-1"></div>
              <div className="text-green-500 text-[6px] font-mono">ATIVO</div>
            </div>
            
            {/* Internal sensors visualization */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <div className="w-10 h-4 bg-industrial-silver/30 mb-1"></div>
              <div className="w-10 h-4 bg-industrial-silver/30 mb-1"></div>
              <div className="w-10 h-4 bg-industrial-silver/30"></div>
            </div>
          </div>

          {/* Sistema pneumático de separação */}
          <div className="absolute left-1/3 bottom-[calc(33.3%+6px)] flex flex-col items-center">
            {/* Base do mecanismo */}
            <div className="w-16 h-3 bg-industrial-medium rounded-t-md flex justify-center items-center">
              <div className="text-[6px] text-industrial-dark font-bold">SEPARATOR</div>
            </div>
            
            {/* Housing da máquina */}
            <div className="relative w-8 h-6 bg-industrial-silver/70 flex justify-center items-center overflow-hidden rounded-sm">
              {/* Indicador interno de pressão */}
              <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-green-500/70 animate-pulse"></div>
              
              {/* Mecanismo interno animado */}
              <div className={cn(
                "absolute bg-industrial-dark/70 h-1 w-3",
                separatorActive ? "animate-ping" : ""
              )}></div>
            </div>
            
            {/* Cilindro pneumático */}
            <div className="relative w-4 bg-industrial-silver h-12 rounded-md flex justify-center">
              {/* Pistão */}
              <div className={cn(
                "absolute top-0 w-8 h-2 bg-industrial-medium transition-all duration-150 transform origin-top",
                separatorActive ? "rotate-90" : "rotate-0"
              )}></div>
              
              {/* Lingueta móvel com texto */}
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
              
              {/* Conexão pneumática */}
              <div className="absolute -top-3 right-0 w-1 h-3 bg-industrial-dark rounded-t-sm"></div>
            </div>
          </div>

          {/* Canal de descida para quarentena */}
          <div className="absolute left-1/3 bottom-0 w-20 h-28 flex justify-start items-start">
            <div className="w-16 h-full bg-status-error/10 border-l-2 border-r-2 border-dashed border-status-error">
              {/* Luzes de alerta no canal */}
              <div className="absolute top-1/4 -left-1 w-1 h-1 rounded-full bg-red-500 animate-pulse"></div>
              <div className="absolute top-1/2 -left-1 w-1 h-1 rounded-full bg-red-500 animate-pulse delay-150"></div>
              <div className="absolute top-3/4 -left-1 w-1 h-1 rounded-full bg-red-500 animate-pulse delay-300"></div>
              
              <div className="absolute top-1/4 -right-1 w-1 h-1 rounded-full bg-red-500 animate-pulse"></div>
              <div className="absolute top-1/2 -right-1 w-1 h-1 rounded-full bg-red-500 animate-pulse delay-150"></div>
              <div className="absolute top-3/4 -right-1 w-1 h-1 rounded-full bg-red-500 animate-pulse delay-300"></div>
            </div>
          </div>

          {/* Garrafas na visão lateral */}
          {bottles.map((bottle) => {
            // Posição na visão lateral
            let xPos = `${(bottle.position * 12) + 6}%`;
            let yPos = "calc(66.7% - 30px)"; // Padrão em cima da esteira
            let rotation = "rotate-0";
            
            if (bottle.ejected) {
              if (bottle.inQuarantine) {
                // Garrafa na área de quarentena
                yPos = "calc(95% - 30px)";
                rotation = "rotate-12"; // Garrafa levemente inclinada na quarentena
              } else {
                // Garrafa caindo para a quarentena (trajetória em arco)
                const fallProgress = (bottle.position - 3) * 1.5;
                yPos = `calc(66.7% - 30px + ${Math.min(fallProgress * 60, 90)}px)`;
                
                // Rotação da garrafa ao cair
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
                    >
                      {/* Efeito de onda no líquido */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 transform -translate-y-1/2"></div>
                    </div>
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
              separatorActive ? "bg-green-500 animate-pulse" : "bg-gray-500"
            )}></div>
          </div>

          {/* Indicador de zona de quarentena */}
          <div className="absolute bottom-4 left-1/3 transform translate-x-6">
            <div className="text-status-error text-[8px] font-mono flex items-center">
              <PackageX className="h-3 w-3 mr-1" />
              ZONA DE QUARENTENA
            </div>
          </div>
          
          {/* Indicadores de aprovação e informativo */}
          <div className="absolute bottom-1/3 right-4 transform translate-y-6">
            <div className="text-status-success text-[8px] font-mono flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              ZONA DE VALIDAÇÃO
            </div>
          </div>
        </div>
      </div>

      {/* Indicadores de produção em tempo real */}
      <div className="mt-2 p-2 bg-black/90 rounded-md text-white text-xs grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex flex-col items-center">
          <div className="font-mono text-muted-foreground text-[10px] mb-1">Inspecionados</div>
          <div className="font-mono text-lg">{approvedCount + rejectedCount}</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="font-mono text-muted-foreground text-[10px] mb-1">Aprovados</div>
          <div className="font-mono text-lg text-status-success">{approvedCount}</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="font-mono text-muted-foreground text-[10px] mb-1">Rejeitados</div>
          <div className="font-mono text-lg text-status-error">{rejectedCount}</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="font-mono text-muted-foreground text-[10px] mb-1">Sistema</div>
          <div className="font-mono">
            <StatusIndicator 
              status={separatorActive ? 'warning' : 'success'} 
              label={separatorActive ? "SEPARANDO" : "PRONTO"} 
              blinking={separatorActive}
            />
          </div>
        </div>
      </div>
      
      {/* Botões de controle para simulação */}
      <div className="mt-2 flex justify-end gap-2">
        <button 
          className="text-xs bg-industrial-dark text-white px-3 py-1 rounded hover:bg-industrial-medium"
          onClick={() => {
            setConveyorSpeed(Math.max(70, conveyorSpeed - 5));
          }}
        >
          Reduzir Velocidade
        </button>
        <button 
          className="text-xs bg-industrial-dark text-white px-3 py-1 rounded hover:bg-industrial-medium"
          onClick={() => {
            setConveyorSpeed(Math.min(100, conveyorSpeed + 5));
          }}
        >
          Aumentar Velocidade
        </button>
      </div>
    </div>
  );
};

export default PostInspectionLine;
