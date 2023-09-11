import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import { usersMessages } from '~/constants/messages'
import { usersServices } from '~/services/users.services'
import { validate } from '~/utils/valitation'

export const validatorLogin = validate(
  checkSchema({
    email: {
      notEmpty: {
        errorMessage: usersMessages.EMAIL_IS_REQUIRED
      },
      isEmail: {
        errorMessage: usersMessages.EMAIL_IS_INVALID
      },
      trim: true
    },
    password: {
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
      }
    }
  },['body'])
)
