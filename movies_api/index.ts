'use strict';

import express, { Request, Response } from 'express';
import * as genres from './routes/genres';
import * as ratings from './routes/ratings';
import * as movies from './routes/movies';
import { Database, OPEN_READONLY } from 'sqlite3';

const app = express();
const PORT = process.env.PORT || 3000;

const ratingsDB = new Database('./movies_api/db/ratings.db', OPEN_READONLY, (err: Error | null) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Database opened successfully');
    }
});

const moviesDB = new Database('./movies_api/db/movies.db', OPEN_READONLY, (err: Error | null) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Database opened successfully');
  }
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the movie API!');
});

app.get('/genres/all', (req: Request, res: Response) => { 
  genres.getGenreList(moviesDB, req, res)
});

app.get('/heartbeat', (req: Request, res: Response) => { 
  res.send('Have fun with the project!');
});

app.get('/ratings/:movieId', (req: Request, res: Response) => {
  ratings.getRating(ratingsDB, req, res)
});

app.get('/movies/all', (req: Request, res: Response) => {
  movies.getAllMovies(moviesDB, req, res)
});

app.get('/movies/:movieId', (req: Request, res: Response) => {
  movies.getMovie(moviesDB, req, res)
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.get('/moviesByPage', (req: Request, res: Response) => {
  movies.getPaginatedMovies(moviesDB, req, res)
}); 

app.get('/movieDetailsWithRatings/:movieId', (req: Request, res: Response) => {
  moviesDB.exec(`ATTACH DATABASE './movies_api/db/ratings.db' AS ratingsdb`);
  movies.getMovieDetailsWithRatings(moviesDB, req, res)
}); 

app.get('/moviesByYear/:year', (req: Request, res: Response) => {
  movies.getMoviesByYear(moviesDB, req, res)
}); 

app.get('/moviesByGenre/:genre', (req: Request, res: Response) => {
  movies.getMoviesByGenre(moviesDB, req, res)
}); 