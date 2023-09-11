import { Request } from 'express'
import { checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import httpStatusCode from '~/constants/httpStatusCode'
import { usersMessages } from '~/constants/messages'
import { PROCESS_ENV } from '~/constants/process.env'
import { ErrorWithStatus } from '~/models/interface/errors/Error'
import { DB } from '~/services/database.services'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/valitation'

export const followBodyValidator = validate(
  checkSchema(
    {
      followed_user_id: {
        trim: true,
        isString: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: usersMessages.FOLLWED_USER_ID_IS_REQUIRED,
                status: httpStatusCode.UNAUTHORIZED
              })
            }

            const user = await DB.users.findOne({
              _id: new ObjectId(value)
            })
            if (user === null) {
              throw new ErrorWithStatus({
                message: usersMessages.USER_IS_NOT_FOUND,
                status: httpStatusCode.NOT_FOUND
              })
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)
