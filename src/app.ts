import express, { Request, Response } from 'express';
import Joi from 'joi';
import { pool } from '../database';

interface Movie {
  id: number;
  description: string;
  completed: boolean;
}

const movieSchema = Joi.object({
  description: Joi.string().required(),
  completed: Joi.boolean().required(),
});

async function getMovies(): Promise<Movie[]> {
  const { rows } = await pool.query('SELECT * FROM movies ORDER BY id ASC');
  return rows;
}

async function getMovieById(id: number): Promise<Movie | null> {
  const { rows } = await pool.query('SELECT * FROM movies WHERE id = $1', [id]);
  if (rows.length) {
    return rows[0];
  } else {
    return null;
  }
}

async function createMovie(movie: Movie): Promise<Movie> {
  const { description, completed } = movie;
  const { rows } = await pool.query('INSERT INTO movies (description, completed) VALUES ($1, $2) RETURNING id', [description, completed]);
  const id = rows[0].id;
  return { id, description, completed };
}

async function updateMovieById(id: number, movie: Movie): Promise<Movie | null> {
  const { description, completed } = movie;
  const { rowCount } = await pool.query('UPDATE movies SET description = $1, completed = $2 WHERE id = $3', [description, completed, id]);
  if (rowCount) {
    return { id, description, completed };
  } else {
    return null;
  }
}

async function deleteMovieById(id: number): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM movies WHERE id = $1', [id]);
  return rowCount > 0;
}

const movieRouter = express.Router();

movieRouter.get('/', async (req: Request, res: Response<Movie[]>) => {
  const movies = await getMovies();
  res.send(movies);
});

movieRouter.get('/:id', async (req: Request<{ id: string }>, res: Response<Movie | string>) => {
  const id = parseInt(req.params.id);
  const movie = await getMovieById(id);
  if (movie) {
    res.send(movie);
  } else {
    res.status(404).send('Movie not found');
  }
});

movieRouter.post('/', async (req: Request<{}, {}, Movie>, res: Response<Movie | string>) => {
  try {
    const { error } = movieSchema.validate(req.body);
    if (error) {
      throw new Error(error.message);
    }
    const newMovie = await createMovie(req.body);
    res.send(newMovie);
  } catch (err: any) {
    res.status(400).send(err.message);
  }
});

movieRouter.put('/:id', async (req: Request<{ id: string }, {}, Movie>, res: Response<Movie | string>) => {
  const id = parseInt(req.params.id);
  try {
    const { error } = movieSchema.validate(req.body);
    if (error) {
      throw new Error(error.message);
    }
    const updatedMovie = await updateMovieById(id, req.body);
    if (updatedMovie) {
      res.send(updatedMovie);
    } else {
      res.status(404).send('Movie not found');
    }
  } catch (err: any) {
    res.status(400).send(err.message);
  }})