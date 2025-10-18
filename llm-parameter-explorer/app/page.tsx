'use client';

import { useState } from 'react';
import { ExperimentForm } from '@/components/ExperimentForm';
import { ResponseCard } from '@/components/ResponseCard';
import { ComparisonView } from '@/components/ComparisonView';
import { ExperimentHistory } from '@/components/ExperimentHistory';
import { ExportButton } from '@/components/ExportButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  useExperiments,
  useExperiment,
  useGenerateExperiment,
  useDeleteExperiment,
} from '@/hooks/useExperiments';
import { toast } from 'sonner';
import { Sparkles, AlertCircle } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('new');
  const [selectedExperimentId, setSelectedExperimentId] = useState<string | null>(null);
  const [selectedResponses, setSelectedResponses] = useState<string[]>([]);

  const { data: experiments, isLoading: experimentsLoading } = useExperiments();
  const { data: selectedExperiment, isLoading: experimentLoading } =
    useExperiment(selectedExperimentId);
  const generateMutation = useGenerateExperiment();
  const deleteMutation = useDeleteExperiment();

  const handleGenerate = async (data: {
    prompt: string;
    temperatureMin: number;
    temperatureMax: number;
    topPMin: number;
    topPMax: number;
    variations: number;
  }) => {
    try {
      const result = await generateMutation.mutateAsync(data);
      toast.success('Responses generated successfully!', {
        description: `Created ${result.responses.length} variations`,
      });
      setSelectedExperimentId(result.experiment.id);
      setActiveTab('results');
    } catch (error) {
      console.error('Generation error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to generate responses';
      toast.error('Generation failed', {
        description: errorMessage,
      });
    }
  };

  const handleSelectExperiment = (id: string) => {
    setSelectedExperimentId(id);
    setSelectedResponses([]);
    setActiveTab('results');
  };

  const handleDeleteExperiment = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Experiment deleted');
      if (selectedExperimentId === id) {
        setSelectedExperimentId(null);
      }
    } catch {
      toast.error('Failed to delete experiment');
    }
  };

  const toggleResponseSelection = (responseId: string) => {
    setSelectedResponses((prev) =>
      prev.includes(responseId)
        ? prev.filter((id) => id !== responseId)
        : [...prev, responseId]
    );
  };

  const selectedResponsesData =
    selectedExperiment?.responses.filter((r) =>
      selectedResponses.includes(r.id)
    ) || [];

  // Sort responses by overall score for ranking
  const sortedResponses = selectedExperiment
    ? [...selectedExperiment.responses].sort(
        (a, b) => b.metrics.overallScore - a.metrics.overallScore
      )
    : [];

  const topPerformerId = sortedResponses[0]?.id;
  const bottomPerformerId = sortedResponses[sortedResponses.length - 1]?.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">LLM Parameter Explorer</h1>
                <p className="text-sm text-muted-foreground">
                  Experiment with parameters and analyze response quality
                </p>
              </div>
            </div>
            {selectedExperiment && activeTab === 'results' && (
              <ExportButton experimentId={selectedExperiment.id} />
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - History */}
          <div className="lg:col-span-1">
            <ExperimentHistory
              experiments={experiments || []}
              onSelect={handleSelectExperiment}
              onDelete={handleDeleteExperiment}
              selectedId={selectedExperimentId}
              isLoading={experimentsLoading}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="new">New Experiment</TabsTrigger>
                <TabsTrigger value="results" disabled={!selectedExperiment}>
                  Results
                </TabsTrigger>
                <TabsTrigger
                  value="comparison"
                  disabled={selectedResponses.length < 2}
                >
                  Compare ({selectedResponses.length})
                </TabsTrigger>
              </TabsList>

              {/* New Experiment Tab */}
              <TabsContent value="new" className="space-y-4">
                <ExperimentForm
                  onSubmit={handleGenerate}
                  isLoading={generateMutation.isPending}
                />

                {generateMutation.isPending && (
                  <Card>
                    <CardContent className="py-8">
                      <div className="flex items-center justify-center gap-3 text-muted-foreground">
                        <Sparkles className="h-5 w-5 animate-pulse" />
                        <span>Generating responses with OpenAI...</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Results Tab */}
              <TabsContent value="results" className="space-y-4">
                {experimentLoading && (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-64 w-full" />
                    ))}
                  </div>
                )}

                {selectedExperiment && !experimentLoading && (
                  <>
                    {/* Experiment Info */}
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold mb-2">Prompt:</h3>
                              <p className="text-sm text-muted-foreground">
                                {selectedExperiment.prompt}
                              </p>
                            </div>
                            <Badge variant="secondary">
                              {selectedExperiment.responses.length} responses
                            </Badge>
                          </div>
                          
                          {selectedExperiment.responses.length > 1 && (
                            <div className="pt-3 border-t">
                              <p className="text-sm text-muted-foreground mb-2">
                                Select responses to compare:
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setSelectedResponses(
                                    selectedResponses.length ===
                                      selectedExperiment.responses.length
                                      ? []
                                      : selectedExperiment.responses.map((r) => r.id)
                                  )
                                }
                              >
                                {selectedResponses.length ===
                                selectedExperiment.responses.length
                                  ? 'Deselect All'
                                  : 'Select All'}
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Responses */}
                    <div className="space-y-4">
                      {sortedResponses.map((response, index) => (
                        <div key={response.id} className="space-y-2">
                          {selectedExperiment.responses.length > 1 && (
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`select-${response.id}`}
                                checked={selectedResponses.includes(response.id)}
                                onCheckedChange={() =>
                                  toggleResponseSelection(response.id)
                                }
                              />
                              <label
                                htmlFor={`select-${response.id}`}
                                className="text-sm text-muted-foreground cursor-pointer"
                              >
                                Select for comparison
                              </label>
                            </div>
                          )}
                          <ResponseCard
                            response={response}
                            rank={index + 1}
                            isTopPerformer={response.id === topPerformerId && sortedResponses.length > 1}
                            isBottomPerformer={
                              response.id === bottomPerformerId && sortedResponses.length > 1
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {!selectedExperiment && !experimentLoading && (
                  <Card>
                    <CardContent className="py-12">
                      <div className="text-center text-muted-foreground">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No experiment selected</p>
                        <p className="text-sm mt-2">
                          Create a new experiment or select from history
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Comparison Tab */}
              <TabsContent value="comparison">
                <ComparisonView responses={selectedResponsesData} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>LLM Parameter Explorer - Built with Next.js, OpenAI, and shadcn/ui</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
