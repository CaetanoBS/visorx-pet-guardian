
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
      const totalDefects = Object.values(defects).reduce((sum, count) => sum + count, 0);
      const defectRate = totalDefects / Math.max(1, totalBottles) * 100;
      
      if (defectRate > 50) { // If a specific bottle position has more than 50% defect rate
        const mostCommonDefect = Object.entries(defects).sort((a, b) => b[1] - a[1])[0];
        const defectType = mostCommonDefect[0];
        
        let possibleCause = '';
        let recommendedAction = '';
        
        switch (defectType) {
          case 'label':
            possibleCause = `Problema no aplicador de rótulos na posição ${bottlePosition}`;
            recommendedAction = `Verificar alinhamento do aplicador ${bottlePosition} e sensores de posição`;
            break;
          case 'dent':
            possibleCause = `Problema no manuseio de garrafas na posição ${bottlePosition}`;
            recommendedAction = `Inspecionar sistema de transporte na posição ${bottlePosition} e reduzir pressão de contato`;
            break;
          case 'cap':
            possibleCause = `Problema no fechador de tampas na posição ${bottlePosition}`;
            recommendedAction = `Calibrar torque do aplicador de tampas na posição ${bottlePosition} e verificar alinhamento`;
            break;
          default:
            possibleCause = `Problema desconhecido na posição ${bottlePosition}`;
            recommendedAction = `Realizar inspeção manual da posição ${bottlePosition}`;
        }
        
        insights.push({
          id: insights.length + 1,
          pattern: `Garrafa na posição ${bottlePosition} apresenta ${defectRate.toFixed(1)}% de defeitos do tipo ${
            defectType === 'label' ? 'RÓTULO' : 
            defectType === 'dent' ? 'AMASSADO' : 
            'TAMPA'
          }`,
          possibleCause,
          recommendedAction,
          confidence: Math.min(95, defectRate + 30) // Calculate a confidence score
        });
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
