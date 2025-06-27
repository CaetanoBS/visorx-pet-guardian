
import React from 'react';
import StatusIndicator from '../StatusIndicator';
import { ProductionStats } from './types';

interface ProductionCountersProps {
  stats: ProductionStats;
  separatorActive: boolean;
  totalInspected: number;
}

const ProductionCounters: React.FC<ProductionCountersProps> = ({ 
  stats, 
  separatorActive, 
  totalInspected 
}) => {
  const { approvedCount, rejectedCount } = stats;

  return (
    <div className="mt-2 p-2 bg-black/90 rounded-md text-white text-xs grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="flex flex-col items-center">
        <div className="font-mono text-muted-foreground text-[10px] mb-1">Inspecionados</div>
        <div className="font-mono text-lg">{totalInspected}</div>
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
  );
};

export default ProductionCounters;
