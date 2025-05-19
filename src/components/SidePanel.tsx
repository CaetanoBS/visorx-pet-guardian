
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
    </div>
  );
};

export default SidePanel;
