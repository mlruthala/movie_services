'use strict';

import { Database } from 'sqlite3';
import { Request, Response } from 'express';

export const getAllMovies = (db: Database, req: Request, res: Response): void => {
  const query = 'SELECT * FROM movies LIMIT 100;';

  db.all(query, [], (err: Error | null, rows: any[]) => {
    if (err) {
      res.status(500).send(JSON.stringify(err));
      return; // Ensure to return after sending a response
    }

    console.log(rows);
    if (rows.length === 0) {
      res.status(404).send('No movies found'); // Send a response for 404
      return; // Ensure to return after sending a response
    }

    res.send(rows);
  });
};

export const getMovie = (db: Database, req: Request, res: Response): void => {
  const query = 'SELECT * FROM movies WHERE movieId = ?';

  db.all(query, [req.params.movieId], (err: Error | null, rows: any[]) => {
    if (err) {
      res.status(500).send(JSON.stringify(err));
      return; // Ensure to return after sending a response
    }

    if (rows.length === 0) {
      res.status(404).send('Movie not found'); // Send a response for 404
      return; // Ensure to return after sending a response
    }

    res.send(rows);
  });
};



export const getPaginatedMovies = (db: Database, req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = 50;
  const offset = (page - 1) * pageSize;
  

  db.get('SELECT COUNT(*) as count FROM movies', (err, result: any) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to count movies.' });
    }

    const totalMovies = result.count;
    const totalPages = Math.ceil(totalMovies / pageSize);
    const query = `
      SELECT imdbId, title, genres, releaseDate, budget
      FROM movies
      LIMIT ? OFFSET ?
    `;
    db.all(query, [pageSize, offset], (err, rows: any[]) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch movies.' });
      }

      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      });
    
      const formattedRows = rows.map(row => ({
        ...row,
        budget: formatter.format(row.budget), // e.g., $1,500,000.00
      }));
      res.json({
        page,
        pageSize,
        totalPages,
        totalMovies,
        movies: formattedRows, 
      });
    });
  });
};


export const getMovieDetailsWithRatings = (db: Database, req: Request, res: Response) => {
 
    const query = `
    SELECT 
    imdbId, title, overview as description, releaseDate, budget, 
    runtime, genres, language as original_Language,  productionCompanies,
   (SELECT ROUND(AVG(ratings.rating),2)  FROM ratings  WHERE ratings.movieId = movies.movieId) as average_rating
   FROM movies
    WHERE movieId = ?
    `;


    db.all(query, [req.params.movieId], (err, rows: any[]) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch movies.' });
      }

      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      });
    
      const formattedRows = rows.map(row => ({
        ...row,
        budget: formatter.format(row.budget), 
      }));
      res.json({

        movies: formattedRows, 
      });
    });

};


export const getMoviesByYear = (db: Database, req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = 50;
  const offset = (page - 1) * pageSize;
  
  const year = req.params.year; 
  if (!year || typeof year !== 'string' || year.trim() === '') {
    return res.status(400).json({ error: 'Invalid genre name' });
  }

  const stmt = db.prepare(`
    SELECT *
    FROM movies
    WHERE strftime('%Y', releaseDate) = ?
  `);
  stmt.all(year,pageSize,offset, (err:any, result: any[]) => {;
  
    if (err) {
      return res.status(500).json({ error: 'Failed to count movies.' });
    }

      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      });
    
      const formattedRows = result.map(row => ({
        ...row,
        budget: formatter.format(row.budget), // e.g., $1,500,000.00
      }));
      res.json({
        page,
        pageSize,
       
        movies: formattedRows, 
      });
    });

};

export const getMoviesByGenre = (db: Database, req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = 50;
  const offset = (page - 1) * pageSize;
  const genre = req.params.genre; 
  if (!genre || typeof genre !== 'string' || genre.trim() === '') {
    return res.status(400).json({ error: 'Invalid genre name' });
  }
  const stmt = db.prepare(`
    SELECT *
    FROM movies m,   json_each(m.genres)
    WHERE json_each.value ->> 'name' = ?
  `);
  stmt.all(genre,pageSize,offset, (err:any, result: any[]) => {;
  
    if (err) {
      return res.status(500).json({ error: 'Failed to count movies.' });
    }

      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      });
    
      const formattedRows = result.map(row => ({
        ...row,
        budget: formatter.format(row.budget), // e.g., $1,500,000.00
      }));
      res.json({
        page,
        pageSize,
       
        movies: formattedRows, 
      });
    });

};
