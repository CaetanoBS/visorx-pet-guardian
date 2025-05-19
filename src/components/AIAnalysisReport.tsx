
import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface PatternInsight {
  id: number;
  pattern: string;
  possibleCause: string;
  recommendedAction: string;
  confidence: number;
}

interface AIAnalysisReportProps {
  className?: string;
  defectPatterns: Record<number, Record<string, number>>;
  totalBottles: number;
}

const AIAnalysisReport: React.FC<AIAnalysisReportProps> = ({ 
  className,
  defectPatterns,
  totalBottles
}) => {
  // AI algorithm to identify patterns and generate insights
  const generateInsights = (): PatternInsight[] => {
    const insights: PatternInsight[] = [];
    
    // Check for patterns in specific bottle positions
    Object.entries(defectPatterns).forEach(([bottleId, defects]) => {
      const bottlePosition = parseInt(bottleId);
      
      // Calculate total defects for this position
      const totalDefects = Object.values(defects).reduce((sum, count) => sum + count, 0);
      const defectRate = totalDefects / Math.max(1, totalBottles) * 100;
      
      // Analyze each defect type independently if it crosses threshold
      Object.entries(defects).forEach(([defectType, count]) => {
        const defectTypeRate = count / Math.max(1, totalBottles) * 100;
        
        // Only generate insights for defect types that have significant occurrence (threshold at 20%)
        if (defectTypeRate > 20) {
          let possibleCause = '';
          let recommendedAction = '';
          let defectTypeName = '';
          
          switch (defectType) {
            case 'label':
              defectTypeName = 'RÓTULO';
              possibleCause = `Problema no aplicador de rótulos na posição ${bottlePosition}`;
              recommendedAction = `Verificar alinhamento do aplicador ${bottlePosition} e sensores de posição`;
              break;
            case 'dent':
              defectTypeName = 'AMASSADO';
              possibleCause = `Problema no manuseio de garrafas na posição ${bottlePosition}`;
              recommendedAction = `Inspecionar sistema de transporte na posição ${bottlePosition} e reduzir pressão de contato`;
              break;
            case 'cap':
              defectTypeName = 'TAMPA';
              possibleCause = `Problema no fechador de tampas na posição ${bottlePosition}`;
              recommendedAction = `Calibrar torque do aplicador de tampas na posição ${bottlePosition} e verificar alinhamento`;
              break;
            case 'liquid':
              defectTypeName = 'NÍVEL';
              possibleCause = `Problema no bico enchedor número ${bottlePosition}`;
              recommendedAction = `Verificar válvula do enchedor ${bottlePosition} e sensor de nível`;
              break;
            default:
              defectTypeName = 'DESCONHECIDO';
              possibleCause = `Problema desconhecido na posição ${bottlePosition}`;
              recommendedAction = `Realizar inspeção manual da posição ${bottlePosition}`;
          }
          
          insights.push({
            id: insights.length + 1,
            pattern: `Garrafa na posição ${bottlePosition} apresenta ${defectTypeRate.toFixed(1)}% de defeitos do tipo ${defectTypeName}`,
            possibleCause,
            recommendedAction,
            confidence: Math.min(95, defectTypeRate + 30) // Calculate a confidence score
          });
        }
      });
      
      // Look for patterns with multiple defect types at same position
      if (Object.keys(defects).length > 1) {
        const defectTypes = Object.keys(defects).map(type => 
          type === 'label' ? 'RÓTULO' : 
          type === 'dent' ? 'AMASSADO' : 
          type === 'cap' ? 'TAMPA' : 'NÍVEL'
        ).join(' e ');
        
        insights.push({
          id: insights.length + 1,
          pattern: `Garrafa na posição ${bottlePosition} apresenta múltiplos defeitos (${defectTypes})`,
          possibleCause: `Possível falha sistêmica no processo ou equipamento na posição ${bottlePosition}`,
          recommendedAction: `Realizar inspeção completa do equipamento na posição ${bottlePosition} e avaliar procedimentos`,
          confidence: Math.min(98, defectRate + 40) // Higher confidence for multiple issues
        });
      }
    });
    
    // Look for patterns across multiple positions (e.g., sequential positions with same defect)
    const sequentialPositions: Record<string, number[]> = {
      label: [],
      dent: [],
      cap: [],
      liquid: []
    };
    
    // Group positions by defect type
    Object.entries(defectPatterns).forEach(([position, defects]) => {
      Object.entries(defects).forEach(([defectType, count]) => {
        if (count > 0 && defectType in sequentialPositions) {
          sequentialPositions[defectType].push(parseInt(position));
        }
      });
    });
    
    // Look for sequential patterns
    Object.entries(sequentialPositions).forEach(([defectType, positions]) => {
      if (positions.length >= 3) {
        positions.sort((a, b) => a - b);
        
        // Check if positions are sequential or follow a pattern
        const isSequential = positions.every((pos, i) => i === 0 || pos === positions[i-1] + 1);
        const hasPattern = positions.length >= 3 && 
                          positions.slice(1).every((pos, i) => i === 0 || (pos - positions[i]) === (positions[i] - positions[i-1]));
        
        if (isSequential || hasPattern) {
          const positionStr = positions.slice(0, 3).join(", ") + (positions.length > 3 ? "..." : "");
          
          let defectTypeName = defectType === 'label' ? 'RÓTULO' : 
                               defectType === 'dent' ? 'AMASSADO' : 
                               defectType === 'cap' ? 'TAMPA' : 'NÍVEL';
          
          let possibleCause = '';
          let recommendedAction = '';
          
          switch (defectType) {
            case 'label':
              possibleCause = "Problema sequencial no sistema de aplicação de rótulos";
              recommendedAction = "Verificar alinhamento geral do sistema rotulador e calibrar sensores";
              break;
            case 'dent':
              possibleCause = "Problema no sistema de transporte causando amassamentos em sequência";
              recommendedAction = "Verificar guias do transportador e ajustar pressão das correntes de transporte";
              break;
            case 'cap':
              possibleCause = "Problema sequencial no sistema de tampas";
              recommendedAction = "Verificar alimentador de tampas e ajustar cabeçotes de aplicação";
              break;
            case 'liquid':
              possibleCause = "Problema no sistema de enchimento em sequência";
              recommendedAction = "Verificar pressão do sistema de enchimento e calibrar sensores de nível";
              break;
          }
          
          insights.push({
            id: insights.length + 1,
            pattern: `Defeitos sequenciais de ${defectTypeName} nas posições ${positionStr}`,
            possibleCause,
            recommendedAction,
            confidence: hasPattern ? 85 : 75
          });
        }
      }
    });
    
    return insights;
  };

  const insights = generateInsights();

  return (
    <div className={cn("bg-card p-4 rounded-lg shadow", className)}>
      <h3 className="text-lg font-bold mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
        Análise Inteligente de Padrões
      </h3>
      
      {insights.length > 0 ? (
        <>
          <div className="text-sm text-muted-foreground mb-4">
            O sistema detectou os seguintes padrões de defeitos que podem indicar problemas específicos no processo de produção:
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Padrão Detectado</TableHead>
                <TableHead>Possível Causa</TableHead>
                <TableHead>Ação Recomendada</TableHead>
                <TableHead className="text-right">Confiança</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {insights.map((insight) => (
                <TableRow key={insight.id}>
                  <TableCell className="font-medium">{insight.pattern}</TableCell>
                  <TableCell>{insight.possibleCause}</TableCell>
                  <TableCell>{insight.recommendedAction}</TableCell>
                  <TableCell className="text-right">{insight.confidence.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      ) : (
        <div className="text-center p-6 border border-dashed rounded-md">
          <div className="text-muted-foreground">
            Nenhum padrão significativo de defeitos foi detectado ainda.
          </div>
          <div className="text-xs mt-2">
            Continue a inspeção para acumular dados suficientes para análise.
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysisReport;
