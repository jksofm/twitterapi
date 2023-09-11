import User from '~/models/schemas/User.schema'
import { DB } from './database.services'
import { NextFunction, Response } from 'express'
import {
  LoginRequestBody,
  RegisterRequestBody,
  UpdateMyProfileRequestBody
} from '~/models/interface/requests/Users.requests'
import { signToken, verifyToken } from '~/utils/jwt'
import { TokenType, TweetType, UserVerifyStatus } from '~/constants/enums'
import { hashPassword } from '~/utils/crypto'
import { ObjectId, WithId } from 'mongodb'
import Refresh_Token_Schema from '~/models/schemas/RefreshToken_schema'

import { tweetsMessages, usersMessages } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/interface/errors/Error'
import httpStatusCode from '~/constants/httpStatusCode'
import { pick } from 'lodash'
import Follower_schema from '~/models/schemas/Follower.schema'
import { dotenvConfig } from '~/utils/dotenv'
import Tweet from '~/models/schemas/Tweet.schema'
import { TweetRequestBody } from '~/models/interface/requests/Tweets.requests'
import Tweet_schema from '~/models/schemas/Tweet.schema'
import Hashtags_Schema from '~/models/schemas/Hashtags.schema'
import Bookmarks_Schema from '~/models/schemas/Bookmark.schema'
import Likes_Schema from '~/models/schemas/Like.schema'
import TweetCircles_Schema from '~/models/schemas/Tweet_circle.schema'

