
import React from 'react';
import CameraFeed from '@/components/CameraFeed';
import StatisticsPanel from '@/components/StatisticsPanel';
import AIAnalysisReport from '@/components/AIAnalysisReport';
import { useBottleInspection } from '@/contexts/BottleInspectionContext';

const MainContainer = () => {
  const {
    detectionType,
    autoMode,
    setAutoMode,
    inspectedCount,
    rejectedCount,
    labelDefectsCount,
    dentDefectsCount,
    capDefectsCount,
    liquidDefectsCount,
    defectPatterns,
    handleBottleDetection
  } = useBottleInspection();

  return (
    <div className="lg:col-span-8">
      <div className="bg-card p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Monitoramento em Tempo Real</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm">Modo Automático:</span>
            <button 
              onClick={() => setAutoMode(!autoMode)}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                autoMode ? 'bg-green-500 text-white' : 'bg-gray-300'
              }`}
            >
              {autoMode ? 'ATIVADO' : 'DESATIVADO'}
            </button>
          </div>
        </div>
        <div className="relative">
          <CameraFeed 
            className="w-full" 
            simulateDetection={detectionType !== 'none'}
            detectionType={detectionType}
            onDetect={handleBottleDetection}
          />
          <div className="mt-4 font-mono text-xs text-muted-foreground flex justify-between">
            <div>Sistema VisorX monitorando linha de produção PET - Conectado ao sistema central</div>
            <div className="flex gap-4">
              <span>Inspecionados: {inspectedCount}</span>
              <span>Rejeitados: {rejectedCount}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <StatisticsPanel 
          inspectedCount={inspectedCount}
          rejectedCount={rejectedCount}
          labelDefectsCount={labelDefectsCount}
          dentDefectsCount={dentDefectsCount}
          capDefectsCount={capDefectsCount}
          liquidDefectsCount={liquidDefectsCount}
        />
      </div>
      
      <div className="mt-6">
        <AIAnalysisReport 
          defectPatterns={defectPatterns}
          totalBottles={inspectedCount}
        />
      </div>
    </div>
  );
};

export default MainContainer;
