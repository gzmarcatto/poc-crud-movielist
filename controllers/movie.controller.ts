import { Pool } from 'pg';
import { Movie } from '../models/movie';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'moviesdb',
  password: 'postgres',
  port: 5432,
});

export class MovieController {
  async getMovies(): Promise<Movie[]> {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM movies');
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getMovieById(id: number): Promise<Movie | null> {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM movies WHERE id = $1', [id]);
      if (result.rowCount === 0) {
        return null;
      }
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async createMovie(movie: Movie): Promise<Movie> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO movies (title, completed) VALUES ($1, $2) RETURNING id',
        [movie.title, movie.completed]
      );
      movie.id = result.rows[0].id;
      return movie;
    } finally {
      client.release();
    }
  }

  async updateMovieById(id: number, movie: Movie): Promise<Movie | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'UPDATE movies SET title = $1, completed = $2 WHERE id = $3 RETURNING *',
        [movie.title, movie.completed, id]
      );
      if (result.rowCount === 0) {
        return null;
      }
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async deleteMovieById(id: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM movies WHERE id = $1', [id]);
      return result.rowCount === 1;
    } finally {
      client.release();
    }
  }
}