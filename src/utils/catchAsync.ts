import { Request, Response, NextFunction } from 'express'

type Func = (req: Request, res: Response, next: NextFunction) => Promise<void>
export const catchAsync = (func: Func) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
