import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { TweetAudience, TweetType } from '~/constants/enums'
import { tweetsMessages, usersMessages } from '~/constants/messages'
import { Media } from '~/models/interface/media/media'
import { numberEnumToArray } from '~/utils/common'

import { validate } from '~/utils/valitation'
console.log(numberEnumToArray(TweetType))
export const validatorCreateTweet = validate(
  checkSchema(
    {
      type: {
        notEmpty: {
          errorMessage: tweetsMessages.THIS_PROPERTY_IS_REQUIRED
        },
        isIn: {
          options: [numberEnumToArray(TweetType)],
          errorMessage: tweetsMessages.INVALID_TYPE
        }
      },
      audience: {
        notEmpty: {
          errorMessage: tweetsMessages.THIS_PROPERTY_IS_REQUIRED
        },
        isIn: {
          options: [numberEnumToArray(TweetAudience)],
          errorMessage: tweetsMessages.INVALID_TYPE
        }
      },
      content: {
        isString: true,
        custom: {
          options: (value, { req }) => {
            const type = req.body.type as TweetType
            // Neeu type la retweet thi content phai la rỗng
            if (type === TweetType.Retweet && value !== '') {
              throw new Error(tweetsMessages.RETWEET_CONTENT_IS_EMPTY_STRING)
            }
            //Ney type la quotetweet , comment , tweet mà không co hagstag hoặc mentions thi cần phải có content
            if (
              [TweetType.QuoteTweet, TweetType.Comment, TweetType.Tweet].includes(type) &&
              (isEmpty(req.body.mentions) || isEmpty(req.body.hashtags)) &&
              value === ''
            ) {
              throw new Error(tweetsMessages.CONTENT_IS_REQUIRED)
            }
            return true
          }
        }
      },
      parent_id: {
        custom: {
          options: (value, { req }) => {
            const type = req.body.type as TweetType
            //Nếu type không phải là tweet thì parent id phải khác null
            if (
              [TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) &&
              !ObjectId.isValid(value)
            ) {
              throw new Error(tweetsMessages.PARENT_ID_MUST_BE_A_TWEET_ID)
            }
            //Nếu type là tweet thì parent id phải là null
            if (type === TweetType.Tweet && value !== null) {
              throw new Error(tweetsMessages.PARENT_ID_MUST_BE_NULL)
            }
            return true
          }
        }
      },
      mentions: {
        isArray: true,

        custom: {
          options: (value, { req }) => {
            if (!value.every((item: any) => typeof item === 'string' && ObjectId.isValid(item))) {
              throw new Error(tweetsMessages.THIS_PROPERTY_IS_STRING)
            }
            if (!value.every((item: any) => ObjectId.isValid(item))) {
              throw new Error(tweetsMessages.INVALID_TYPE)
            }
            return true
          }
        }
      },
      hashtags: {
        isArray: true,

        custom: {
          options: (value, { req }) => {
            if (!value.every((item: any) => typeof item === 'string')) {
              throw new Error(tweetsMessages.THIS_PROPERTY_IS_STRING)
            }
            return true
          }
        }
      },
      media: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            if (
              !value.every((item: any) => {
                if (!item.url || !item.type) {
                  return false
                }
              })
            ) {
              throw new Error(tweetsMessages.MISSING_URL_OR_TYPE)
            }
            if (!value.every((item: any) => typeof item.url === 'string')) {
              throw new Error(tweetsMessages.URL_MUST_IS_STRING)
            }

            if (!value.every((item: any) => numberEnumToArray(TweetAudience).includes(req.body.media.type))) {
              throw new Error(tweetsMessages.THIS_MEDIA_TYPE_IS_NOT_VALID)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)
