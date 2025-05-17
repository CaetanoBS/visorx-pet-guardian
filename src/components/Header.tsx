
import React from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const Header: React.FC<HeaderProps> = ({ className, ...props }) => {
  return (
    <header className={cn("bg-industrial-dark text-white py-4 px-6 shadow-lg", className)} {...props}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <span className="font-bold text-white">VX</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">VisorX</h1>
            <p className="text-xs text-gray-400">Sistema de Inspeção Inteligente</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-industrial-medium px-3 py-1 rounded text-sm">
            <span className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse-slow"></span>
            <span>Sistema Ativo</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
