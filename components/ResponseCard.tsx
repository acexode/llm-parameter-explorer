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
      className={`transition-all shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1 ${
        isTopPerformer
          ? 'border-l-4 border-l-green-500 shadow-green-500/20'
          : isBottomPerformer
          ? 'border-l-4 border-l-red-500 shadow-red-500/20'
          : 'border-l-4 border-l-gray-300'
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
                <span className="text-gray-600">Temperature:</span>
                <Badge variant="outline" className="font-mono bg-orange-50 text-orange-700 border-orange-200">
                  {response.temperature.toFixed(2)}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-600">Top P:</span>
                <Badge variant="outline" className="font-mono bg-purple-50 text-purple-700 border-purple-200">
                  {response.top_p.toFixed(2)}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-600">Overall Score:</span>
                <Badge
                  variant="outline"
                  className={`font-semibold ${
                    response.metrics.overallScore >= 85
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : response.metrics.overallScore >= 70
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : response.metrics.overallScore >= 50
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      : 'bg-red-50 text-red-700 border-red-200'
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
          <h4 className="text-sm font-medium text-gray-700">Response:</h4>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm whitespace-pre-wrap leading-relaxed text-gray-800">
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

