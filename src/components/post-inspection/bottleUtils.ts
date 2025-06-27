
import { Bottle } from './types';

export const createBottleFromDetection = (detection: {
  id: number;
  hasIssue: boolean;
  types: ('none' | 'label' | 'dent' | 'cap' | 'liquid')[];
}): Bottle => ({
  id: detection.id,
  position: 0,
  hasIssue: detection.hasIssue,
  types: detection.types,
  inQuarantine: false,
  ejected: false
});

export const updateBottlePosition = (bottle: Bottle): Bottle => {
  // Bottles with issues that reach ejection zone
  if (bottle.hasIssue && bottle.position >= 3 && bottle.position < 3.1 && !bottle.ejected) {
    return {
      ...bottle,
      position: bottle.position + 0.05,
      ejected: true
    };
  }
  
  // Ejected bottles moving to quarantine
  if (bottle.ejected && !bottle.inQuarantine) {
    if (bottle.position >= 3.5) {
      return {
        ...bottle,
        inQuarantine: true
      };
    }
    
    return {
      ...bottle,
      position: bottle.position + 0.05
    };
  }
  
  // Normal bottles continue moving right
  if (!bottle.ejected) {
    return {
      ...bottle,
      position: bottle.position + 0.05
    };
  }
  
  return bottle;
};

export const shouldRemoveBottle = (bottle: Bottle): boolean => {
  return (bottle.position >= 7 && !bottle.inQuarantine) || 
         (bottle.inQuarantine && bottle.position >= 5);
};

export const shouldCountAsApproved = (bottle: Bottle): boolean => {
  return bottle.position >= 6.8 && !bottle.hasIssue;
};
