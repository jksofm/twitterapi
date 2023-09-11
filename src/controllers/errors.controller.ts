import { NextFunction, Request, Response } from 'express'
import httpStatusCode from '~/constants/httpStatusCode'
import { omit } from 'lodash'
export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || httpStatusCode.INTERNAL_SERVER_ERROR).json(omit(err,['status']))
}
