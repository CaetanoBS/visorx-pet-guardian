
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import SystemStatusPanel from './post-inspection/SystemStatusPanel';
import TopView from './post-inspection/TopView';
import SideView from './post-inspection/SideView';
import ProductionCounters from './post-inspection/ProductionCounters';
import ControlButtons from './post-inspection/ControlButtons';
import { PostInspectionLineProps, Bottle, SystemStatus, ProductionStats } from './post-inspection/types';
import { createBottleFromDetection, updateBottlePosition, shouldRemoveBottle, shouldCountAsApproved } from './post-inspection/bottleUtils';

const PostInspectionLine: React.FC<PostInspectionLineProps> = ({ 
  className,
  bottlesPerMinute = 99,
  recentDetections = []
}) => {
  const [bottles, setBottles] = useState<Bottle[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    conveyorSpeed: 100,
    pressureStatus: 95,
    systemStatus: 'normal',
    separatorActive: false,
    currentEjection: null,
    lastEjectionTime: '-'
  });
  const [productionStats, setProductionStats] = useState<ProductionStats>({
    approvedCount: 0,
    rejectedCount: 0
  });

  // Process detected bottles moving through post-inspection
  useEffect(() => {
    if (recentDetections.length > 0) {
      setBottles(prev => {
        const newBottles = [...prev];
        
        recentDetections.forEach(detection => {
          if (!newBottles.some(b => b.id === detection.id)) {
            newBottles.push(createBottleFromDetection(detection));
          }
        });
        
        return newBottles;
      });
    }
  }, [recentDetections]);

  // Move bottles along the line and handle ejection
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setBottles(prev => {
        const currentTime = new Date();
        
        const updatedBottles = prev.map(bottle => {
          // Check for bottles with issues in ejection zone
          if (bottle.hasIssue && bottle.position >= 3 && bottle.position < 3.1 && !bottle.ejected) {
            setSystemStatus(prevStatus => ({
              ...prevStatus,
              separatorActive: true,
              currentEjection: bottle.id,
              lastEjectionTime: `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}:${currentTime.getSeconds().toString().padStart(2, '0')}`,
              pressureStatus: Math.max(70, prevStatus.pressureStatus - Math.floor(Math.random() * 15)),
              conveyorSpeed: Math.max(85, prevStatus.conveyorSpeed - Math.floor(Math.random() * 8))
            }));
          }
          
          // Count bottles reaching quarantine as rejected
          if (bottle.ejected && !bottle.inQuarantine && bottle.position >= 3.5) {
            setProductionStats(prev => ({ ...prev, rejectedCount: prev.rejectedCount + 1 }));
            setSystemStatus(prevStatus => ({
              ...prevStatus,
              separatorActive: false,
              currentEjection: null,
              pressureStatus: Math.min(98, prevStatus.pressureStatus + Math.floor(Math.random() * 5)),
              conveyorSpeed: Math.min(100, prevStatus.conveyorSpeed + Math.floor(Math.random() * 5))
            }));
          }
          
          // Count approved bottles
          if (shouldCountAsApproved(bottle)) {
            setProductionStats(prev => ({ ...prev, approvedCount: prev.approvedCount + 1 }));
          }
          
          return updateBottlePosition(bottle);
        }).filter(bottle => !shouldRemoveBottle(bottle));

        // Deactivate separator if no bottles are being ejected
        if (!updatedBottles.some(b => b.hasIssue && b.position >= 3 && b.position < 3.5 && !b.inQuarantine)) {
          setSystemStatus(prevStatus => ({
            ...prevStatus,
            separatorActive: false,
            currentEjection: null
          }));
        }
        
        // Simulate system fluctuations
        if (Math.random() > 0.97) {
          setSystemStatus(prevStatus => ({
            ...prevStatus,
            pressureStatus: Math.min(98, Math.max(75, prevStatus.pressureStatus + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3)))
          }));
        }
        
        if (Math.random() > 0.98) {
          setSystemStatus(prevStatus => ({
            ...prevStatus,
            conveyorSpeed: Math.min(100, Math.max(90, prevStatus.conveyorSpeed + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2)))
          }));
        }
        
        // Update system status based on conditions
        setSystemStatus(prevStatus => {
          let newSystemStatus: 'normal' | 'warning' | 'error' = 'normal';
          
          if (prevStatus.pressureStatus < 80 || prevStatus.conveyorSpeed < 85) {
            newSystemStatus = 'warning';
          }
          if (prevStatus.pressureStatus < 70 || prevStatus.conveyorSpeed < 75) {
            newSystemStatus = 'error';
          }
          
          return { ...prevStatus, systemStatus: newSystemStatus };
        });

        return updatedBottles;
      });
    }, 16);
    
    return () => clearInterval(animationInterval);
  }, []);

  const handleSpeedDecrease = () => {
    setSystemStatus(prev => ({
      ...prev,
      conveyorSpeed: Math.max(70, prev.conveyorSpeed - 5)
    }));
  };

  const handleSpeedIncrease = () => {
    setSystemStatus(prev => ({
      ...prev,
      conveyorSpeed: Math.min(100, prev.conveyorSpeed + 5)
    }));
  };

  return (
    <div className={cn("bg-card p-4 rounded-lg shadow relative", className)}>
      <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
        <span>Linha de Produção Pós-Inspeção</span>
        <ArrowRight className="h-4 w-4" />
        <span className="text-sm font-normal text-muted-foreground">Automação em tempo real</span>
      </h3>
      
      <SystemStatusPanel status={systemStatus} />
      
      <div className="flex gap-4">
        <TopView bottles={bottles} systemStatus={systemStatus} />
        <SideView bottles={bottles} systemStatus={systemStatus} />
      </div>

      <ProductionCounters 
        stats={productionStats}
        separatorActive={systemStatus.separatorActive}
        totalInspected={productionStats.approvedCount + productionStats.rejectedCount}
      />
      
      <ControlButtons 
        conveyorSpeed={systemStatus.conveyorSpeed}
        onSpeedDecrease={handleSpeedDecrease}
        onSpeedIncrease={handleSpeedIncrease}
      />
    </div>
  );
};

export default PostInspectionLine;
