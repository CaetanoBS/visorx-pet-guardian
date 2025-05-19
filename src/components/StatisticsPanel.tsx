
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { cn } from '@/lib/utils';

interface StatisticsPanelProps {
  className?: string;
  inspectedCount: number;
  rejectedCount: number;
  labelDefectsCount: number;
  dentDefectsCount: number;
  capDefectsCount: number;
  liquidDefectsCount: number;
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ 
  className,
  inspectedCount,
  rejectedCount,
  labelDefectsCount,
  dentDefectsCount,
  capDefectsCount,
  liquidDefectsCount
}) => {
  const defectsTotal = labelDefectsCount + dentDefectsCount + capDefectsCount + liquidDefectsCount;
  const approvalRate = inspectedCount > 0 
    ? ((inspectedCount - rejectedCount) / inspectedCount * 100).toFixed(1) 
    : "0.0";
  
  return (
    <div className={cn("bg-card p-4 rounded-lg shadow", className)}>
      <h3 className="text-lg font-bold mb-4">Relatório de Inspeção</h3>
      
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-industrial-dark text-white p-3 rounded-md">
          <div className="text-xs text-industrial-silver">Total Inspecionado</div>
          <div className="text-2xl font-bold">{inspectedCount}</div>
        </div>
        <div className="bg-industrial-dark text-white p-3 rounded-md">
          <div className="text-xs text-industrial-silver">Total Rejeitado</div>
          <div className="text-2xl font-bold text-status-error">{rejectedCount}</div>
        </div>
        <div className="bg-industrial-dark text-white p-3 rounded-md">
          <div className="text-xs text-industrial-silver">Taxa de Aprovação</div>
          <div className="text-2xl font-bold text-status-success">{approvalRate}%</div>
        </div>
        <div className="bg-industrial-dark text-white p-3 rounded-md">
          <div className="text-xs text-industrial-silver">Total de Defeitos</div>
          <div className="text-2xl font-bold text-status-warning">{defectsTotal}</div>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo de Defeito</TableHead>
            <TableHead className="text-right">Quantidade</TableHead>
            <TableHead className="text-right">Percentual</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Rótulo Torto</TableCell>
            <TableCell className="text-right">{labelDefectsCount}</TableCell>
            <TableCell className="text-right">
              {defectsTotal > 0 ? ((labelDefectsCount / defectsTotal) * 100).toFixed(1) : "0.0"}%
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Garrafa Amassada</TableCell>
            <TableCell className="text-right">{dentDefectsCount}</TableCell>
            <TableCell className="text-right">
              {defectsTotal > 0 ? ((dentDefectsCount / defectsTotal) * 100).toFixed(1) : "0.0"}%
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Tampa Mal Colocada</TableCell>
            <TableCell className="text-right">{capDefectsCount}</TableCell>
            <TableCell className="text-right">
              {defectsTotal > 0 ? ((capDefectsCount / defectsTotal) * 100).toFixed(1) : "0.0"}%
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Nível de Líquido Irregular</TableCell>
            <TableCell className="text-right">{liquidDefectsCount}</TableCell>
            <TableCell className="text-right">
              {defectsTotal > 0 ? ((liquidDefectsCount / defectsTotal) * 100).toFixed(1) : "0.0"}%
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default StatisticsPanel;
