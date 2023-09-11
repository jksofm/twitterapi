import { Request } from 'express'
import { checkSchema } from 'express-validator'

import { ObjectId } from 'mongodb'

import httpStatusCode from '~/constants/httpStatusCode'
import { tweetsMessages } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/interface/errors/Error'
import Tweet_schema from '~/models/schemas/Tweet.schema'

import { DB } from '~/services/database.services'

import { validate } from '~/utils/valitation'

export const validatorTweetId = validate(
  checkSchema(
    {
      tweetId: {
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: tweetsMessages.TWEET_ID_IS_REQUIRED,
                status: httpStatusCode.NOT_FOUND
              })
            }
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: tweetsMessages.TWEET_ID_INVALID,
                status: httpStatusCode.NOT_FOUND
              })
            }

            const [tweet] = 
              await DB.tweets
                .aggregate<Tweet_schema>([
                  {
                    $match: {
                      _id: new ObjectId('64c0f1fba5e58663dc2c058b')
                    }
                  },
                  {
                    $lookup: {
                      from: 'hashtags',
                      localField: 'hashtags',
                      foreignField: '_id',
                      as: 'hashtags'
                    }
                  },
                  {
                    $addFields: {
                      hashtags: {
                        $map: {
                          input: '$hashtags',
                          as: 'hashtag',
                          in: {
                            _id: '$$hashtag._id',
                            naem: '$$hashtag.content'
                          }
                        }
                      }
                    }
                  },
                  {
                    $lookup: {
                      from: 'bookmarks',
                      localField: '_id',
                      foreignField: 'tweet_id',
                      as: 'bookmarks'
                    }
                  },
                  {
                    $addFields: {
                      Bookmark_count: {
                        $size: '$bookmarks'
                      }
                    }
                  },
                  {
                    $lookup: {
                      from: 'likes',
                      localField: '_id',
                      foreignField: 'tweet_id',
                      as: 'likes'
                    }
                  },
                  {
                    $addFields: {
                      likes_count: {
                        $size: '$likes'
                      }
                    }
                  },
                  {
                    $lookup: {
                      from: 'tweets',
                      localField: '_id',
                      foreignField: 'parent_id',
                      as: 'tweets_children'
                    }
                  },
                  {
                    $addFields: {
                      tweets_children: {
                        $map: {
                          input: '$tweets_children',
                          as: 'singleTweetChildren',
                          in: {
                            _id: '$$singleTweetChildren._id',
                            user_id: '$$singleTweetChildren.user_id'
                          }
                        }
                      },
                      retweet_count: {
                        $size: {
                          $filter: {
                            input: '$tweets_children',
                            as: 'item',
                            cond: {
                              $eq: ['$$item.type', 1]
                            }
                          }
                        }
                      },
                      comment_count: {
                        $size: {
                          $filter: {
                            input: '$tweets_children',
                            as: 'item',
                            cond: {
                              $eq: ['$$item.type', 2]
                            }
                          }
                        }
                      },
                      quote_count: {
                        $size: {
                          $filter: {
                            input: '$tweets_children',
                            as: 'item',
                            cond: {
                              $eq: ['$$item.type', 3]
                            }
                          }
                        }
                      }
                    }
                  },
                  {
                    $addFields: {
                      views: {
                        $add: ['$user_views', '$guest_views']
                      }
                    }
                  },
                  {
                    $project: {
                      tweets_children: 0,
                      likes: 0,
                      bookmarks: 0
                    }
                  }
                ])
                .toArray()
            

            if (tweet === null) {
              throw new ErrorWithStatus({
                message: tweetsMessages.TWEET_ID_NOT_EXIST,
                status: httpStatusCode.NOT_FOUND
              })
            }
            ;(req as Request).tweet = tweet 
            return true
          }
        }
      }
    },
    ['body', 'params']
  )
)
