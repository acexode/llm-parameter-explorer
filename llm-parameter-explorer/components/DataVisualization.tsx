'use client';

import { Response } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
} from 'recharts';

interface DataVisualizationProps {
  responses: Response[];
}

export function DataVisualization({ responses }: DataVisualizationProps) {
  if (responses.length === 0) {
    return null;
  }

  // Prepare data for charts
  const barChartData = responses.map((response) => ({
    name: `T:${response.temperature} P:${response.top_p}`,
    score: response.metrics.overallScore,
    coherence: response.metrics.coherence.score,
    completeness: response.metrics.completeness.score,
    readability: response.metrics.readability.score,
    lexicalDiversity: response.metrics.lexicalDiversity.score,
    lengthAppropriate: response.metrics.lengthAppropriate.score,
  }));

  const bestResponse = responses.reduce((best, current) =>
    current.metrics.overallScore > best.metrics.overallScore ? current : best
  );

  const radarData = [
    { metric: 'Coherence', value: bestResponse.metrics.coherence.score },
    { metric: 'Lexical Diversity', value: bestResponse.metrics.lexicalDiversity.score },
    { metric: 'Completeness', value: bestResponse.metrics.completeness.score },
    { metric: 'Readability', value: bestResponse.metrics.readability.score },
    { metric: 'Length Appropriate', value: bestResponse.metrics.lengthAppropriate.score },
  ];

  const temperatureData = responses
    .sort((a, b) => a.temperature - b.temperature)
    .map((response) => ({
      temperature: response.temperature,
      overall: response.metrics.overallScore,
      coherence: response.metrics.coherence.score,
      completeness: response.metrics.completeness.score,
      lexicalDiversity: response.metrics.lexicalDiversity.score,
    }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900">{responses.length}</span>
            </div>
            <div className="text-sm font-medium text-gray-600 mt-2">Experiments Run</div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {Math.round(responses.reduce((acc, r) => acc + r.metrics.overallScore, 0) / responses.length)}
              </span>
            </div>
            <div className="text-sm font-medium text-gray-600 mt-2">Avg Overall Score</div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {Math.max(...responses.map(r => r.metrics.coherence.score))}
              </span>
            </div>
            <div className="text-sm font-medium text-gray-600 mt-2">Best Coherence</div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {Math.round(responses.reduce((acc, r) => acc + r.content.split(' ').length, 0) / responses.length)}
              </span>
            </div>
            <div className="text-sm font-medium text-gray-600 mt-2">Avg Word Count</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Overall Score Comparison */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Overall Quality by Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  tick={{fontSize: 11}} 
                  angle={-45} 
                  textAnchor="end" 
                  height={80} 
                />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar 
                  dataKey="score" 
                  fill="url(#colorGradient)" 
                  radius={[8, 8, 0, 0]} 
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Metric Breakdown Radar */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Metric Breakdown (Best Response)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis 
                  dataKey="metric" 
                  tick={{fontSize: 12, fontWeight: 600}} 
                />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar 
                  name="Score" 
                  dataKey="value" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  fillOpacity={0.6} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Temperature Impact Chart */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900">Temperature Impact on Quality Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={temperatureData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="temperature" 
                label={{ value: 'Temperature', position: 'insideBottom', offset: -5 }} 
              />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="coherence" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={{ r: 4 }} 
              />
              <Line 
                type="monotone" 
                dataKey="completeness" 
                stroke="#10b981" 
                strokeWidth={2} 
                dot={{ r: 4 }} 
              />
              <Line 
                type="monotone" 
                dataKey="lexicalDiversity" 
                stroke="#f59e0b" 
                strokeWidth={2} 
                dot={{ r: 4 }} 
              />
              <Line 
                type="monotone" 
                dataKey="overall" 
                stroke="#8b5cf6" 
                strokeWidth={2} 
                dot={{ r: 4 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
