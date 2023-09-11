import { NextFunction, Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'
import httpStatusCode from '~/constants/httpStatusCode'
import { usersMessages } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/interface/errors/Error'
import { DB } from '~/services/database.services'
import { catchAsync } from '~/utils/catchAsync'

export const verifedUserValidator = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user_id = req.decoded_authorization?.userId
  const user = await DB.users.findOne({ _id: new ObjectId(user_id) })

  const verify = user?.verify

  if (verify !== UserVerifyStatus.Verified) {
    next(
      new ErrorWithStatus({
        message: usersMessages.USER_NOT_VERIFIED,
        status: httpStatusCode.FORBIDDEN
      })
    )
  }
  next()
})
