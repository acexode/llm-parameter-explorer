'use client';

import { Response } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown } from 'lucide-react';

interface ComparisonViewProps {
  responses: Response[];
}

export function ComparisonView({ responses }: ComparisonViewProps) {
  if (responses.length < 2) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <ArrowUpDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select at least 2 responses to compare</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    { key: 'coherence', name: 'Coherence' },
    { key: 'lexicalDiversity', name: 'Lexical Diversity' },
    { key: 'completeness', name: 'Completeness' },
    { key: 'readability', name: 'Readability' },
    { key: 'lengthAppropriate', name: 'Length Appropriateness' },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Parameters Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Parameters Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Response</th>
                  <th className="text-left py-3 px-4 font-medium">Temperature</th>
                  <th className="text-left py-3 px-4 font-medium">Top P</th>
                  <th className="text-left py-3 px-4 font-medium">Overall Score</th>
                </tr>
              </thead>
              <tbody>
                {responses.map((response, index) => (
                  <tr key={response.id} className="border-b last:border-0">
                    <td className="py-3 px-4">Response #{index + 1}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="font-mono">
                        {response.temperature.toFixed(2)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="font-mono">
                        {response.top_p.toFixed(2)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={`font-semibold ${
                          response.metrics.overallScore >= 85
                            ? 'text-green-600 dark:text-green-400'
                            : response.metrics.overallScore >= 70
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-yellow-600 dark:text-yellow-400'
                        }`}
                      >
                        {response.metrics.overallScore}/100
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Metrics Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {metrics.map((metric) => (
              <div key={metric.key} className="space-y-3">
                <h4 className="font-medium text-sm">{metric.name}</h4>
                <div className="space-y-2">
                  {responses.map((response, index) => {
                    const metricData = response.metrics[metric.key as keyof typeof response.metrics];
                    const score = typeof metricData === 'object' && 'score' in metricData ? metricData.score : 0;
                    
                    return (
                      <div key={response.id} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Response #{index + 1}
                          </span>
                          <span className="font-medium">{score}/100</span>
                        </div>
                        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${getScoreColor(score)}`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Content Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {responses.map((response, index) => (
              <div key={response.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Response #{index + 1}</h4>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">T:</span>
                    <Badge variant="outline" className="font-mono text-xs px-1.5 py-0">
                      {response.temperature.toFixed(2)}
                    </Badge>
                    <span className="text-muted-foreground">P:</span>
                    <Badge variant="outline" className="font-mono text-xs px-1.5 py-0">
                      {response.top_p.toFixed(2)}
                    </Badge>
                  </div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg max-h-64 overflow-y-auto">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {response.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

