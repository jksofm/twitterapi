import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'

import { ObjectId } from 'mongodb'
import { TweetAudience, TweetType } from '~/constants/enums'

import httpStatusCode from '~/constants/httpStatusCode'
import { tweetsMessages, usersMessages } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/interface/errors/Error'
import Tweet_schema from '~/models/schemas/Tweet.schema'

import { DB } from '~/services/database.services'
import { catchAsync } from '~/utils/catchAsync'

import { validate } from '~/utils/valitation'

export const validatorAudience = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log('audience')

  const tweet = req.tweet as Tweet_schema

  const { audience } = tweet

  if (audience === TweetAudience.TwitterCircle) {
    if (!req.decoded_authorization) {
      next(
        new ErrorWithStatus({
          message: tweetsMessages.USER_NOT_LOGGIN,
          status: httpStatusCode.UNAUTHORIZED
        })
      )
    }
    const user_id = req.decoded_authorization?.userId
    ///Check xem thu user_id cua người đăng nhập và user_id của tweet có trùng nhau hay không
    if (user_id !== tweet.user_id?.toString()) {
      const checkIfUserInCircle = await DB.tweetCircles.findOne({
        user_id: tweet.user_id,
        user_id_in_circle: user_id
      })
      if (checkIfUserInCircle === null) {
        next(
          new ErrorWithStatus({
            message: tweetsMessages.USER_NOT_IN_CIRCLE_OF_OWNER_OF_TWEET,
            status: httpStatusCode.UNAUTHORIZED
          })
        )
      }
    }
  }

  next()
})