dotenvConfig()
class TweetsServices {
  constructor() {}
  async createTweet(tweets: TweetRequestBody, user_id: ObjectId) {
    const { type, audience, content, parent_id, hashtags, media, mentions } = tweets

    const newParentId = parent_id === null ? parent_id : new ObjectId(parent_id)

    if (parent_id !== null) {
      const checkParentTweetExist = await DB.tweets.findOne({ _id: new ObjectId(parent_id) })
      if (checkParentTweetExist === null) {
        throw new ErrorWithStatus({
          message: tweetsMessages.PARENT_TWEET_NOT_EXIST,
          status: httpStatusCode.NOT_FOUND
        })
      }
    }

    const newMentions = mentions?.map((item) => new ObjectId(item))

    const hashtagsDocumentId = (await this.checkAndCreateHashtag(hashtags)).map((item: any) => {
      return item.value._id
    })
    console.log()
    return await DB.tweets.insertOne(
      new Tweet_schema({
        type,
        audience,
        content,
        parent_id: newParentId,
        hashtags: hashtagsDocumentId,
        media,
        mentions: newMentions,
        user_id
      })
    )
  }
  async deleteTweet(user_id: string, tweet_id: string) {
    const checkTweetExist = await DB.tweets.findOne({ _id: new ObjectId(tweet_id) })
    if (checkTweetExist === null) {
      throw new ErrorWithStatus({
        message: tweetsMessages.TWEET_IS_NOT_EXIST,
        status: httpStatusCode.BAD_REQUEST
      })
    }
    //Xoa like
    await DB.likes.deleteMany({ tweet_id: new ObjectId(tweet_id) })
    // Xoa bookmark
    await DB.bookmarks.deleteMany({ tweet_id: new ObjectId(tweet_id) })

    await DB.tweets.deleteOne({ _id: new ObjectId(tweet_id) })
  }
  async getDetailTweet(tweet_id: ObjectId) {
    const result = await DB.tweets.findOne({ _id: tweet_id })
    return result
  }
  async increaseView(tweet_id: string, user_id?: string) {
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const result = await DB.tweets.findOneAndUpdate(
      {
        _id: new ObjectId(tweet_id)
      },

      {
        $inc: inc,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          guest_views: 1,
          user_views: 1,
          updated_at: 1
        }
      }
    )
    return result.value as WithId<{
      guest_views: number
      user_views: number
      updated_at: Date
    }>
  }
  async getTweetChildren(
    tweet_id: string,
    type: TweetType,
    limit: number = 5,
    page: number = 1,
    user_id: string | null
  ) {
    const result = await DB.tweets
      .aggregate<Tweet_schema>([
        {
          $match: {
            parent_id: new ObjectId(tweet_id),
            type: type
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
                  content: '$$hashtag.content'
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
                    $eq: ['$$item.type', TweetType.Retweet]
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
                    $eq: ['$$item.type', TweetType.Comment]
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
                    $eq: ['$$item.type', TweetType.QuoteTweet]
                  }
                }
              }
            }
          }
        },

        {
          $project: {
            tweets_children: 0,
            likes: 0,
            bookmarks: 0
          }
        },
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        }
      ])
      .toArray()
    /// Tang view cho children
    const idsArray = result.map((tweet) => tweet._id as ObjectId)
    const inc = user_id === null ? { guest_views: 1 } : { user_views: 1 }
    DB.tweets.updateMany(
      {
        _id: {
          $in: idsArray
        }
      },
      {
        $inc: inc,
        $set: {
          updated_at: new Date()
        }
      }
    )
    result.forEach((item) => {
      item.updated_at = new Date()
      if (user_id !== null) {
        item.user_views += 1
      } else {
        item.guest_views += 1
      }
      console.log(item)
    })
    ////////total
    const total = await DB.tweets.countDocuments({
      parent_id: new ObjectId(tweet_id),
      type: type
    })

    return { total, result }
  }
  async getNewFeed(user_id: string, limit: number = 5, page: number = 1) {
    ///Lay những người user đang follow
    const id_array_followed_by_user = (
      await DB.users
        .aggregate([
          {
            $match: {
              _id: new ObjectId(user_id)
            }
          },
          {
            $lookup: {
              from: 'followers',
              localField: '_id',
              foreignField: 'user_id',
              as: 'id_arrays_currently_followed_by_user'
            }
          },
          {
            $addFields: {
              id_arrays_currently_followed_by_user: {
                $map: {
                  input: '$id_arrays_currently_followed_by_user',
                  as: 'user',
                  in: '$$user.followed_user_id'
                }
              }
            }
          },
          {
            $project: {
              id_arrays_currently_followed_by_user: 1
            }
          }
        ])
        .toArray()
    )[0].id_arrays_currently_followed_by_user
    ///Lay những tweet của user và của người user followd
    const id_Array = [...id_array_followed_by_user, new ObjectId(user_id)]
    console.log(id_Array.includes(new ObjectId('64c35547b23159b4becf2af6')))

    const tweets = await DB.tweets
      .aggregate([
        {
          $match: {
            user_id: {
              $in: id_Array
            }
          }
        },
        {
          $lookup: {
            from: 'tweetCircles',
            localField: 'user_id',
            foreignField: 'user_id',
            as: 'users_in_circle'
          }
        },
        {
          $addFields: {
            users_in_circle: {
              $map: {
                input: '$users_in_circle',
                as: 'user',
                in: '$$user.user_id_in_circle'
              }
            }
          }
        },
        {
          $match: {
            $or: [
              {
                audience: 0
              },
              {
                $and: [
                  {
                    audience: 1
                  },
                  {
                    users_in_circle: {
                      $in: [
                        new ObjectId('64c35547b23159b4becf2ae9'),
                        new ObjectId('64c35547b23159b4becf2af9'),
                        new ObjectId('64c35547b23159b4becf2af4')
                      ]
                    }
                  }
                ]
              }
            ]
          }
        },
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'owner_of_tweet'
          }
        },
        {
          $addFields: {
            owner_of_tweet: {
              $map: {
                input: '$owner_of_tweet',
                as: 'owner',
                in: {
                  _id: '$$owner._id',
                  email: '$$owner.email',
                  avatar: '$$owner.avatar',
                  username: '$$owner.username'
                }
              }
            }
          }
        },
        {
          $unwind: {
            path: '$owner_of_tweet'
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
                  content: '$$hashtag.content'
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
                    $eq: ['$$item.type', TweetType.Retweet]
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
                    $eq: ['$$item.type', TweetType.Comment]
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
                    $eq: ['$$item.type', TweetType.QuoteTweet]
                  }
                }
              }
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

    /// Tang view cho children
    const idsArray = tweets.map((tweet) => tweet._id as ObjectId)

    DB.tweets.updateMany(
      {
        _id: {
          $in: idsArray
        }
      },
      {
        $inc: { user_views: 1 },
        $set: {
          updated_at: new Date()
        }
      }
    )
    tweets.forEach((item) => {
      item.updated_at = new Date()

      item.user_views += 1
    })
    const total = (
      await DB.tweets
        .aggregate([
          {
            $match: {
              user_id: {
                $in: id_Array
              }
            }
          },
          {
            $lookup: {
              from: 'tweetCircles',
              localField: 'user_id',
              foreignField: 'user_id',
              as: 'users_in_circle'
            }
          },
          {
            $addFields: {
              users_in_circle: {
                $map: {
                  input: '$users_in_circle',
                  as: 'user',
                  in: '$$user.user_id_in_circle'
                }
              }
            }
          },
          {
            $match: {
              $or: [
                {
                  audience: 0
                },
                {
                  $and: [
                    {
                      audience: 1
                    },
                    {
                      users_in_circle: {
                        $in: [
                          new ObjectId('64c35547b23159b4becf2ae9'),
                          new ObjectId('64c35547b23159b4becf2af9'),
                          new ObjectId('64c35547b23159b4becf2af4')
                        ]
                      }
                    }
                  ]
                }
              ]
            }
          }
        ])
        .toArray()
    ).length
    return { tweets, total }
  }
  async addOtherUserToTweetCircle(user_id_in_circle: string, user_id: string) {
    //Check user them vao co ton tai hay verified hay chua

    if (!ObjectId.isValid(user_id_in_circle)) {
      throw new ErrorWithStatus({
        message: usersMessages.USER_ID_NOT_VALID,
        status: httpStatusCode.NOT_FOUND
      })
    }
    const checkUserIdInCircleExistInUserSchema = await DB.users.findOne({ _id: new ObjectId(user_id_in_circle) })
    if (checkUserIdInCircleExistInUserSchema === null) {
      throw new ErrorWithStatus({
        message: usersMessages.USER_IS_NOT_FOUND,
        status: httpStatusCode.NOT_FOUND
      })
    }
    if (checkUserIdInCircleExistInUserSchema.verify !== UserVerifyStatus.Verified) {
      throw new ErrorWithStatus({
        message: usersMessages.USER_NOT_VERIFIED,
        status: httpStatusCode.NOT_FOUND
      })
    }
    //Check  User đã thêm vào Circle hay chưa
    const checkUserIdInCircleExist = await DB.tweetCircles.findOne({
      user_id: new ObjectId(user_id),
      user_id_in_circle: new ObjectId(user_id_in_circle)
    })
    if (checkUserIdInCircleExist !== null) {
      throw new ErrorWithStatus({
        message: tweetsMessages.USER_ALREADY_IN_CIRCLE,
        status: httpStatusCode.BAD_REQUEST
      })
    }
    return await DB.tweetCircles.insertOne(
      new TweetCircles_Schema({
        user_id: new ObjectId(user_id),
        user_id_in_circle: new ObjectId(user_id_in_circle)
      })
    )
  }
  async deleteOtherUserToTweetCircle(user_id_in_circle: string, user_id: string) {
    if (!ObjectId.isValid(user_id_in_circle)) {
      throw new ErrorWithStatus({
        message: usersMessages.USER_ID_NOT_VALID,
        status: httpStatusCode.NOT_FOUND
      })
    }
    //Check user them vao co ton tai hay verified hay chua
    const checkUserIdInCircleExistInUserSchema = await DB.users.findOne({ _id: new ObjectId(user_id_in_circle) })
    if (checkUserIdInCircleExistInUserSchema === null) {
      throw new ErrorWithStatus({
        message: usersMessages.USER_IS_NOT_FOUND,
        status: httpStatusCode.NOT_FOUND
      })
    }

    //Check  User đã thêm vào Circle hay chưa
    const checkUserIdInCircleExist = await DB.tweetCircles.findOne({
      user_id: new ObjectId(user_id),
      user_id_in_circle: new ObjectId(user_id_in_circle)
    })
    if (checkUserIdInCircleExist === null) {
      throw new ErrorWithStatus({
        message: tweetsMessages.USER_NOT_IN_CIRCLE,
        status: httpStatusCode.BAD_REQUEST
      })
    }
    return await DB.tweetCircles.deleteOne({
      user_id: new ObjectId(user_id),
      user_id_in_circle: new ObjectId(user_id_in_circle)
    })
  }

  async checkAndCreateHashtag(hashtags: string[]) {
    const result = await Promise.all(
      hashtags.map((hashtag) => {
        return DB.hashtags.findOneAndUpdate(
          {
            content: hashtag
          },
          {
            $setOnInsert: new Hashtags_Schema({ content: hashtag })
          },
          {
            upsert: true,
            returnDocument: 'after'
          }
        )
      })
    )
    return result
  }
  async createBookmark(tweet_id: string, user_id: string) {
    const checkBookmarkExist = await DB.bookmarks.findOne({
      tweet_id: new ObjectId(tweet_id),
      user_id: new ObjectId(user_id)
    })
    console.log(checkBookmarkExist)
    if (checkBookmarkExist !== null) {
      throw new ErrorWithStatus({
        message: tweetsMessages.BOOKMARK_IS_ALREADY_EXIST,
        status: httpStatusCode.BAD_REQUEST
      })
    }
    return await DB.bookmarks.insertOne(
      new Bookmarks_Schema({ tweet_id: new ObjectId(tweet_id), user_id: new ObjectId(user_id) })
    )
  }
  async deleteBookmark(tweet_id: string, user_id: string) {
    const checkBookmarkExist = await DB.bookmarks.findOne({
      tweet_id: new ObjectId(tweet_id),
      user_id: new ObjectId(user_id)
    })
    if (checkBookmarkExist === null) {
      throw new ErrorWithStatus({
        message: tweetsMessages.THERE_IS_NO_BOOKMARK,
        status: httpStatusCode.BAD_REQUEST
      })
    }
    return await DB.bookmarks.deleteOne({ tweet_id: new ObjectId(tweet_id), user_id: new ObjectId(user_id) })
  }
  async createLike(tweet_id: string, user_id: string) {
    const checkLikeExist = await DB.likes.findOne({
      tweet_id: new ObjectId(tweet_id),
      user_id: new ObjectId(user_id)
    })
    if (checkLikeExist !== null) {
      throw new ErrorWithStatus({
        message: tweetsMessages.LIKES_IS_ALREADY_EXIST,
        status: httpStatusCode.BAD_REQUEST
      })
    }
    return await DB.likes.insertOne(
      new Likes_Schema({ tweet_id: new ObjectId(tweet_id), user_id: new ObjectId(user_id) })
    )
  }
  async deleteLike(tweet_id: string, user_id: string) {
    const checkLikeExist = await DB.likes.findOne({
      tweet_id: new ObjectId(tweet_id),
      user_id: new ObjectId(user_id)
    })

    if (checkLikeExist === null) {
      throw new ErrorWithStatus({
        message: tweetsMessages.THERE_IS_NO_LIKE,
        status: httpStatusCode.BAD_REQUEST
      })
    }
    return await DB.likes.deleteOne({ tweet_id: new ObjectId(tweet_id), user_id: new ObjectId(user_id) })
  }
}

export const tweetsServices = new TweetsServices()
