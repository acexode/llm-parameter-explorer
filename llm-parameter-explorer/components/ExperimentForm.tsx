'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Minus, Zap, Target, FileText, Play, ArrowRight } from 'lucide-react';

interface ExperimentFormProps {
  onSubmit: (data: {
    prompt: string;
    temperatureMin: number;
    temperatureMax: number;
    topPMin: number;
    topPMax: number;
    variations: number;
  }) => void;
  isLoading?: boolean;
}

export function ExperimentForm({ onSubmit, isLoading = false }: ExperimentFormProps) {
  const [prompt, setPrompt] = useState('');
  const [temperatureValues, setTemperatureValues] = useState([0.3, 0.7, 1.0]);
  const [topPValues, setTopPValues] = useState([0.5, 0.9]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!prompt.trim()) {
      newErrors.prompt = 'Prompt is required';
    } else if (prompt.length > 2000) {
      newErrors.prompt = 'Prompt is too long (max 2000 characters)';
    }

    if (temperatureValues.length === 0) {
      newErrors.temperature = 'At least one temperature value is required';
    }

    if (topPValues.length === 0) {
      newErrors.topP = 'At least one top_p value is required';
    }

    const totalCombinations = temperatureValues.length * topPValues.length;
    if (totalCombinations > 10) {
      newErrors.combinations = 'Too many combinations (max 10)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        prompt,
        temperatureMin: Math.min(...temperatureValues),
        temperatureMax: Math.max(...temperatureValues),
        topPMin: Math.min(...topPValues),
        topPMax: Math.max(...topPValues),
        variations: temperatureValues.length * topPValues.length,
      });
    }
  };

  const addTemperatureValue = () => {
    if (temperatureValues.length < 5) {
      setTemperatureValues([...temperatureValues, 1.0]);
    }
  };

  const removeTemperatureValue = (index: number) => {
    if (temperatureValues.length > 1) {
      setTemperatureValues(temperatureValues.filter((_, i) => i !== index));
    }
  };

  const addTopPValue = () => {
    if (topPValues.length < 5) {
      setTopPValues([...topPValues, 0.9]);
    }
  };

  const removeTopPValue = (index: number) => {
    if (topPValues.length > 1) {
      setTopPValues(topPValues.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-6">
      {/* Prompt Input */}
      <Card className="w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Prompt Configuration</CardTitle>
              <CardDescription>
                Enter your prompt to test different parameter combinations
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Textarea
                id="prompt"
                placeholder="Enter your prompt here... (e.g., 'Explain the concept of machine learning')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="resize-none border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                disabled={isLoading}
              />
              {errors.prompt && (
                <p className="text-sm text-destructive">{errors.prompt}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {prompt.length}/2000 characters
              </p>
            </div>

            {/* Parameter Configuration */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Temperature */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Temperature Values</CardTitle>
                      <CardDescription className="text-sm">
                        Controls randomness and creativity
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {temperatureValues.map((temp, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Value {idx + 1}</Label>
                        <span className="text-sm font-mono font-bold">{temp.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Slider
                          min={0}
                          max={2}
                          step={0.1}
                          value={[temp]}
                          onValueChange={([value]) => {
                            const newValues = [...temperatureValues];
                            newValues[idx] = value;
                            setTemperatureValues(newValues);
                          }}
                          disabled={isLoading}
                          className="flex-1"
                        />
                        {temperatureValues.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTemperatureValue(idx)}
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {temperatureValues.length < 5 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTemperatureValue}
                      className="w-full border-dashed border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Temperature Value
                    </Button>
                  )}
                  
                  {errors.temperature && (
                    <p className="text-sm text-destructive">{errors.temperature}</p>
                  )}
                  
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-xs text-gray-700">
                      <strong>Temperature</strong> controls randomness. Higher values (1.0+) create more creative, diverse responses. Lower values (0.1-0.5) produce focused, consistent outputs.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Top P */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Top-P Values</CardTitle>
                      <CardDescription className="text-sm">
                        Controls token selection diversity
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topPValues.map((topP, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Value {idx + 1}</Label>
                        <span className="text-sm font-mono font-bold">{topP.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Slider
                          min={0}
                          max={1}
                          step={0.05}
                          value={[topP]}
                          onValueChange={([value]) => {
                            const newValues = [...topPValues];
                            newValues[idx] = value;
                            setTopPValues(newValues);
                          }}
                          disabled={isLoading}
                          className="flex-1"
                        />
                        {topPValues.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTopPValue(idx)}
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {topPValues.length < 5 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTopPValue}
                      className="w-full border-dashed border-2 border-gray-300 hover:border-purple-500 hover:bg-purple-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Top-P Value
                    </Button>
                  )}
                  
                  {errors.topP && (
                    <p className="text-sm text-destructive">{errors.topP}</p>
                  )}
                  
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-gray-700">
                      <strong>Top-P</strong> (nucleus sampling) limits token selection to the most probable options. Lower values (0.1-0.5) are more deterministic; higher values (0.9-1.0) allow more variety.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">Experiment Summary</h4>
                  <p className="text-sm text-gray-600">
                    {temperatureValues.length} temperature × {topPValues.length} top-p = {temperatureValues.length * topPValues.length} combinations
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gradient">
                    {temperatureValues.length * topPValues.length}
                  </div>
                  <div className="text-xs text-gray-500">responses</div>
                </div>
              </div>
              {errors.combinations && (
                <p className="text-sm text-destructive mt-2">{errors.combinations}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
              disabled={isLoading} 
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating {temperatureValues.length * topPValues.length} responses...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Run Experiment ({temperatureValues.length * topPValues.length} combinations)
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

