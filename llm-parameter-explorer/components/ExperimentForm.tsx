'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

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
  const [temperatureMin, setTemperatureMin] = useState(0.7);
  const [temperatureMax, setTemperatureMax] = useState(1.0);
  const [topPMin, setTopPMin] = useState(0.8);
  const [topPMax, setTopPMax] = useState(1.0);
  const [variations, setVariations] = useState(4);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!prompt.trim()) {
      newErrors.prompt = 'Prompt is required';
    } else if (prompt.length > 2000) {
      newErrors.prompt = 'Prompt is too long (max 2000 characters)';
    }

    if (temperatureMin > temperatureMax) {
      newErrors.temperature = 'Min temperature cannot be greater than max';
    }

    if (topPMin > topPMax) {
      newErrors.topP = 'Min top_p cannot be greater than max';
    }

    if (variations < 1 || variations > 10) {
      newErrors.variations = 'Variations must be between 1 and 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        prompt,
        temperatureMin,
        temperatureMax,
        topPMin,
        topPMax,
        variations,
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create New Experiment</CardTitle>
        <CardDescription>
          Configure parameters to generate and compare multiple LLM responses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Enter your prompt here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="resize-none"
              disabled={isLoading}
            />
            {errors.prompt && (
              <p className="text-sm text-destructive">{errors.prompt}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {prompt.length}/2000 characters
            </p>
          </div>

          {/* Temperature Range */}
          <div className="space-y-4">
            <div>
              <Label>Temperature Range</Label>
              <p className="text-xs text-muted-foreground mb-3">
                Controls randomness: 0 is focused, 2 is very creative
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="temp-min" className="text-sm">Min</Label>
                <span className="text-sm font-mono">{temperatureMin.toFixed(2)}</span>
              </div>
              <Slider
                id="temp-min"
                min={0}
                max={2}
                step={0.1}
                value={[temperatureMin]}
                onValueChange={([value]) => setTemperatureMin(value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="temp-max" className="text-sm">Max</Label>
                <span className="text-sm font-mono">{temperatureMax.toFixed(2)}</span>
              </div>
              <Slider
                id="temp-max"
                min={0}
                max={2}
                step={0.1}
                value={[temperatureMax]}
                onValueChange={([value]) => setTemperatureMax(value)}
                disabled={isLoading}
              />
            </div>
            
            {errors.temperature && (
              <p className="text-sm text-destructive">{errors.temperature}</p>
            )}
          </div>

          {/* Top P Range */}
          <div className="space-y-4">
            <div>
              <Label>Top P Range</Label>
              <p className="text-xs text-muted-foreground mb-3">
                Controls diversity: lower values = more focused, higher = more diverse
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="topp-min" className="text-sm">Min</Label>
                <span className="text-sm font-mono">{topPMin.toFixed(2)}</span>
              </div>
              <Slider
                id="topp-min"
                min={0}
                max={1}
                step={0.05}
                value={[topPMin]}
                onValueChange={([value]) => setTopPMin(value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="topp-max" className="text-sm">Max</Label>
                <span className="text-sm font-mono">{topPMax.toFixed(2)}</span>
              </div>
              <Slider
                id="topp-max"
                min={0}
                max={1}
                step={0.05}
                value={[topPMax]}
                onValueChange={([value]) => setTopPMax(value)}
                disabled={isLoading}
              />
            </div>

            {errors.topP && (
              <p className="text-sm text-destructive">{errors.topP}</p>
            )}
          </div>

          {/* Variations Count */}
          <div className="space-y-2">
            <Label htmlFor="variations">Number of Variations</Label>
            <Input
              id="variations"
              type="number"
              min={1}
              max={10}
              value={variations}
              onChange={(e) => setVariations(parseInt(e.target.value) || 1)}
              disabled={isLoading}
            />
            {errors.variations && (
              <p className="text-sm text-destructive">{errors.variations}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Generate up to 10 different responses with varied parameters
            </p>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading} size="lg">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Responses...
              </>
            ) : (
              'Generate Responses'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

