
import React from 'react';
import { cn } from '@/lib/utils';
import StatusIndicator from './StatusIndicator';
import { Badge } from './ui/badge';

interface InspectionResultsProps {
  className?: string;
  status: 'error' | 'success' | 'warning' | 'idle';
  detectionType?: 'none' | 'label' | 'dent' | 'cap' | 'liquid';
  detectionTypes?: ('none' | 'label' | 'dent' | 'cap' | 'liquid')[];
}

const InspectionResults: React.FC<InspectionResultsProps> = ({ 
  className,
  status,
  detectionType = 'none',
  detectionTypes = []
}) => {
  // If multiple types are provided, use them, otherwise use the single detectionType
  const types = detectionTypes.length > 0 ? detectionTypes : [detectionType];
  
  // Production metrics
  const bottlesPerMinute = 99;
  const bottlesPerHour = bottlesPerMinute * 60;
  
  return (
    <div className={cn("bg-industrial-dark rounded-lg p-4 text-white", className)}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">Resultado da Inspeção</h3>
        <StatusIndicator 
          status={status}
          size="lg"
          blinking={status === 'error'}
        />
      </div>
      
      <div className="flex justify-between items-center mb-3">
        <div className="text-xs">Taxa de Produção</div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-industrial-medium font-mono text-xs">
            {bottlesPerHour} uds/h
          </Badge>
          <Badge variant="outline" className="bg-industrial-medium font-mono text-xs">
            {bottlesPerMinute} uds/min
          </Badge>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center border-b border-industrial-medium pb-2">
          <div className="text-sm">Condição da Garrafa</div>
          <div className="font-mono text-sm">
            {status === 'error' ? (
              <span className="text-status-error">FALHA</span>
            ) : (
              <span className="text-status-success">OK</span>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center border-b border-industrial-medium pb-2">
          <div className="text-sm">Rótulo</div>
          <div className="font-mono text-sm">
            {types.includes('label') ? (
              <span className="text-status-error">TORTO</span>
            ) : (
              <span className="text-status-success">OK</span>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center border-b border-industrial-medium pb-2">
          <div className="text-sm">Estrutura</div>
          <div className="font-mono text-sm">
            {types.includes('dent') ? (
              <span className="text-status-error">AMASSADO</span>
            ) : (
              <span className="text-status-success">OK</span>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center border-b border-industrial-medium pb-2">
          <div className="text-sm">Tampa</div>
          <div className="font-mono text-sm">
            {types.includes('cap') ? (
              <span className="text-status-error">MAL COLOCADA</span>
            ) : (
              <span className="text-status-success">OK</span>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center border-b border-industrial-medium pb-2">
          <div className="text-sm">Nível do Líquido</div>
          <div className="font-mono text-sm">
            {types.includes('liquid') ? (
              <span className="text-status-error">IRREGULAR</span>
            ) : (
              <span className="text-status-success">OK</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-4 bg-industrial-medium rounded p-2">
        <div className="font-mono text-xs text-center">
          {status === 'error' ? (
            <>Ação: <span className="text-status-error">REJEITAR PRODUTO</span></>
          ) : status === 'warning' ? (
            <>Ação: <span className="text-status-warning">REVISÃO MANUAL</span></>
          ) : (
            <>Ação: <span className="text-status-success">APROVADO</span></>
          )}
        </div>
      </div>
    </div>
  );
};

export default InspectionResults;

