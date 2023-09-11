import { Request } from 'express'
import { checkSchema } from 'express-validator'

import httpStatusCode from '~/constants/httpStatusCode'
import { usersMessages } from '~/constants/messages'

import { ErrorWithStatus } from '~/models/interface/errors/Error'

import { dotenvConfig } from '~/utils/dotenv'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/valitation'

dotenvConfig()
export const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: usersMessages.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
                status: httpStatusCode.UNAUTHORIZED
              })
            }
            try {
              const decoded_email_verify_token = await verifyToken({
                token: value,
                secretKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
              })

              // const CheckEmailVerifyTokenExist = await DB.users.findOne({ email_verify_token: value })
              // if (CheckEmailVerifyTokenExist === null) {
              //   throw new ErrorWithStatus({
              //     message: usersMessages.EMAIL_VERIFY_TOKEN_IS_NOT_EXIST,
              //     status: httpStatusCode.UNAUTHORIZED
              //   })
              // }

              ;(req as Request).decoded_email_verify_token = decoded_email_verify_token
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
    ['body']
  )
)
