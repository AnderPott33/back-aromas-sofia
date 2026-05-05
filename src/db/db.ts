import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import dotenv from 'dotenv';
dotenv.config();
neonConfig.webSocketConstructor = ws;
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  options: "-c timezone=America/Sao_Paulo",
  ssl: { rejectUnauthorized: false }
});
export const query = (text: string, params?: any[]) => pool.query(text, params);
export { pool };