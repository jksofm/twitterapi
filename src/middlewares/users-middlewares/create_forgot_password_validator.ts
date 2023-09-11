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

export const createforgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: usersMessages.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: usersMessages.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            const user = await DB.users.findOne({ email: value })
            if (!user) {
              throw new ErrorWithStatus({ message: usersMessages.USER_IS_NOT_FOUND, status: httpStatusCode.NOT_FOUND })
            }

            ;(req as Request).user = user

            return true
          }
        }
      }
    },
    ['body']
  )
)
