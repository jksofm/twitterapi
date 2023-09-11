import { NextFunction, Request, Response } from 'express'

import { catchAsync } from '~/utils/catchAsync'
import { ParamsDictionary } from 'express-serve-static-core'
import { tweetsMessages, usersMessages } from '~/constants/messages'
import { tweetsServices } from '~/services/tweets.services'
import { ObjectId } from 'mongodb'
import { TweetRequestBody } from '~/models/interface/requests/Tweets.requests'
import { TweetType } from '~/constants/enums'

export const createTweetController = catchAsync(
  async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response, next: NextFunction) => {
    const user_id = new ObjectId(req.decoded_authorization?.userId)

    const result = await tweetsServices.createTweet(req.body, user_id)
    res.json({
      message: tweetsMessages.CREATE_TWEET_SUCCESS,
      result
    })
  }
)
export const deleteTweetController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const tweet_id = req.params.tweetId
  const user_id = req.decoded_authorization?.userId
  await tweetsServices.deleteTweet(user_id, tweet_id)
  res.json({
    message: tweetsMessages.DELETE_TWEET_SUCCESS
  })
})

export const getTweetDetailController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (req.decoded_authorization) {
    const result = await tweetsServices.increaseView(
      req.tweet?._id?.toString() as string,
      req.decoded_authorization.userId
    )
    res.json({
      message: tweetsMessages.GET_TWEET_DETAIL_SUCCESS,
      result: {
        ...req.tweet,
        guest_views: result.guest_views,
        user_views: result.user_views,
        views: result.guest_views + result.user_views,
        updated_at: result.updated_at
      }
    })
  } else {
    const result = await tweetsServices.increaseView(req.tweet?._id?.toString() as string)
    res.json({
      message: tweetsMessages.GET_TWEET_DETAIL_SUCCESS,
      result: {
        ...req.tweet,
        guest_views: result.guest_views,
        user_views: result.user_views,
        views: result.guest_views + result.user_views
      }
    })
  }
})

export const createTweetCircleControllers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log('test')
  const user_id_in_circle = req.body.user_id_in_circle
  const user_id = req.decoded_authorization?.userId
  const result = await tweetsServices.addOtherUserToTweetCircle(user_id_in_circle, user_id)

  res.json({
    message: tweetsMessages.CREATE_TWEET_CIRCLE_SUCCESS,
    result
  })
})
export const deleteTweetCircleControllers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user_id_in_circle = req.params.user_id_in_circle
  const user_id = req.decoded_authorization?.userId
  const result = await tweetsServices.deleteOtherUserToTweetCircle(user_id_in_circle, user_id)

  res.json({
    message: tweetsMessages.DELETE_TWEET_CIRCLE_SUCCESS,
    result
  })
})
export const getTweetChildrenController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user_id = req.decoded_authorization ? req.decoded_authorization.user_id : null
  const { result, total } = await tweetsServices.getTweetChildren(
    req.params.tweetId,
    Number(req.query.type) as TweetType,
    Number(req.query.limit) as number,
    Number(req.query.page) as number,
    user_id
  )
  res.json({
    message: tweetsMessages.GET_CHILDREN_TWEET_SUCCESS,
    result,
    pagination: {
      TweetType: Number(req.query.type) as TweetType,
      page: Number(req.query.page) as number,
      limit: Number(req.query.limit) as number,
      total,
      total_page: Math.ceil(total / Number(req.query.type))
    }
  })
})
export const getNewFeedController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user_id = req.decoded_authorization?.userId
  const {total,tweets} = await tweetsServices.getNewFeed(user_id, Number(req.query.limit), Number(req.query.page))
  res.json({
    message: tweetsMessages.GET_NEW_FEED_SUCCESS,
    result : tweets,
    pagination: {
      limit: Number(req.query.limit) as number,
      page: Number(req.query.page) as number,
      total,
      total_page : Math.ceil(total / Number(req.query.limit))
    }
  })
})

export const createBookmarkController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const tweet_id = req.params.tweetId
  const user_id = req.decoded_authorization?.userId
  const result = await tweetsServices.createBookmark(tweet_id, user_id)
  res.json({
    message: tweetsMessages.CREATE_BOOKMARK_SUCCESS,
    result
  })
})
export const deleteBookmarkController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const tweet_id = req.params.tweetId
  const user_id = req.decoded_authorization?.userId
  const result = await tweetsServices.deleteBookmark(tweet_id, user_id)
  res.json({
    message: tweetsMessages.DELETE_BOOKMARK_SUCCESS,
    result
  })
})
export const createLikeController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const tweet_id = req.params.tweetId
  const user_id = req.decoded_authorization?.userId
  const result = await tweetsServices.createLike(tweet_id, user_id)
  res.json({
    message: tweetsMessages.CREATE_LIKE_SUCCESS,
    result
  })
})
export const unLikeController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const tweet_id = req.params.tweetId
  const user_id = req.decoded_authorization?.userId
  const result = await tweetsServices.deleteLike(tweet_id, user_id)
  res.json({
    message: tweetsMessages.UNLIKE_SUCCESS,
    result
  })
})
