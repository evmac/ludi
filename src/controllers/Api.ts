import { Response, Request, NextFunction } from 'express';

import { getGame, postAction } from './GameController';

/**
 * GET /api
 * List of API examples.
 */
export let getApi = (req: Request, res: Response) => {
  res.render('api/index', {
    title: 'API Examples'
  });
};

/**
 * GET /api/game/:id
 * Forward to Game controller.
 */
export let forwardGetGame = (req: Request, res: Response) => {
  getGame(req, res);
};

/**
 * POST /api/game/action
 * Forward to Game controller.
 */
export let forwardPostAction = (req: Request, res: Response) => {
  getGame(req, res);
};
