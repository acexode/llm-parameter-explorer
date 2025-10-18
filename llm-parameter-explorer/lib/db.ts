import Database from 'better-sqlite3';
import path from 'path';
import { Experiment, Response } from '@/types';

// Initialize database
const dbPath = path.join(process.cwd(), 'data', 'experiments.db');
let db: Database.Database;

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export function getDatabase() {
  if (!db) {
    db = new Database(dbPath);
    initializeDatabase();
  }
  return db;
}

function initializeDatabase() {
  // Create experiments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS experiments (
      id TEXT PRIMARY KEY,
      prompt TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create responses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS responses (
      id TEXT PRIMARY KEY,
      experiment_id TEXT NOT NULL,
      temperature REAL NOT NULL,
      top_p REAL NOT NULL,
      content TEXT NOT NULL,
      metrics TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better query performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_responses_experiment_id 
    ON responses(experiment_id)
  `);
  
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_experiments_created_at 
    ON experiments(created_at DESC)
  `);
}

// Experiment operations
export function createExperiment(id: string, prompt: string): Experiment {
  const stmt = db.prepare('INSERT INTO experiments (id, prompt) VALUES (?, ?)');
  stmt.run(id, prompt);
  
  const result = db.prepare('SELECT * FROM experiments WHERE id = ?').get(id) as Experiment;
  return result;
}

export function getExperiment(id: string): Experiment | undefined {
  const stmt = db.prepare('SELECT * FROM experiments WHERE id = ?');
  return stmt.get(id) as Experiment | undefined;
}

export function getAllExperiments(limit = 50, offset = 0): Experiment[] {
  const stmt = db.prepare(`
    SELECT * FROM experiments 
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `);
  return stmt.all(limit, offset) as Experiment[];
}

export function deleteExperiment(id: string): void {
  const stmt = db.prepare('DELETE FROM experiments WHERE id = ?');
  stmt.run(id);
}

// Response operations
export function createResponse(response: Omit<Response, 'created_at'>): Response {
  const stmt = db.prepare(`
    INSERT INTO responses (id, experiment_id, temperature, top_p, content, metrics)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    response.id,
    response.experiment_id,
    response.temperature,
    response.top_p,
    response.content,
    JSON.stringify(response.metrics)
  );
  
  const result = db.prepare('SELECT * FROM responses WHERE id = ?').get(response.id) as DbResponse;
  return {
    ...result,
    metrics: JSON.parse(result.metrics)
  } as Response;
}

export function getResponsesByExperimentId(experimentId: string): Response[] {
  const stmt = db.prepare('SELECT * FROM responses WHERE experiment_id = ? ORDER BY created_at ASC');
  const results = stmt.all(experimentId) as DbResponse[];
  
  return results.map(result => ({
    ...result,
    metrics: JSON.parse(result.metrics)
  })) as Response[];
}

export function getExperimentWithResponses(id: string) {
  const experiment = getExperiment(id);
  if (!experiment) return null;
  
  const responses = getResponsesByExperimentId(id);
  
  return {
    ...experiment,
    responses
  };
}

interface DbResponse {
  id: string;
  experiment_id: string;
  temperature: number;
  top_p: number;
  content: string;
  metrics: string;
  created_at: string;
}

// Initialize database on import
getDatabase();

