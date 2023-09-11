import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import httpStatusCode from '~/constants/httpStatusCode'
import { conversationMessages } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/interface/errors/Error'
import { DB } from '~/services/database.services'
import { validate } from '~/utils/valitation'

export const receiverIdValidator = validate(
  checkSchema(
    {
      receiverId: {
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: conversationMessages.RECEIVER_ID_IS_REQUIRED,
                status: httpStatusCode.NOT_FOUND
              })
            }
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: conversationMessages.RECEIVER_ID_INVALID,
                status: httpStatusCode.NOT_FOUND
              })
            }
            const user = await DB.users.findOne({ _id: new ObjectId(value) })
            if (user === null) {
              throw new ErrorWithStatus({
                message: conversationMessages.RECEIVER_ID_NOT_EXIST,
                status: httpStatusCode.NOT_FOUND
              })
            }
          }
        }
      },
      
    },
    ['params']
  )
)
