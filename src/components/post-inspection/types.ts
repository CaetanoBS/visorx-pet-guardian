
export interface Bottle {
  id: number;
  position: number;
  hasIssue: boolean;
  types: ('none' | 'label' | 'dent' | 'cap' | 'liquid')[];
  inQuarantine: boolean;
  ejected: boolean;
}

export interface SystemStatus {
  conveyorSpeed: number;
  pressureStatus: number;
  systemStatus: 'normal' | 'warning' | 'error';
  separatorActive: boolean;
  currentEjection: number | null;
  lastEjectionTime: string;
}

export interface ProductionStats {
  approvedCount: number;
  rejectedCount: number;
}

export interface PostInspectionLineProps {
  className?: string;
  bottlesPerMinute: number;
  recentDetections: {
    id: number;
    hasIssue: boolean;
    types: ('none' | 'label' | 'dent' | 'cap' | 'liquid')[];
  }[];
}
