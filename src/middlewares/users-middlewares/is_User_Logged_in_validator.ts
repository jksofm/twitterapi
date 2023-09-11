import { NextFunction, Response, Request } from 'express'

export const isUserLoggedInValidator = (middleware: (req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    //req.header vs req.headers

    if (req.headers.authorization) {
      return middleware(req, res, next)
    }

    next()
  }
}
