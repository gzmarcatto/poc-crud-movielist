import { Pool } from 'pg';
import { Movie } from '../models/movie';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'moviesPoc',
  password: 'postgres',
  port: 5432,
});

export class MovieController {
  private async executeQuery(query: string, params: any[] = []): Promise<any> {
    const client = await pool.connect();
    try {
      const result = await client.query(query, params);
      return result;
    } finally {
      client.release();
    }
  }

  async getMovies(): Promise<Movie[]> {
    const result = await this.executeQuery('SELECT * FROM movies');
    return result.rows;
  }

  async getMovieById(id: number): Promise<Movie | null> {
    const result = await this.executeQuery('SELECT * FROM movies WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return null;
    }
    return result.rows[0];
  }

  async createMovie(movie: Movie): Promise<Movie> {
    const result = await this.executeQuery(
      'INSERT INTO movies (title, watched) VALUES ($1, $2) RETURNING id',
      [movie.title, movie.watched]
    );
    movie.id = result.rows[0].id;
    return movie;
  }

  async updateMovieById(id: number, movie: Movie): Promise<Movie | null> {
    const result = await this.executeQuery(
      'UPDATE movies SET title = $1, watched = $2 WHERE id = $3 RETURNING *',
      [movie.title, movie.watched, id]
    );
    if (result.rowCount === 0) {
      return null;
    }
    return result.rows[0];
  }

  async deleteMovieById(id: number): Promise<boolean> {
    const result = await this.executeQuery('DELETE FROM movies WHERE id = $1', [id]);
    return result.rowCount === 1;
  }
}
