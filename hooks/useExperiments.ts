import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { ExperimentWithResponses, GenerateRequest, GenerateResponse } from '@/types';

// Fetch all experiments
export function useExperiments() {
  return useQuery({
    queryKey: ['experiments'],
    queryFn: async () => {
      const { data } = await axios.get('/api/experiments');
      return data.experiments as ExperimentWithResponses[];
    },
  });
}

// Fetch single experiment
export function useExperiment(id: string | null) {
  return useQuery({
    queryKey: ['experiment', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await axios.get(`/api/experiments/${id}`);
      return data as ExperimentWithResponses;
    },
    enabled: !!id,
    staleTime: 0, // Always consider data stale
    refetchOnMount: true, // Always refetch when component mounts
  });
}

// Generate experiment mutation
export function useGenerateExperiment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (request: GenerateRequest) => {
      const { data } = await axios.post<GenerateResponse>('/api/generate', request);
      return data;
    },
    onSuccess: () => {
      // Invalidate experiments list to refresh
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
    },
  });
}

// Delete experiment mutation
export function useDeleteExperiment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/experiments/${id}`);
    },
    onSuccess: () => {
      // Invalidate experiments list to refresh
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
    },
  });
}

// Export experiment
export async function exportExperiment(id: string, format: 'json' | 'csv' = 'json') {
  const response = await axios.get(`/api/export/${id}?format=${format}`, {
    responseType: 'blob',
  });
  
  const blob = new Blob([response.data], {
    type: format === 'csv' ? 'text/csv' : 'application/json',
  });
  
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `experiment-${id}.${format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

