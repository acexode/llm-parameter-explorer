import { Experiment, Response } from '@/types';

// Database abstraction layer
class DatabaseService {
  private static instance: DatabaseService;
  private isPostgres: boolean;

  private constructor() {
    this.isPostgres = !!process.env.DATABASE_URL;
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Experiment operations
  async createExperiment(id: string, prompt: string): Promise<Experiment> {
    if (this.isPostgres) {
      const { createExperiment } = await import('./db-postgres');
      return createExperiment(id, prompt);
    } else {
      const { createExperiment } = await import('./db-sqlite');
      return createExperiment(id, prompt);
    }
  }

  async getExperiment(id: string): Promise<Experiment | undefined> {
    if (this.isPostgres) {
      const { getExperiment } = await import('./db-postgres');
      return getExperiment(id);
    } else {
      const { getExperiment } = await import('./db-sqlite');
      return getExperiment(id);
    }
  }

  async getAllExperiments(limit = 50, offset = 0): Promise<Experiment[]> {
    if (this.isPostgres) {
      const { getAllExperiments } = await import('./db-postgres');
      return getAllExperiments(limit, offset);
    } else {
      const { getAllExperiments } = await import('./db-sqlite');
      return getAllExperiments(limit, offset);
    }
  }

  async deleteExperiment(id: string): Promise<void> {
    if (this.isPostgres) {
      const { deleteExperiment } = await import('./db-postgres');
      return deleteExperiment(id);
    } else {
      const { deleteExperiment } = await import('./db-sqlite');
      return deleteExperiment(id);
    }
  }

  // Response operations
  async createResponse(response: Omit<Response, 'created_at'>): Promise<Response> {
    if (this.isPostgres) {
      const { createResponse } = await import('./db-postgres');
      return createResponse(response);
    } else {
      const { createResponse } = await import('./db-sqlite');
      return createResponse(response);
    }
  }

  async getResponsesByExperimentId(experimentId: string): Promise<Response[]> {
    if (this.isPostgres) {
      const { getResponsesByExperimentId } = await import('./db-postgres');
      return getResponsesByExperimentId(experimentId);
    } else {
      const { getResponsesByExperimentId } = await import('./db-sqlite');
      return getResponsesByExperimentId(experimentId);
    }
  }

  async getExperimentWithResponses(id: string) {
    if (this.isPostgres) {
      const { getExperimentWithResponses } = await import('./db-postgres');
      return getExperimentWithResponses(id);
    } else {
      const { getExperimentWithResponses } = await import('./db-sqlite');
      return getExperimentWithResponses(id);
    }
  }
}

// Export singleton instance methods
const db = DatabaseService.getInstance();

export const createExperiment = (id: string, prompt: string) => db.createExperiment(id, prompt);
export const getExperiment = (id: string) => db.getExperiment(id);
export const getAllExperiments = (limit = 50, offset = 0) => db.getAllExperiments(limit, offset);
export const deleteExperiment = (id: string) => db.deleteExperiment(id);
export const createResponse = (response: Omit<Response, 'created_at'>) => db.createResponse(response);
export const getResponsesByExperimentId = (experimentId: string) => db.getResponsesByExperimentId(experimentId);
export const getExperimentWithResponses = (id: string) => db.getExperimentWithResponses(id);
