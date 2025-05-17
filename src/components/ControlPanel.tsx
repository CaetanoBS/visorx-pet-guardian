
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ControlPanelProps {
  className?: string;
  onStatusChange: (status: 'error' | 'success' | 'warning' | 'idle') => void;
  onDetectionChange: (type: 'none' | 'label' | 'dent' | 'cap') => void;
  currentStatus: 'error' | 'success' | 'warning' | 'idle';
  currentDetection: 'none' | 'label' | 'dent' | 'cap';
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  className,
  onStatusChange,
  onDetectionChange,
  currentStatus,
  currentDetection
}) => {
  return (
    <div className={cn("bg-card p-4 rounded-lg", className)}>
      <h3 className="text-lg font-bold mb-4">Painel de Controle</h3>
      
      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="status">Status do Sistema</TabsTrigger>
          <TabsTrigger value="simulation">Simulação de Falhas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="status" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant={currentStatus === 'success' ? 'default' : 'outline'} 
              onClick={() => onStatusChange('success')}
              className="border-green-200 hover:border-green-300 hover:bg-green-50"
            >
              <div className="w-3 h-3 rounded-full bg-status-success mr-2"></div>
              Normal
            </Button>
            <Button 
              variant={currentStatus === 'warning' ? 'default' : 'outline'} 
              onClick={() => onStatusChange('warning')}
              className="border-yellow-200 hover:border-yellow-300 hover:bg-yellow-50"
            >
              <div className="w-3 h-3 rounded-full bg-status-warning mr-2"></div>
              Alerta
            </Button>
            <Button 
              variant={currentStatus === 'error' ? 'default' : 'outline'} 
              onClick={() => onStatusChange('error')}
              className="border-red-200 hover:border-red-300 hover:bg-red-50"
            >
              <div className="w-3 h-3 rounded-full bg-status-error mr-2"></div>
              Erro
            </Button>
            <Button 
              variant={currentStatus === 'idle' ? 'default' : 'outline'} 
              onClick={() => onStatusChange('idle')}
              className="border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            >
              <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
              Inativo
            </Button>
          </div>
          
          <div className="pt-2">
            <div className="text-sm font-medium mb-1">Status atual:</div>
            <div className="font-mono bg-secondary p-2 rounded text-sm flex items-center">
              <div 
                className={cn(
                  "w-3 h-3 rounded-full mr-2",
                  currentStatus === 'success' && "bg-status-success",
                  currentStatus === 'warning' && "bg-status-warning",
                  currentStatus === 'error' && "bg-status-error",
                  currentStatus === 'idle' && "bg-gray-400"
                )}
              />
              <span className="uppercase">
                {currentStatus === 'success' && "Sistema Normal"}
                {currentStatus === 'warning' && "Atenção Requerida"}
                {currentStatus === 'error' && "Erro Detectado"}
                {currentStatus === 'idle' && "Sistema Inativo"}
              </span>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="simulation" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant={currentDetection === 'none' ? 'default' : 'outline'} 
              onClick={() => onDetectionChange('none')}
            >
              Sem Falhas
            </Button>
            <Button 
              variant={currentDetection === 'label' ? 'default' : 'outline'} 
              onClick={() => onDetectionChange('label')}
            >
              Rótulo Torto
            </Button>
            <Button 
              variant={currentDetection === 'dent' ? 'default' : 'outline'} 
              onClick={() => onDetectionChange('dent')}
            >
              Garrafa Amassada
            </Button>
            <Button 
              variant={currentDetection === 'cap' ? 'default' : 'outline'} 
              onClick={() => onDetectionChange('cap')}
            >
              Tampa Incorreta
            </Button>
          </div>
          
          <div className="pt-2">
            <div className="text-sm font-medium mb-1">Simulando:</div>
            <div className="font-mono bg-secondary p-2 rounded text-sm">
              {currentDetection === 'none' && "Nenhuma falha - Produto conforme"}
              {currentDetection === 'label' && "Rótulo mal aplicado - Rejeitar produto"}
              {currentDetection === 'dent' && "Deformação na garrafa - Rejeitar produto"}
              {currentDetection === 'cap' && "Tampa mal selada - Rejeitar produto"}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ControlPanel;
