
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import DeviceVisualization from '@/components/DeviceVisualization';
import CameraFeed from '@/components/CameraFeed';
import ControlPanel from '@/components/ControlPanel';
import InspectionResults from '@/components/InspectionResults';
import StatisticsPanel from '@/components/StatisticsPanel';
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const [status, setStatus] = useState<'error' | 'success' | 'warning' | 'idle'>('success');
  const [detectionType, setDetectionType] = useState<'none' | 'label' | 'dent' | 'cap'>('none');
  const [autoMode, setAutoMode] = useState(false);
  const [inspectedCount, setInspectedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [labelDefectsCount, setLabelDefectsCount] = useState(0);
  const [dentDefectsCount, setDentDefectsCount] = useState(0);
  const [capDefectsCount, setCapDefectsCount] = useState(0);
  
  const handleStatusChange = (newStatus: 'error' | 'success' | 'warning' | 'idle') => {
    setStatus(newStatus);
  };
  
  const handleDetectionChange = (type: 'none' | 'label' | 'dent' | 'cap') => {
    setDetectionType(type);
    
    // Auto-set status based on detection type
    if (type === 'none') {
      setStatus('success');
      // Only count if we're changing from an error state
      if (status === 'error') {
        setInspectedCount(prev => prev + 1);
      }
    } else {
      setStatus('error');
      setInspectedCount(prev => prev + 1);
      setRejectedCount(prev => prev + 1);
      
      // Update defect counters based on type
      if (type === 'label') {
        setLabelDefectsCount(prev => prev + 1);
      } else if (type === 'dent') {
        setDentDefectsCount(prev => prev + 1);
      } else if (type === 'cap') {
        setCapDefectsCount(prev => prev + 1);
      }
      
      // Show toast notification for rejected product
      toast({
        title: "Produto Rejeitado",
        description: `Defeito detectado: ${
          type === 'label' ? 'Rótulo torto' : 
          type === 'dent' ? 'Garrafa amassada' : 
          'Tampa mal colocada'
        }`,
        variant: "destructive"
      });
    }
  };
  
  // Effect for automatic random defect simulation when auto mode is enabled
  useEffect(() => {
    if (!autoMode) return;
    
    const types: Array<'none' | 'label' | 'dent' | 'cap'> = ['none', 'label', 'dent', 'cap'];
    
    const interval = setInterval(() => {
      // 75% chance for no defect, 25% chance for a random defect
      const randomIndex = Math.random() > 0.75 ? Math.floor(Math.random() * 3) + 1 : 0;
      handleDetectionChange(types[randomIndex]);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [autoMode]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
              />
            </div>
          </div>
          
          <div className="lg:col-span-4 space-y-6">
            <DeviceVisualization status={status} />
            <InspectionResults 
              status={status}
              detectionType={detectionType}
            />
          </div>
          
          <div className="lg:col-span-12">
            <ControlPanel 
              onStatusChange={handleStatusChange}
              onDetectionChange={handleDetectionChange}
              currentStatus={status}
              currentDetection={detectionType}
            />
          </div>
        </div>
      </div>
      
      <footer className="bg-industrial-dark text-white py-3 px-6 text-center text-xs">
        <div>VisorX - Sistema de Inspeção Inteligente por Câmera para Linha de Produção PET</div>
        <div className="text-gray-400 mt-1">IP65 | Wi-Fi | Alta Precisão</div>
      </footer>
    </div>
  );
};

export default Index;
