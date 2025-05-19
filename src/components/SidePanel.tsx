
import React from 'react';
import DeviceVisualization from '@/components/DeviceVisualization';
import InspectionResults from '@/components/InspectionResults';
import { useBottleInspection } from '@/contexts/BottleInspectionContext';

const SidePanel = () => {
  const { status, detectionTypes } = useBottleInspection();

  return (
    <div className="lg:col-span-4 space-y-6">
      <DeviceVisualization status={status} />
      <InspectionResults 
        status={status}
        detectionTypes={detectionTypes}
      />
      <ProductionMetrics />
    </div>
  );
};

// New component for showing production metrics
const ProductionMetrics = () => {
  return (
    <div className="bg-card p-4 rounded-lg shadow">
      <h3 className="text-lg font-bold mb-3">Métricas de Produção</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-industrial-dark text-white p-3 rounded-md">
          <div className="text-xs text-industrial-silver">Produção Por Hora</div>
          <div className="text-2xl font-bold">5.928</div>
          <div className="text-xs text-blue-300 mt-1">Velocidade Padrão</div>
        </div>
        <div className="bg-industrial-dark text-white p-3 rounded-md">
          <div className="text-xs text-industrial-silver">Produção Por Minuto</div>
          <div className="text-2xl font-bold">98,8</div>
          <div className="text-xs text-blue-300 mt-1">1,65 por segundo</div>
        </div>
      </div>
      <div className="mt-3 bg-slate-100 p-2 rounded-md text-xs">
        <div className="flex justify-between items-center mb-1">
          <span className="font-medium">Velocidade da linha:</span>
          <span className="text-status-success font-medium">100%</span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div className="bg-blue-500 h-full" style={{ width: '100%' }}></div>
        </div>
        <div className="text-slate-500 mt-1">Executando com velocidade normal</div>
      </div>
    </div>
  );
};

export default SidePanel;
