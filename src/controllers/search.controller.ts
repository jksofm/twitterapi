import { NextFunction, Request, Response } from 'express'

import { catchAsync } from '~/utils/catchAsync'
import { ParamsDictionary } from 'express-serve-static-core'
import searchService from '~/services/search.services'
import { searchMessages } from '~/constants/messages'

export const searchController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { content, limit, page } = req.query
  // console.log(req.query)
  const result = await searchService.search({
    content: req.query.content as string,
    limit: Number(limit),
    page: Number(page)
  })

  res.json({
    message: searchMessages.SUCCESS,
    result
  })
})
