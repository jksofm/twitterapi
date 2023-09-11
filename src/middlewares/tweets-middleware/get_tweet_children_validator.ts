import { checkSchema } from 'express-validator'
import { TweetType } from '~/constants/enums'
import { tweetsMessages } from '~/constants/messages'
import { validate } from '~/utils/valitation'

export const getTweetChildrenValidator = validate(
  checkSchema(
    {
      type: {
        isIn: {
          options: [TweetType],
          errorMessage: tweetsMessages.INVALID_TYPE
        }
      },
      limit: {
        isNumeric: true,
        custom: {
          options: async (value, { req }) => {
            const num = Number(value)
            if (value > 100 || value < 1) {
              throw new Error('Maximum is 100 and Minimum is 1')
            }
            return true
          }
        }
      },
      page: {
        isNumeric: true,
        custom: {
          options: async (value, { req }) => {
            const num = Number(value)
            if (value < 1) {
              throw new Error('Minimum is 1')
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)
