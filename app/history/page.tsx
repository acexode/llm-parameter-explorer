'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Experiment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, Clock, FileText, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useExperiments, useDeleteExperiment } from '@/hooks/useExperiments';
import { toast } from 'sonner';

export default function HistoryPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const { data: experiments, isLoading: experimentsLoading } = useExperiments();
  const deleteMutation = useDeleteExperiment();

  const handleSelectExperiment = (id: string) => {
    // Navigate back to main page with results tab active
    router.push(`/?tab=results&experiment=${id}`);
  };

  const handleDeleteExperiment = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Experiment deleted');
      if (selectedId === id) {
        setSelectedId(null);
      }
    } catch {
      toast.error('Failed to delete experiment');
    }
  };

  if (experimentsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Experiment History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Main
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Experiment History
          </h1>
          <p className="text-gray-600 mt-2">
            View and manage all your experiments
          </p>
        </div>

        {/* History Card */}
        <Card className="shadow-none border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-gradient">All Experiments</span>
              <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800">
                {experiments?.length || 0} total
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!experiments || experiments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No experiments yet</p>
                <p className="text-sm mt-2">Create your first experiment to get started</p>
                <Button
                  className="mt-4"
                  onClick={() => router.push('/')}
                >
                  Go to Main Page
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {experiments.map((experiment) => (
                  <div
                    key={experiment.id}
                    className={`p-4 border rounded-lg transition-all cursor-pointer hover:shadow-md hover:-translate-y-1 ${
                      selectedId === experiment.id
                        ? 'border-blue-500 bg-blue-50 shadow-blue-500/20'
                        : 'border-gray-200 hover:border-blue-300 bg-white/50'
                    }`}
                    onClick={() => handleSelectExperiment(experiment.id)}
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
                          handleDeleteExperiment(experiment.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
