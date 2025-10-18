'use client';

import { QualityMetrics } from '@/types';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface MetricsDisplayProps {
  metrics: QualityMetrics;
  compact?: boolean;
}

export function MetricsDisplay({ metrics, compact = false }: MetricsDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-blue-600 dark:text-blue-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const metricsList = [
    {
      name: 'Coherence',
      key: 'coherence',
      data: metrics.coherence,
      description: 'Sentence structure, punctuation, and logical flow',
    },
    {
      name: 'Lexical Diversity',
      key: 'lexicalDiversity',
      data: metrics.lexicalDiversity,
      description: 'Vocabulary richness and word variety',
    },
    {
      name: 'Completeness',
      key: 'completeness',
      data: metrics.completeness,
      description: 'Content adequacy and structural elements',
    },
    {
      name: 'Readability',
      key: 'readability',
      data: metrics.readability,
      description: 'Ease of understanding and sentence complexity',
    },
    {
      name: 'Length Appropriateness',
      key: 'lengthAppropriate',
      data: metrics.lengthAppropriate,
      description: 'Response length vs. prompt expectations',
    },
  ];

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Overall Score:</span>
          <Badge
            variant="outline"
            className={`${getScoreColor(metrics.overallScore)} font-semibold`}
          >
            {metrics.overallScore}/100
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {metricsList.map((metric) => (
            <div key={metric.key} className="flex items-center justify-between">
              <span className="text-muted-foreground">{metric.name}:</span>
              <span className={`font-medium ${getScoreColor(metric.data.score)}`}>
                {metric.data.score}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <span className="text-lg font-semibold">Overall Quality Score</span>
        <Badge
          variant="outline"
          className={`${getScoreColor(metrics.overallScore)} text-lg font-bold px-3 py-1`}
        >
          {metrics.overallScore}/100
        </Badge>
      </div>

      {/* Individual Metrics */}
      <TooltipProvider>
        <div className="space-y-4">
          {metricsList.map((metric) => (
            <div key={metric.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{metric.name}</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">{metric.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className={`text-sm font-semibold ${getScoreColor(metric.data.score)}`}>
                  {metric.data.score}/100
                </span>
              </div>
              
              <div className="relative">
                <Progress 
                  value={metric.data.score} 
                  className="h-2"
                />
                <div
                  className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor(metric.data.score)}`}
                  style={{ width: `${metric.data.score}%` }}
                />
              </div>
              
              <p className="text-xs text-muted-foreground">{metric.data.explanation}</p>
            </div>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}

