'use client';

import { useState } from 'react';
import { Response } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MetricsDisplay } from './MetricsDisplay';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

interface ResponseCardProps {
  response: Response;
  rank?: number;
  isTopPerformer?: boolean;
  isBottomPerformer?: boolean;
}

export function ResponseCard({
  response,
  rank,
  isTopPerformer,
  isBottomPerformer,
}: ResponseCardProps) {
  const [copied, setCopied] = useState(false);
  const [showMetrics, setShowMetrics] = useState(true);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(response.content);
      setCopied(true);
      toast.success('Response copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <Card
      className={`transition-all ${
        isTopPerformer
          ? 'border-green-500 dark:border-green-700 shadow-lg shadow-green-500/10'
          : isBottomPerformer
          ? 'border-red-500 dark:border-red-700 shadow-lg shadow-red-500/10'
          : ''
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg">
                Response {rank ? `#${rank}` : ''}
              </CardTitle>
              {isTopPerformer && (
                <Badge className="bg-green-600 hover:bg-green-700">
                  Best Performer
                </Badge>
              )}
              {isBottomPerformer && (
                <Badge variant="destructive">Lowest Score</Badge>
              )}
            </div>
            
            <div className="flex items-center gap-3 text-sm flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Temperature:</span>
                <Badge variant="outline" className="font-mono">
                  {response.temperature.toFixed(2)}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Top P:</span>
                <Badge variant="outline" className="font-mono">
                  {response.top_p.toFixed(2)}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Overall Score:</span>
                <Badge
                  variant="outline"
                  className={`font-semibold ${
                    response.metrics.overallScore >= 85
                      ? 'text-green-600 dark:text-green-400'
                      : response.metrics.overallScore >= 70
                      ? 'text-blue-600 dark:text-blue-400'
                      : response.metrics.overallScore >= 50
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {response.metrics.overallScore}/100
                </Badge>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="shrink-0"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Response Content */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Response:</h4>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {response.content}
            </p>
          </div>
        </div>

        {/* Metrics Section */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMetrics(!showMetrics)}
            className="w-full justify-between"
          >
            <span className="font-medium">Quality Metrics</span>
            {showMetrics ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {showMetrics && (
            <div className="pt-2">
              <MetricsDisplay metrics={response.metrics} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

