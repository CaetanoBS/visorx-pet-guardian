
import React from 'react';
import { cn } from '@/lib/utils';
import StatusIndicator from '../StatusIndicator';
import { AlertTriangle } from 'lucide-react';
import { SystemStatus } from './types';

interface SystemStatusPanelProps {
  status: SystemStatus;
}

const SystemStatusPanel: React.FC<SystemStatusPanelProps> = ({ status }) => {
  const { conveyorSpeed, pressureStatus, systemStatus, separatorActive, lastEjectionTime } = status;

  return (
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
  );
};

export default SystemStatusPanel;
