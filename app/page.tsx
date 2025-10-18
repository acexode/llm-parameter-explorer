'use client';

import { useState } from 'react';
import { ExperimentForm } from '@/components/ExperimentForm';
import { ResponseCard } from '@/components/ResponseCard';
import { ComparisonView } from '@/components/ComparisonView';
import { ExperimentHistory } from '@/components/ExperimentHistory';
import { ExportButton } from '@/components/ExportButton';
import { DataVisualization } from '@/components/DataVisualization';
import { MetricsHelpFab } from '@/components/MetricsHelpFab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  useExperiments,
  useExperiment,
  useGenerateExperiment,
  useDeleteExperiment,
} from '@/hooks/useExperiments';
import { toast } from 'sonner';
import { Sparkles, AlertCircle, History, ChevronDown, ChevronUp } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('new');
  const [selectedExperimentId, setSelectedExperimentId] = useState<string | null>(null);
  const [selectedResponses, setSelectedResponses] = useState<string[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  LLM Parameter Explorer
                </h1>
                <p className="text-sm text-gray-600">Visualize how parameters affect response quality</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2 bg-white/50 hover:bg-white/80"
                  >
                    <History className="w-4 h-4" />
                    <span>History</span>
                    {experiments && experiments.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {experiments.length}
                      </Badge>
                    )}
                    {isHistoryOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="absolute top-full right-6 mt-2 w-96 max-h-96 overflow-y-auto bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl shadow-xl z-50">
                  <div className="p-4">
                    <ExperimentHistory
                      experiments={experiments || []}
                      onSelect={(id) => {
                        handleSelectExperiment(id);
                        setIsHistoryOpen(false);
                      }}
                      onDelete={handleDeleteExperiment}
                      selectedId={selectedExperimentId}
                      isLoading={experimentsLoading}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
              {selectedExperiment && activeTab === 'results' && (
                <ExportButton experimentId={selectedExperiment.id} />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm">
              <TabsTrigger 
                value="new"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                New Experiment
              </TabsTrigger>
              <TabsTrigger 
                value="results"
                disabled={!selectedExperiment}
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                Results
              </TabsTrigger>
              <TabsTrigger 
                value="comparison"
                disabled={selectedResponses.length < 2}
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                Compare ({selectedResponses.length})
              </TabsTrigger>
            </TabsList>

            {/* New Experiment Tab */}
            <TabsContent value="new" className="space-y-6 animate-fadeIn">
              <ExperimentForm
                onSubmit={handleGenerate}
                isLoading={generateMutation.isPending}
              />

              {generateMutation.isPending && (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="py-12">
                    <div className="flex items-center justify-center gap-3 text-gray-600">
                      <Sparkles className="h-6 w-6 animate-pulse text-blue-600" />
                      <span className="text-lg font-medium">Generating responses with OpenAI...</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Results Tab */}
            <TabsContent value="results" className="space-y-6">
              {experimentLoading && (
                <div className="space-y-6">
                  {/* Loading Header */}
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="py-8">
                      <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="text-lg font-medium text-gray-600">Loading experiment data...</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Skeleton for Experiment Info */}
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-20 w-full" />
                          </div>
                          <Skeleton className="h-6 w-24" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Skeleton for Response Cards */}
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <Skeleton className="h-6 w-32" />
                                <div className="flex gap-2">
                                  <Skeleton className="h-5 w-20" />
                                  <Skeleton className="h-5 w-16" />
                                  <Skeleton className="h-5 w-24" />
                                </div>
                              </div>
                              <Skeleton className="h-8 w-8 rounded" />
                            </div>
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-20" />
                              <Skeleton className="h-16 w-full" />
                            </div>
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-24" />
                              <div className="grid grid-cols-2 gap-2">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {selectedExperiment && !experimentLoading && (
                <>
                  {/* Experiment Info */}
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold mb-2 text-gray-900">Prompt:</h3>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                              {selectedExperiment.prompt}
                            </p>
                          </div>
                          <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800">
                            {selectedExperiment.responses.length} responses
                          </Badge>
                        </div>
                        
                        {selectedExperiment.responses.length > 1 && (
                          <div className="pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-600 mb-2">
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
                              className="border-dashed border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50"
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

              {!selectedExperiment && !experimentLoading && !selectedExperimentId && (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="py-12">
                    <div className="text-center text-gray-600">
                      <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">No experiment selected</h3>
                      <p className="text-sm">
                        Create a new experiment or select from history
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Metrics Help FAB - Show in Results tab when experiment is selected */}
              {selectedExperiment && !experimentLoading && <MetricsHelpFab />}
            </TabsContent>

            {/* Comparison Tab */}
            <TabsContent value="comparison">
              <div className="space-y-6">
                {experimentLoading ? (
                  <div className="space-y-6">
                    {/* Loading Header */}
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardContent className="py-8">
                        <div className="flex items-center justify-center gap-3">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <span className="text-lg font-medium text-gray-600">Loading comparison data...</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Skeleton for Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-64 w-full" />
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-4 w-56" />
                            <Skeleton className="h-64 w-full" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Skeleton for Comparison Cards */}
                    <div className="space-y-4">
                      {[...Array(2)].map((_, i) => (
                        <Card key={i} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                          <CardContent className="pt-6">
                            <div className="space-y-4">
                              <Skeleton className="h-6 w-40" />
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Skeleton className="h-4 w-20" />
                                  <Skeleton className="h-8 w-full" />
                                </div>
                                <div className="space-y-2">
                                  <Skeleton className="h-4 w-20" />
                                  <Skeleton className="h-8 w-full" />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : selectedResponsesData.length > 0 ? (
                  <>
                    {/* Data Visualization for Selected Responses */}
                    <DataVisualization responses={selectedResponsesData} />
                    
                    {/* Comparison View */}
                    <ComparisonView responses={selectedResponsesData} />
                  </>
                ) : (
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="py-12">
                      <div className="text-center text-gray-600">
                        <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No responses selected</h3>
                        <p className="text-sm">
                          Go to the Results tab and select responses to compare them here
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {/* Metrics Help FAB - Show in Comparison tab when responses are selected */}
              {selectedResponsesData.length > 0 && <MetricsHelpFab />}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16 py-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center text-sm text-gray-600">
            <p>LLM Parameter Explorer - Built with Next.js, OpenAI, and shadcn/ui</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
