import { Request, Response } from 'express';

/**
 * GET /game/:id
 * Game by ID
 */
export let getGame = (req: Request, res: Response) => {
  res.render('game', {
    title: 'Game'
  });
};

/**
 * POST /game/action
 * Submit a game action
 */
export let postAction = (req: Request, res: Response) => {};