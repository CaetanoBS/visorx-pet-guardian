
import React, { useState } from 'react';
import Header from '@/components/Header';
import DeviceVisualization from '@/components/DeviceVisualization';
import CameraFeed from '@/components/CameraFeed';
import ControlPanel from '@/components/ControlPanel';
import InspectionResults from '@/components/InspectionResults';

const Index = () => {
  const [status, setStatus] = useState<'error' | 'success' | 'warning' | 'idle'>('success');
  const [detectionType, setDetectionType] = useState<'none' | 'label' | 'dent' | 'cap'>('none');
  
  const handleStatusChange = (newStatus: 'error' | 'success' | 'warning' | 'idle') => {
    setStatus(newStatus);
  };
  
  const handleDetectionChange = (type: 'none' | 'label' | 'dent' | 'cap') => {
    setDetectionType(type);
    // Auto-set status based on detection type
    if (type === 'none') {
      setStatus('success');
    } else {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <div className="bg-card p-4 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Monitoramento em Tempo Real</h2>
              <div className="relative">
                <CameraFeed 
                  className="w-full" 
                  simulateDetection={detectionType !== 'none'}
                  detectionType={detectionType}
                />
                <div className="mt-4 font-mono text-xs text-muted-foreground">
                  Sistema VisorX monitorando linha de produção PET - Conectado ao sistema central
                </div>
              </div>
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
