
import React from 'react';

interface ControlButtonsProps {
  conveyorSpeed: number;
  onSpeedDecrease: () => void;
  onSpeedIncrease: () => void;
}

const ControlButtons: React.FC<ControlButtonsProps> = ({
  conveyorSpeed,
  onSpeedDecrease,
  onSpeedIncrease
}) => {
  return (
    <div className="mt-2 flex justify-end gap-2">
      <button 
        className="text-xs bg-industrial-dark text-white px-3 py-1 rounded hover:bg-industrial-medium"
        onClick={onSpeedDecrease}
      >
        Reduzir Velocidade
      </button>
      <button 
        className="text-xs bg-industrial-dark text-white px-3 py-1 rounded hover:bg-industrial-medium"
        onClick={onSpeedIncrease}
      >
        Aumentar Velocidade
      </button>
    </div>
  );
};

export default ControlButtons;
