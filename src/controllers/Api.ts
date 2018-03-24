/**
 * API controller
 *
 * @author Evan MacGregor
 */
import { Response, Request, NextFunction } from 'express';

import * as gameController from './Game';

/**
 * GET /api
 *
 * List of API examples.
 */
export let getApi = (req: Request, res: Response) => {
  // res.render('api/index', {
  //   title: 'API Examples'
  // });
  // TODO: Update with React SSR
};

/**
 * GET /api/game/:id
 *
 * Forward to Game controller.
 */
export let forwardGetGame = (req: Request, res: Response) => {
  return gameController.getGame(req, res);
};

/**
 * POST /api/game/action
 *
 * Forward to Game controller.
 */
export let forwardPostAction = (req: Request, res: Response) => {
  return gameController.getGame(req, res);
};
