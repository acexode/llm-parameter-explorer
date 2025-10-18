'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { exportExperiment } from '@/hooks/useExperiments';
import { toast } from 'sonner';

interface ExportButtonProps {
  experimentId: string;
  disabled?: boolean;
}

export function ExportButton({ experimentId, disabled = false }: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: 'json' | 'csv') => {
    setExporting(true);
    try {
      await exportExperiment(experimentId, format);
      toast.success(`Experiment exported as ${format.toUpperCase()}`);
      setOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export experiment');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Experiment</DialogTitle>
          <DialogDescription>
            Choose a format to download your experiment data
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            className="h-auto flex-col items-start p-4 hover:bg-primary/5"
            onClick={() => handleExport('json')}
            disabled={exporting}
          >
            <div className="flex items-center gap-3 w-full">
              <FileJson className="h-8 w-8 text-blue-600" />
              <div className="text-left flex-1">
                <div className="font-semibold">JSON Format</div>
                <div className="text-xs text-muted-foreground">
                  Complete data with all responses and metrics
                </div>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col items-start p-4 hover:bg-primary/5"
            onClick={() => handleExport('csv')}
            disabled={exporting}
          >
            <div className="flex items-center gap-3 w-full">
              <FileSpreadsheet className="h-8 w-8 text-green-600" />
              <div className="text-left flex-1">
                <div className="font-semibold">CSV Format</div>
                <div className="text-xs text-muted-foreground">
                  Spreadsheet-friendly format for analysis
                </div>
              </div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

