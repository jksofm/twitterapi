import { JwtPayload } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { TokenType, TweetAudience, TweetType } from '~/constants/enums'
import { Media } from '../media/media'

export interface RegisterRequestBody {
  username: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: Date
}
export interface LoginRequestBody {
  email: string
  password: string
}
export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
  iat?: number
  exp?: number
}
export interface updatePasswordRequestBody {
  old_password?: string
  new_password: string
  confirm_new_password: string
}
export interface UpdateMyProfileRequestBody {
  name?: string
  date_of_birth?: string
  bio?: string
  location?: string
  webstie?: string
  username?: string
  avatar?: string
  cover_photo?: string
}
