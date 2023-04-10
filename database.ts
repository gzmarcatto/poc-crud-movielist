import { Pool } from 'pg';

export const pool = new Pool({
  port: 5432,
  user: 'user',
  password: 'admin',
  host: 'localhost',
  database: 'moviesPoc',
});