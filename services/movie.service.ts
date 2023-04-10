import { Movie } from '../models/movie';
import { pool } from '../database';

export async function getMovies(): Promise<Movie[]> {
const client = await pool.connect();
try {
const result = await client.query('SELECT * FROM movies');
return result.rows;
} finally {
client.release();
}
}

export async function getMovieById(id: number): Promise<Movie | null> {
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

export async function createMovie(movie: Movie): Promise<Movie> {
const client = await pool.connect();
try {
const result = await client.query(
'INSERT INTO movies (title, watched) VALUES ($1, $2) RETURNING id',
[movie.title, movie.watched]
);
movie.id = result.rows[0].id;
return movie;
} finally {
client.release();
}
}

export async function updateMovieById(id: number, movie: Movie): Promise<Movie | null> {
const client = await pool.connect();
try {
const result = await client.query(
'UPDATE movies SET title = $1, watched = $2 WHERE id = $3 RETURNING *',
[movie.title, movie.watched, id]
);
if (result.rowCount === 0) {
return null;
}
return result.rows[0];
} finally {
client.release();
}
}

export async function deleteMovieById(id: number): Promise<boolean> {
const client = await pool.connect();
try {
const result = await client.query('DELETE FROM movies WHERE id = $1', [id]);
return result.rowCount === 1;
} finally {
client.release();
}
}