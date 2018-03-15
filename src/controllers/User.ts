import { Request, Response } from 'express';

/**
 * GET /user/:name
 * User by name
 */
export let getUser = (req: Request, res: Response) => {
  res.render('user', {
    title: 'User'
  });
};
