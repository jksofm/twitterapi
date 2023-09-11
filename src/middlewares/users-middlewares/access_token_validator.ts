import { Request } from 'express'
import { checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import httpStatusCode from '~/constants/httpStatusCode'
import { usersMessages } from '~/constants/messages'
import { PROCESS_ENV } from '~/constants/process.env'
import { ErrorWithStatus } from '~/models/interface/errors/Error'
import { dotenvConfig } from '~/utils/dotenv'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/valitation'


dotenvConfig()

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        // notEmpty: {
        //   errorMessage: usersMessages.YOU_NEED_TO_LOGIN
        // },
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: usersMessages.YOU_NEED_TO_LOGIN,
                status: httpStatusCode.UNAUTHORIZED
              })
            }
            const access_token = value.split(' ')[1]
            if (access_token === '')
              throw new ErrorWithStatus({
                message: usersMessages.YOU_NEED_TO_LOGIN,
                status: httpStatusCode.UNAUTHORIZED
              })
            try {
              const decoded_authorization = await verifyToken({
                token: access_token,
                secretKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })
              

              ;(req as Request).decoded_authorization = decoded_authorization
            } catch (error: any) {
              throw new ErrorWithStatus({
                message: error.message,
                status: httpStatusCode.UNAUTHORIZED
              })
            }

            return true
          }
        }
      }
    },
    ['headers']
  )
)
