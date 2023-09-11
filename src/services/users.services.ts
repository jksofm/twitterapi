import User from '~/models/schemas/User.schema'
import { DB } from './database.services'
import { NextFunction, Response } from 'express'
import {
  LoginRequestBody,
  RegisterRequestBody,
  UpdateMyProfileRequestBody
} from '~/models/interface/requests/Users.requests'
import { signToken, verifyToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enums'
import { hashPassword } from '~/utils/crypto'
import { ObjectId } from 'mongodb'
import Refresh_Token_Schema from '~/models/schemas/RefreshToken_schema'

import { usersMessages } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/interface/errors/Error'
import httpStatusCode from '~/constants/httpStatusCode'
import { pick } from 'lodash'
import Follower_schema from '~/models/schemas/Follower.schema'
import { dotenvConfig } from '~/utils/dotenv'
import { sendForgotPasswordEmail, sendVerifyEmail } from '~/utils/send-email'

dotenvConfig()
class UsersServices {
  constructor() {}
  private async signAccessToken(userId: string) {
    return signToken(
      {
        userId,
        token_type: TokenType.Access_Token
      },
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as string
        // expiresIn : '10s'
      },

      process.env.JWT_SECRET_ACCESS_TOKEN as string
    )
  }
  private async signRefreshToken(userId: string, exp?: number) {
    if (exp) {
      return signToken(
        {
          userId,
          token_type: TokenType.Refresh_Token,
          exp
        },
        {},
        // {
        //   expiresIn: `${exp}`
        // },
        process.env.JWT_SECRET_REFRESH_TOKEN as string
      )
    }
    return signToken(
      {
        userId,
        token_type: TokenType.Refresh_Token
      },
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as string
      },
      process.env.JWT_SECRET_REFRESH_TOKEN as string
    )
  }
  private async signEmailVerifyToken(userId: string) {
    return signToken(
      {
        userId,
        token_type: TokenType.Verify_Email_Token
      },
      {
        expiresIn: process.env.VERIFY_EMAIL_TOKEN_EXPIRES_IN as string
      },
      process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
    )
  }
  private async signForgotPasswordToken(userId: string) {
    return signToken(
      {
        userId,
        token_type: TokenType.Forgot_Password_Token
      },
      {
        expiresIn: process.env.VERIFY_FORGOT_PASSWORD_TOKEN_EXPIRES_IN as string
      },
      process.env.JWT_SECRET_FORGOT_PASSWORD_VERIFY_TOKEN as string
    )
  }
  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({ token: refresh_token, secretKey: process.env.JWT_SECRET_REFRESH_TOKEN as string })
  }
  async signRefreshTokenAndAccessToken(user_id: string) {
    const [refresh_Token, access_Token] = await Promise.all([
      this.signRefreshToken(user_id),
      this.signAccessToken(user_id)
    ])

    return { refresh_Token, access_Token }
  }
  async signRefreshTokenAndAccessToken_RemoveOldRefreshTokenAndUpdateNewOne(
    user_id: string,
    token?: string,
    exp?: number
  ) {
    await DB.refreshToken.deleteMany({ user_id: new ObjectId(user_id), token })
    const [refresh_Token, access_Token] = await Promise.all([
      this.signRefreshToken(user_id, exp),
      this.signAccessToken(user_id)
    ])
    const { iat } = await this.decodeRefreshToken(refresh_Token)
    await DB.refreshToken.insertOne(
      new Refresh_Token_Schema({ token: refresh_Token, user_id: new ObjectId(user_id), iat, exp })
    )
    return { refresh_Token, access_Token }
  }
  async register(payload: RegisterRequestBody) {
    const newUser = await DB.users.insertOne(new User(payload))
    const user_id = newUser.insertedId.toString()
    ///Tao refresh token va accesstoken de gui cho client
    const { refresh_Token, access_Token } = await this.signRefreshTokenAndAccessToken(user_id)
    //Luu refrsh token vao trong database
    const { iat, exp } = await this.decodeRefreshToken(refresh_Token)
    const newRefreshToken = await DB.refreshToken.insertOne(
      new Refresh_Token_Schema({ token: refresh_Token, user_id: newUser.insertedId, iat, exp })
    )
    //Verify email
    const email_verify_token = await this.signEmailVerifyToken(user_id)
    await DB.users.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { email_verify_token: email_verify_token, updated_at: new Date() } }
    )
    await sendVerifyEmail(payload.email, email_verify_token)

    return { newUser, refresh_Token, access_Token, email_verify_token }
  }
  async checkEmailExist(email: string) {
    const user = await DB.users.findOne({ email })
    return Boolean(user)
  }
  async checkUsernameExist(username: string) {
    const user = await DB.users.findOne({ username })
    return Boolean(user)
  }
  async login(payload: LoginRequestBody) {
    const user = await DB.users.findOne(
      { ...payload, password: hashPassword(payload.password) },
      {
        projection: {
          name: 1,
          email: 1,
          username: 1,
          avatar: 1,
          cover_photo: 1,
          verify: 1,
          location: 1
        }
      }
    )
    if (user) {
      const user_id = user._id.toString()

      const { refresh_Token, access_Token } = await this.signRefreshTokenAndAccessToken(user_id)
      //Luu refrsh token vao trong database
      const { iat, exp } = await this.decodeRefreshToken(refresh_Token)
      await DB.refreshToken.insertOne(
        new Refresh_Token_Schema({ token: refresh_Token, user_id: new ObjectId(user_id), iat, exp })
      )

      return { refresh_Token, access_Token }
    }
  }
  async logout(refresh_token: string) {
    const result = await DB.refreshToken.deleteOne({ token: refresh_token })
  }
  async verifyEmail(user_id: string) {
    const result = await DB.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          email_verify_token: '',
          verify: 1
        },
        $currentDate: {
          updated_at: true
        }
      }
    )

    const { refresh_Token, access_Token } =
      await this.signRefreshTokenAndAccessToken_RemoveOldRefreshTokenAndUpdateNewOne(user_id)

    return {
      refresh_Token,
      access_Token
    }
  }
  async resendVerifyEmailToken(user_id: string, email: string) {
    const email_verify_token = await this.signEmailVerifyToken(user_id)
    await DB.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: { email_verify_token },
        $currentDate: {
          updated_at: true
        }
      }
    )

    sendVerifyEmail(email, email_verify_token)
    return {
      email_verify_token
    }
  }
  async createPasswordToken(user_id: string) {
    const forgot_password_token = await this.signForgotPasswordToken(user_id)
    await DB.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          forgot_password_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    const user = await DB.users.findOne({ _id: new ObjectId(user_id) })
    sendForgotPasswordEmail(user?.email as string, forgot_password_token)
    return {
      forgot_password_token ///Send Email
    }
  }
  async verifyPasswordToken(user_id: string, forgot_password_token: string) {
    const user = await DB.users.findOne({ _id: new ObjectId(user_id) })

    if (forgot_password_token !== user?.forgot_password_token) {
      throw new ErrorWithStatus({
        message: usersMessages.FORGOT_PASSWORD_TOKEN_IS_INVALID,
        status: httpStatusCode.UNAUTHORIZED
      })
    }

    const { refresh_Token, access_Token } =
      await this.signRefreshTokenAndAccessToken_RemoveOldRefreshTokenAndUpdateNewOne(user_id)

    return {
      refresh_Token,
      access_Token
    }
  }
  async updatePassword(newPassword: string, user_id: string, old_password?: string) {
    if (old_password) {
      const user = await DB.users.findOne({ _id: new ObjectId(user_id) })
      if (user?.password !== hashPassword(old_password)) {
        throw new ErrorWithStatus({
          message: usersMessages.CURRENT_PASSWORD_IS_NOT_CORRECT,
          status: httpStatusCode.UNAUTHORIZED
        })
      }
    }
    await DB.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          password: hashPassword(newPassword),
          forgot_password_token: ''
        },
        $currentDate: {
          updated_at: true
        }
      }
    )

    const { refresh_Token, access_Token } =
      await this.signRefreshTokenAndAccessToken_RemoveOldRefreshTokenAndUpdateNewOne(user_id)

    return { refresh_Token, access_Token }
  }
  async getMyProfile(user_id: string) {
    try {
      const user = await DB.users.findOne(
        { _id: new ObjectId(user_id) },
        {
          projection: {
            name: 1,
            email: 1,
            username: 1,
            avatar: 1,
            cover_photo: 1,
            verify: 1,
            location: 1,
            bio: 1,
            website: 1,
            date_of_birth: 1
          }
        }
      )
      return user
    } catch (error) {
      throw new ErrorWithStatus({ message: usersMessages.USER_IS_NOT_FOUND, status: httpStatusCode.NOT_FOUND })
    }
  }
  async updateMyProfile(user_id: string, body: UpdateMyProfileRequestBody) {
    const payload = body.date_of_birth ? { ...body, date_of_birth: new Date(body.date_of_birth) } : body

    const user = await DB.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: payload as UpdateMyProfileRequestBody & { date_of_birth?: Date },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          forgot_password_token: 0,
          email_verify_token: 0,
          created_at: 0,
          verify: 0
        }
      }
    )
    return user.value
  }
  async getUserProfile(user_id: string) {
    try {
      const user = await DB.users.findOne(
        { _id: new ObjectId(user_id) },
        {
          projection: {
            name: 1,
            email: 1,
            username: 1,
            avatar: 1,
            cover_photo: 1,
            verify: 1,
            location: 1,
            bio: 1,
            website: 1
          }
        }
      )
      console.log(user)
      return user
    } catch (error) {
      throw new ErrorWithStatus({ message: usersMessages.USER_IS_NOT_FOUND, status: httpStatusCode.NOT_FOUND })
    }
  }
  async followUser(current_user_id: string, followed_user_id: string) {
    const checkExistFollower = await DB.follower.findOne({
      user_id: new ObjectId(current_user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })

    if (checkExistFollower !== null) {
      throw new ErrorWithStatus({
        message: usersMessages.YOU_ALREADY_FOLLOWED_THIS_USER,
        status: httpStatusCode.FORBIDDEN
      })
    }
    await DB.follower.insertOne(
      new Follower_schema({ user_id: new ObjectId(current_user_id), followed_user_id: new ObjectId(followed_user_id) })
    )
  }
  async unfollowUser(current_user_id: string, followed_user_id: string) {
    const checkExistFollower = await DB.follower.findOne({
      user_id: new ObjectId(current_user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })

    if (checkExistFollower === null) {
      throw new ErrorWithStatus({
        message: usersMessages.YOU_NOT_FOLLOWED_THIS_USER_YET,
        status: httpStatusCode.FORBIDDEN
      })
    }
    await DB.follower.deleteOne({
      user_id: new ObjectId(current_user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
  }
}

export const usersServices = new UsersServices()
