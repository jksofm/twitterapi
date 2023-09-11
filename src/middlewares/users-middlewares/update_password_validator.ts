import { Request } from 'express'
import { checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import httpStatusCode from '~/constants/httpStatusCode'
import { usersMessages } from '~/constants/messages'
import { PROCESS_ENV } from '~/constants/process.env'
import { ErrorWithStatus } from '~/models/interface/errors/Error'
import { DB } from '~/services/database.services'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/valitation'

export const updatePasswordValidator = validate(
  checkSchema(
    {
      old_password: {
        isString : true,
        trim : true,
        optional : true
      },
      new_password: {
        notEmpty: {
          errorMessage: usersMessages.PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: usersMessages.PASSWORD_MUST_BE_A_STRING
        },

        isLength: {
          options: {
            min: 6,
            max: 50
          },
          errorMessage: usersMessages.PASSWORD_LENGTH_MUST_MUST_BE_FROM_6_TO_50
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: usersMessages.PASSWORD_MUST_BE_STRONG
        }
      },
      confirm_new_password: {
        notEmpty: {
          errorMessage: usersMessages.CONFIRM_PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: usersMessages.CONFIRM_PASSWORD_MUST_BE_A_STRING
        },

        isLength: {
          options: {
            min: 6,
            max: 50
          },
          errorMessage: usersMessages.CONFIRM_PASSWORD_LENGTH_MUST_MUST_BE_FROM_6_TO_50
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: usersMessages.CONFIRM_PASSWORD_MUST_BE_STRONG
        },
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.new_password) {
              throw new Error(usersMessages.CONFIRM_PASSWORD_IS_NOT_MATCH)
            }
            return true
          }
        }
      },
    },
    ['body']
  )
)
