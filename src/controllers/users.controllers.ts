import { Request, Response, NextFunction } from 'express'
import { catchAsync } from '~/utils/catchAsync'
import { usersServices } from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  LoginRequestBody,
  RegisterRequestBody,
  TokenPayload,
  UpdateMyProfileRequestBody,
  updatePasswordRequestBody
} from '~/models/interface/requests/Users.requests'
import { hashPassword } from '~/utils/crypto'
import { ErrorWithStatus } from '~/models/interface/errors/Error'
import { usersMessages } from '~/constants/messages'
import httpStatusCode from '~/constants/httpStatusCode'
import { DB } from '~/services/database.services'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'
import { dotenvConfig } from '~/utils/dotenv'
import axios from 'axios'
import jwt from 'jsonwebtoken'
import User from '~/models/schemas/User.schema'
dotenvConfig()
export const loginControllers = catchAsync(
  async (req: Request<ParamsDictionary, any, LoginRequestBody, any, any>, res: Response, next: NextFunction) => {
    const result = await usersServices.login(req.body)
    if (result === undefined) {
      next(
        new ErrorWithStatus({
          message: usersMessages.EMAIL_OR_PASSWORD_IS_NOT_CORRECT,
          status: httpStatusCode.UNAUTHORIZED
        })
      )
    }

    res.status(200).json({
      message: usersMessages.LOGIN_SUCCESS,
      result
    })
  }
)

export const registerControllers = catchAsync(
  async (req: Request<ParamsDictionary, any, RegisterRequestBody, any, any>, res: Response, next: NextFunction) => {
    const { date_of_birth: birthday, password } = req.body

    const date_of_birth = new Date(birthday)
    const result = await usersServices.register({ ...req.body, date_of_birth, password: hashPassword(password) })

    res.status(200).json({
      message: usersMessages.REGISTER_SUCCESS,
      result
    })
  }
)

export const logoutControllers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // const decoded_refresh_token = req.decoded_refresh_token

  const refresh_token = req.body.refresh_token

  const result = await usersServices.logout(refresh_token)
  res.status(200).json({
    message: usersMessages.LOGOUT_SUCCESS
  })
})

export const refreshTokenController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user_id = req.decoded_refresh_token?.userId
  const exp = req.decoded_refresh_token?.exp
  const refresh_Token = req.refresh_Token
  const result = await usersServices.signRefreshTokenAndAccessToken_RemoveOldRefreshTokenAndUpdateNewOne(
    user_id,
    refresh_Token,
    exp
  )
  res.status(httpStatusCode.OK).json({
    message: usersMessages.REFRESH_TOKEN_IS_CREATED,
    result
  })
})
export const verifyEmailControllers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // const decoded_email_verify_token = req.decoded_email_verify_token

  const user_id = req.decoded_email_verify_token?.userId

  const user = await DB.users.findOne({
    _id: new ObjectId(user_id)
  })

  if (!user) {
    next(
      new ErrorWithStatus({
        message: usersMessages.USER_IS_NOT_FOUND,
        status: httpStatusCode.NOT_FOUND
      })
    )
  }
  // Check xem email da duoc verify hay chua
  if (user?.email_verify_token === '') {
    res.status(200).json({
      message: usersMessages.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  } else {
    const result = await usersServices.verifyEmail(user_id as string)
    res.status(200).json({
      message: usersMessages.EMAIL_VERIFY_SUCCESS,
      result
    })
  }
})
export const resendVerifyEmailControllers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.decoded_authorization)
  const user_id = req.decoded_authorization?.userId
  const user = await DB.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    return next(new ErrorWithStatus({ message: usersMessages.USER_IS_NOT_FOUND, status: httpStatusCode.NOT_FOUND }))
  }
  if (user.verify !== UserVerifyStatus.Unverified) {
    return next(
      new ErrorWithStatus({
        message: usersMessages.EMAIL_ALREADY_VERIFIED_BEFORE,
        status: httpStatusCode.BAD_REQUEST
      })
    )
  }
  const result = await usersServices.resendVerifyEmailToken(user_id as string,user.email)
  res.json({
    message: usersMessages.RESEND_EMAIL_VERIFY_TOKEN_SUCCESS,
    result
  })
})

