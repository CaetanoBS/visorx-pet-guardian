
import React from 'react';
import Header from '@/components/Header';
import ControlPanel from '@/components/ControlPanel';
import MainContainer from '@/components/MainContainer';
import SidePanel from '@/components/SidePanel';
import FooterSection from '@/components/FooterSection';
import { BottleInspectionProvider, useBottleInspection } from '@/contexts/BottleInspectionContext';

const IndexContent = () => {
  const { status, detectionType, handleStatusChange, handleDetectionChange } = useBottleInspection();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <MainContainer />
          <SidePanel />
          
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
      
      <FooterSection />
    </div>
  );
};

const Index = () => {
  return (
    <BottleInspectionProvider>
      <IndexContent />
    </BottleInspectionProvider>
  );
};

export default Index;
