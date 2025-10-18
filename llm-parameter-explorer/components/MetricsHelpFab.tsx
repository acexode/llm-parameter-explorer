'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, X, BarChart3, CheckCircle, FileText, BookOpen, Target } from 'lucide-react';

export function MetricsHelpFab() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* FAB Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        size="icon"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <HelpCircle className="w-6 h-6" />
        )}
      </Button>

      {/* Help Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 max-w-[calc(100vw-2rem)]">
          <Card className="bg-white/95 backdrop-blur-md border-0 shadow-2xl max-h-[calc(100vh-8rem)] overflow-y-auto">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Understanding Quality Metrics
                </CardTitle>
                <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800">
                  Guide
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="p-1.5 rounded-full bg-blue-100">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Coherence Score (0-100)</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      Measures logical flow, sentence structure, and use of transition words. Higher scores indicate better-organized responses with clear connections between ideas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="p-1.5 rounded-full bg-green-100">
                    <FileText className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Completeness Score (0-100)</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      Evaluates how well the response addresses the prompt, considering topic coverage, response length, and whether it feels complete rather than cut off.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="p-1.5 rounded-full bg-purple-100">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Readability Score (0-100)</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      Uses a Flesch-Kincaid inspired formula analyzing sentence length and syllable count. Higher scores indicate more accessible, easier-to-read text.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <div className="p-1.5 rounded-full bg-orange-100">
                    <Target className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Lexical Diversity (0-100)</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      Measures vocabulary richness using type-token ratio. Higher scores indicate more varied vocabulary and sophisticated word choice.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
                  <div className="p-1.5 rounded-full bg-indigo-100">
                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Length Appropriateness (0-100)</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      Compares response length to prompt complexity. Evaluates whether the response is appropriately detailed for the given task.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <div className="p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    Overall Score Calculation
                  </h4>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Weighted average: Coherence (25%), Completeness (25%), Readability (20%), Lexical Diversity (15%), Length Appropriateness (15%)
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs text-gray-500 text-center">
                  💡 Tip: Higher scores generally indicate better quality responses, but consider the context and your specific needs.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