export const createForgotPasswordTokenControllers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user_id = req.user?._id?.toString()
    const result = await usersServices.createPasswordToken(user_id as string)

    res.status(httpStatusCode.CREATED).json({
      message: usersMessages.SEND_FORGOT_PASSWORD_TOKEN_SUCCESS,
      result
    })
  }
)
export const verifyForgotPasswordTokenControllers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user_id = req.decoded_forgot_password_verify_token?.userId
    const forgot_password_token = req.body.forgot_password_token

    const result = await usersServices.verifyPasswordToken(user_id as string, forgot_password_token as string)

    res.status(httpStatusCode.CREATED).json({
      message: usersMessages.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS,
      result
    })
  }
)
export const updatePasswordControllers = catchAsync(
  async (
    req: Request<ParamsDictionary, any, updatePasswordRequestBody, any, any>,
    res: Response,
    next: NextFunction
  ) => {
    const old_password = req.body.old_password
    const user_id = req.decoded_authorization?.userId
    const password = req.body.new_password
    const result = await usersServices.updatePassword(password as string, user_id as string, old_password as string)

    res.status(httpStatusCode.OK).json({
      message: usersMessages.UPDATE_PASSWORD_SUCCESS,
      result
    })
  }
)
export const getMyProfileController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user_id = req.decoded_authorization?.userId
  console.log(user_id)
  const user = await usersServices.getMyProfile(user_id as string)

  res.status(httpStatusCode.OK).json({
    message: usersMessages.GET_MY_PROFILE_SUCCESS,
    user
  })
})
export const updateMyProfileController = catchAsync(
  async (
    req: Request<ParamsDictionary, any, UpdateMyProfileRequestBody, any, any>,
    res: Response,
    next: NextFunction
  ) => {
    const body = req.body
    const user_id = req.decoded_authorization?.userId
    const user = await usersServices.updateMyProfile(user_id as string, body as UpdateMyProfileRequestBody)
    res.json({
      message: usersMessages.UPDATE_MY_PROFILE_SUCCESS,
      user
    })
  }
)
export const getUserProfileController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user_id = req.params.userId
  // console.log(user_id)

  const user = await usersServices.getUserProfile(user_id as string)

  res.status(httpStatusCode.OK).json({
    message: usersMessages.GET_USER_PROFILE_SUCCESS,
    user
  })
})

export const followControllers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  //// Me
  const user_id = req.decoded_authorization?.userId
  //Followed User
  const followed_user_id = req.body.followed_user_id

  await usersServices.followUser(user_id as string, followed_user_id as string)

  res.status(httpStatusCode.OK).json({
    message: usersMessages.FOLLOW_SUCCESS
  })
})
export const unfollowControllers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  //// Me
  const user_id = req.decoded_authorization?.userId
  //Followed User
  const followed_user_id = req.body.followed_user_id

  await usersServices.unfollowUser(user_id as string, followed_user_id as string)

  res.status(httpStatusCode.OK).json({
    message: usersMessages.UNFOLLOW_SUCCESS
  })
})

//OAUth
const getOauthGoogleToken = async (code: string) => {
  const body = {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_AUTHORIZED_REDIRECT_URI,
    grant_type: 'authorization_code'
  }
  const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  return data as {
    access_token: string
    id_token: string
  }
}
const getGoogleUser = async (id_token: string, access_token: string) => {
  const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
    params: {
      access_token,
      alt: 'json'
    },
    headers: {
      Authorization: `Bearer ${id_token}`
    }
  })
  return data as {
    id: string
    email: string
    verified_email: boolean
    name: string
    given_name: string
    family_name: string
    picture: string
    locale: string
  }
}
export const OauthController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.query
    const { id_token, access_token } = await getOauthGoogleToken(code as string)
    // console.log(id_token, access_token)
    const googleUser = await getGoogleUser(id_token, access_token)

    if (!googleUser.verified_email) {
      throw new ErrorWithStatus({
        status: httpStatusCode.BAD_REQUEST,
        message: usersMessages.USER_NOT_VERIFIED
      })
    }
    const userExist = await DB.users.findOne({ email: googleUser.email })
    if (userExist !== null) {
      // console.log('get old user')
      // console.log(googleUser.email)
      const { refresh_Token, access_Token } =
        await usersServices.signRefreshTokenAndAccessToken_RemoveOldRefreshTokenAndUpdateNewOne(
          userExist._id.toString()
        )
      res.redirect(`http://localhost:3000/login/oauth?access_token=${access_Token}&refresh_token=${refresh_Token}`)
    } else {
      // console.log('create new user')
      const password = (Math.random() + 1).toString(36).substring(7)
      const dataNewUser = await usersServices.register({
        email: googleUser.email,
        username: googleUser.name,
        password: password,
        date_of_birth: new Date(),

        confirm_password: password
      })
      const { access_Token, refresh_Token } = dataNewUser
      res.redirect(`http://localhost:3000/login/oauth?access_token=${refresh_Token}&refresh_token=${access_Token}`)
    }
  } catch (error) {
    next(error)
  }
})
