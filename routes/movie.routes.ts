import express, { Request, Response } from 'express';
import { MovieController } from '../controllers/movie.controller';
import { Movie } from '../models/movie';

const router = express.Router();
const movieController = new MovieController();

function wrapAsync(fn: Function) {
  return function(req: Request, res: Response, next: Function) {
    fn(req, res, next).catch(next);
  };
}

router.get('/movies', wrapAsync(movieController.getMovies));
router.get('/movies/:id', wrapAsync(movieController.getMovieById));
router.post('/movies', wrapAsync(movieController.createMovie));
router.put('/movies/:id', wrapAsync(movieController.updateMovieById));
router.delete('/movies/:id', wrapAsync(movieController.deleteMovieById));

export default router;
