
import React, { useState, useEffect, createContext, useContext } from 'react';
import { toast } from "@/hooks/use-toast";

type DetectionType = 'none' | 'label' | 'dent' | 'cap' | 'liquid';
type StatusType = 'error' | 'success' | 'warning' | 'idle';

interface BottleInspectionContextType {
  status: StatusType;
  detectionType: DetectionType;
  detectionTypes: DetectionType[];
  autoMode: boolean;
  inspectedCount: number;
  rejectedCount: number;
  labelDefectsCount: number;
  dentDefectsCount: number;
  capDefectsCount: number;
  liquidDefectsCount: number;
  defectPatterns: Record<number, Record<string, number>>;
  bottlePositionCounter: number;
  setAutoMode: (value: boolean) => void;
  handleStatusChange: (newStatus: StatusType) => void;
  handleDetectionChange: (type: DetectionType) => void;
  handleBottleDetection: (types: DetectionType[]) => void;
}

const BottleInspectionContext = createContext<BottleInspectionContextType | undefined>(undefined);

export const BottleInspectionProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [status, setStatus] = useState<StatusType>('success');
  const [detectionType, setDetectionType] = useState<DetectionType>('none');
  const [detectionTypes, setDetectionTypes] = useState<DetectionType[]>(['none']);
  const [autoMode, setAutoMode] = useState(false);
  const [inspectedCount, setInspectedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [labelDefectsCount, setLabelDefectsCount] = useState(0);
  const [dentDefectsCount, setDentDefectsCount] = useState(0);
  const [capDefectsCount, setCapDefectsCount] = useState(0);
  const [liquidDefectsCount, setLiquidDefectsCount] = useState(0);
  
  // Track patterns by bottle position
  const [defectPatterns, setDefectPatterns] = useState<Record<number, Record<string, number>>>({});
  const [bottlePositionCounter, setBottlePositionCounter] = useState(0);
  
  const handleStatusChange = (newStatus: StatusType) => {
    setStatus(newStatus);
  };
  
  const handleDetectionChange = (type: DetectionType) => {
    setDetectionType(type);
    setDetectionTypes(type === 'none' ? ['none'] : [type]);
    
    // Auto-set status based on detection type
    if (type === 'none') {
      setStatus('success');
      // Count every inspection
      setInspectedCount(prev => prev + 1);
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
      } else if (type === 'liquid') {
        setLiquidDefectsCount(prev => prev + 1);
      }
      
      // Show toast notification for rejected product
      toast({
        title: "Produto Rejeitado",
        description: `Defeito detectado: ${
          type === 'label' ? 'Rótulo torto' : 
          type === 'dent' ? 'Garrafa amassada' : 
          type === 'cap' ? 'Tampa mal colocada' :
          'Nível de líquido irregular'
        }`,
        variant: "destructive"
      });
    }
  };
  
  // Track bottle position and defect patterns
  const recordBottlePosition = (types: DetectionType[]) => {
    // Increment the position counter for each bottle
    const currentPosition = bottlePositionCounter % 30; // Simulate 30 positions in the production line
    setBottlePositionCounter(prev => prev + 1);
    
    // Skip recording for bottles with no defects
    if (types.includes('none')) return;
    
    // Record each defect type separately
    setDefectPatterns(prev => {
      const updated = {...prev};
      
      if (!updated[currentPosition]) {
        updated[currentPosition] = { label: 0, dent: 0, cap: 0, liquid: 0 };
      }
      
      // Record each defect type for this bottle
      types.forEach(type => {
        if (type !== 'none') {
          updated[currentPosition][type] = (updated[currentPosition][type] || 0) + 1;
        }
      });
      
      return updated;
    });
    
    // Check for pattern thresholds and show toast notifications
    types.forEach(type => {
      if (type !== 'none' && defectPatterns[currentPosition]?.[type] >= 3) {
        toast({
          title: "Padrão Detectado",
          description: `Múltiplos defeitos de ${
            type === 'label' ? 'rótulo' : 
            type === 'dent' ? 'amassamento' : 
            type === 'cap' ? 'tampa' :
            'nível de líquido'
          } detectados na posição ${currentPosition}. Possível problema no equipamento.`,
          variant: "default"
        });
      }
    });
  };
  
  // Handler for the CameraFeed component detection events
  const handleBottleDetection = (types: DetectionType[]) => {
    // Only process detections when in auto mode
    if (autoMode) {
      setDetectionTypes(types);
      
      // Set status based on detection types
      if (types.includes('none')) {
        setStatus('success');
      } else {
        setStatus('error');
      }
      
      // Count inspections and rejections
      setInspectedCount(prev => prev + 1);
      
      if (!types.includes('none')) {
        setRejectedCount(prev => prev + 1);
        
        // Update defect counters for each type
        types.forEach(type => {
          if (type === 'label') {
            setLabelDefectsCount(prev => prev + 1);
          } else if (type === 'dent') {
            setDentDefectsCount(prev => prev + 1);
          } else if (type === 'cap') {
            setCapDefectsCount(prev => prev + 1);
          } else if (type === 'liquid') {
            setLiquidDefectsCount(prev => prev + 1);
          }
        });
        
        // Show toast for the rejection
        const defectDescriptions = types.map(type => 
          type === 'label' ? 'Rótulo torto' : 
          type === 'dent' ? 'Garrafa amassada' : 
          type === 'cap' ? 'Tampa mal colocada' :
          'Nível de líquido irregular'
        ).join(', ');
        
        toast({
          title: "Produto Rejeitado",
          description: `Defeitos detectados: ${defectDescriptions}`,
          variant: "destructive"
        });
      }
      
      // Record patterns
      recordBottlePosition(types);
    }
  };

  return (
    <BottleInspectionContext.Provider value={{
      status,
      detectionType,
      detectionTypes,
      autoMode,
      inspectedCount,
      rejectedCount,
      labelDefectsCount,
      dentDefectsCount,
      capDefectsCount,
      liquidDefectsCount,
      defectPatterns,
      bottlePositionCounter,
      setAutoMode,
      handleStatusChange,
      handleDetectionChange,
      handleBottleDetection
    }}>
      {children}
    </BottleInspectionContext.Provider>
  );
};

export const useBottleInspection = () => {
  const context = useContext(BottleInspectionContext);
  if (context === undefined) {
    throw new Error('useBottleInspection must be used within a BottleInspectionProvider');
  }
  return context;
};
