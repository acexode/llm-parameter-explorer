'use client';

import { Experiment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, Clock, FileText, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

interface ExperimentHistoryProps {
  experiments: Experiment[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  selectedId?: string | null;
  isLoading?: boolean;
}

export function ExperimentHistory({
  experiments,
  onSelect,
  onDelete,
  selectedId,
  isLoading = false,
}: ExperimentHistoryProps) {
  const router = useRouter();
  
  // Show only the first 3 experiments
  const displayedExperiments = experiments.slice(0, 3);
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Experiment History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (experiments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Experiment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No experiments yet</p>
            <p className="text-sm mt-2">Create your first experiment to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-none border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-gradient">Experiment History</span>
          <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800">
            {experiments.length} total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayedExperiments.map((experiment) => (
            <div
              key={experiment.id}
              className={`p-4 border rounded-lg transition-all cursor-pointer hover:shadow-md hover:-translate-y-1 ${
                selectedId === experiment.id
                  ? 'border-blue-500 bg-blue-50 shadow-blue-500/20'
                  : 'border-gray-200 hover:border-blue-300 bg-white/50'
              }`}
              onClick={() => onSelect(experiment.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium line-clamp-2">
                    {experiment.prompt}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(experiment.created_at), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(experiment.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {/* View All Button */}
          {experiments.length > 3 && (
            <div className="pt-3 border-t border-gray-200">
              <Button
                variant="outline"
                className="w-full bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-blue-200 text-blue-700 hover:text-blue-800"
                onClick={() => router.push('/history')}
              >
                <Eye className="h-4 w-4 mr-2" />
                View All ({experiments.length} experiments)
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

