
import React from 'react';
import { cn } from '@/lib/utils';
import StatusIndicator from './StatusIndicator';

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
  
  // Calculate badge count for multiple defects
  const defectCount = types.filter(t => t !== 'none').length;
  
  return (
    <div className={cn("bg-industrial-dark rounded-lg p-4 text-white", className)}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold flex items-center">
          Resultado da Inspeção
          {defectCount > 0 && (
            <span className="ml-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {defectCount}
            </span>
          )}
        </h3>
        <StatusIndicator 
          status={status}
          size="lg"
          blinking={status === 'error'}
        />
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
          <div className="font-mono text-sm flex items-center">
            {types.includes('liquid') ? (
              <>
                <span className="text-status-error mr-1">IRREGULAR</span>
                <span className="text-xs text-status-error">{Math.round(40 + Math.random() * 20)}%</span>
              </>
            ) : (
              <>
                <span className="text-status-success mr-1">OK</span>
                <span className="text-xs text-status-success">{Math.round(85 + Math.random() * 15)}%</span>
              </>
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
