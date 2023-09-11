import { Request } from 'express'
import { checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import httpStatusCode from '~/constants/httpStatusCode'
import { usersMessages } from '~/constants/messages'

import { ErrorWithStatus } from '~/models/interface/errors/Error'
import { DB } from '~/services/database.services'
import { dotenvConfig } from '~/utils/dotenv'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/valitation'

dotenvConfig()
export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        // notEmpty: {
        //   errorMessage: usersMessages.REFRESH_TOKEN_IS_REQUIRED
        // },
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: usersMessages.REFRESH_TOKEN_IS_REQUIRED,
                status: httpStatusCode.UNAUTHORIZED
              })
            }
            try {
              const decoded_refresh_token = await verifyToken({
                token: value,
                secretKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
              })
              const CheckRefreshTokenExist = await DB.refreshToken.findOne({ token: value })
              if (CheckRefreshTokenExist === null) {
                throw new ErrorWithStatus({
                  message: usersMessages.REFRESH_TOKEN_IS_NOT_EXIST,
                  status: httpStatusCode.UNAUTHORIZED
                })
              }

              ;(req as Request).decoded_refresh_token = decoded_refresh_token
              req.refresh_Token = value
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: error.message,
                  status: httpStatusCode.UNAUTHORIZED
                })
              }
            }

            return true
          }
        }
      }
    },
    ['body']
  )
)
