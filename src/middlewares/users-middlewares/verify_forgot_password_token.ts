import { Request } from 'express'
import { checkSchema } from 'express-validator'

import httpStatusCode from '~/constants/httpStatusCode'
import { usersMessages } from '~/constants/messages'

import { ErrorWithStatus } from '~/models/interface/errors/Error'

import { dotenvConfig } from '~/utils/dotenv'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/valitation'

dotenvConfig()
export const verifyForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: {
        isString : true,
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            
            if (!value) {
              throw new ErrorWithStatus({
                message: usersMessages.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
                status: httpStatusCode.UNAUTHORIZED
              })
            }
            
            try {
              const decoded_forgot_password_verify_token = await verifyToken({
                token: value,
                secretKey: process.env.JWT_SECRET_FORGOT_PASSWORD_VERIFY_TOKEN as string
              })
             
        

              ;(req as Request).decoded_forgot_password_verify_token = decoded_forgot_password_verify_token
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
