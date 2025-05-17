
import React from 'react';
import StatusIndicator from './StatusIndicator';
import { cn } from '@/lib/utils';

interface DeviceVisualizationProps {
  status: 'error' | 'success' | 'warning' | 'idle';
  className?: string;
}

const DeviceVisualization: React.FC<DeviceVisualizationProps> = ({ status, className }) => {
  return (
    <div className={cn("device-frame", className)}>
      <div className="flex justify-between mb-2">
        <div className="font-mono text-xs text-industrial-silver">VisorX v1.0</div>
        <div className="flex space-x-2">
          <StatusIndicator status="success" label="POWER" />
          <StatusIndicator status={status} label="STATUS" blinking={status === 'error'} />
        </div>
      </div>
      
      <div className="device-screen aspect-video mb-2">
        <div className="absolute inset-0 grid-pattern"></div>
        <div className="absolute top-2 left-2">
          <div className="terminal-text">VisorX {`>`} Sistema Iniciado</div>
          <div className="terminal-text">VisorX {`>`} Câmera: OK</div>
          <div className="terminal-text">VisorX {`>`} Modo de Inspeção: ATIVO</div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <div className="flex gap-2">
          <button className="device-button w-8 h-8">R</button>
          <button className="device-button w-8 h-8">M</button>
        </div>
        <div className="bg-industrial-medium rounded px-2 py-1">
          <div className="text-xs text-white font-mono">IP65</div>
        </div>
      </div>
      
      <div className="absolute -right-3 top-1/4 h-24 w-6 bg-industrial-dark border border-industrial-medium rounded-r flex flex-col items-center justify-center gap-2">
        <div className="device-led bg-status-success"></div>
        <div className="device-led bg-status-warning"></div>
        <div className="device-led bg-status-error"></div>
      </div>
      
      <div className="absolute -left-2 top-1/3 h-16 w-4 bg-black rounded-l"></div>
    </div>
  );
};

export default DeviceVisualization;
