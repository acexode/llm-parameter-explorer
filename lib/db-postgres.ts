import { Pool } from 'pg';
import { Experiment, Response } from '@/types';

// PostgreSQL database connection
let pool: Pool;
let isInitialized = false;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
}

async function initializeDatabase() {
  if (isInitialized) return;
  
  const client = await pool.connect();
  
  try {
    // Create experiments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS experiments (
        id TEXT PRIMARY KEY,
        prompt TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create responses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS responses (
        id TEXT PRIMARY KEY,
        experiment_id TEXT NOT NULL,
        temperature REAL NOT NULL,
        top_p REAL NOT NULL,
        content TEXT NOT NULL,
        metrics TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better query performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_responses_experiment_id 
      ON responses(experiment_id)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_experiments_created_at 
      ON experiments(created_at DESC)
    `);
    
    isInitialized = true;
  } finally {
    client.release();
  }
}

// Experiment operations
export async function createExperiment(id: string, prompt: string): Promise<Experiment> {
  const pool = getPool();
  await initializeDatabase();
  const client = await pool.connect();
  
  try {
    await client.query('INSERT INTO experiments (id, prompt) VALUES ($1, $2)', [id, prompt]);
    
    const result = await client.query('SELECT * FROM experiments WHERE id = $1', [id]);
    return result.rows[0] as Experiment;
  } finally {
    client.release();
  }
}

export async function getExperiment(id: string): Promise<Experiment | undefined> {
  const pool = getPool();
  await initializeDatabase();
  const client = await pool.connect();
  
  try {
    const result = await client.query('SELECT * FROM experiments WHERE id = $1', [id]);
    return result.rows[0] as Experiment | undefined;
  } finally {
    client.release();
  }
}

export async function getAllExperiments(limit = 50, offset = 0): Promise<Experiment[]> {
  const pool = getPool();
  await initializeDatabase();
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT * FROM experiments 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    return result.rows as Experiment[];
  } finally {
    client.release();
  }
}

export async function deleteExperiment(id: string): Promise<void> {
  const pool = getPool();
  await initializeDatabase();
  const client = await pool.connect();
  
  try {
    await client.query('DELETE FROM experiments WHERE id = $1', [id]);
  } finally {
    client.release();
  }
}

// Response operations
export async function createResponse(response: Omit<Response, 'created_at'>): Promise<Response> {
  const pool = getPool();
  await initializeDatabase();
  const client = await pool.connect();
  
  try {
    await client.query(`
      INSERT INTO responses (id, experiment_id, temperature, top_p, content, metrics)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      response.id,
      response.experiment_id,
      response.temperature,
      response.top_p,
      response.content,
      JSON.stringify(response.metrics)
    ]);
    
    const result = await client.query('SELECT * FROM responses WHERE id = $1', [response.id]);
    const dbResponse = result.rows[0];
    
    return {
      ...dbResponse,
      metrics: JSON.parse(dbResponse.metrics)
    } as Response;
  } finally {
    client.release();
  }
}

export async function getResponsesByExperimentId(experimentId: string): Promise<Response[]> {
  const pool = getPool();
  await initializeDatabase();
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'SELECT * FROM responses WHERE experiment_id = $1 ORDER BY created_at ASC',
      [experimentId]
    );
    
    return result.rows.map((row: { id: string; experiment_id: string; temperature: number; top_p: number; content: string; metrics: string; created_at: string }) => ({
      ...row,
      metrics: JSON.parse(row.metrics)
    })) as Response[];
  } finally {
    client.release();
  }
}

export async function getExperimentWithResponses(id: string) {
  const experiment = await getExperiment(id);
  if (!experiment) return null;
  
  const responses = await getResponsesByExperimentId(id);
  
  return {
    ...experiment,
    responses
  };
}
