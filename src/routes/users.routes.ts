import { Router } from 'express'
import {
  OauthController,
  createForgotPasswordTokenControllers,
  followControllers,
  getMyProfileController,
  getUserProfileController,
  loginControllers,
  logoutControllers,
  refreshTokenController,
  registerControllers,
  resendVerifyEmailControllers,
  unfollowControllers,
  updateMyProfileController,
  updatePasswordControllers,
  verifyEmailControllers,
  verifyForgotPasswordTokenControllers
} from '~/controllers/users.controllers'
import { accessTokenValidator } from '~/middlewares/users-middlewares/access_token_validator'
import { emailVerifyTokenValidator } from '~/middlewares/users-middlewares/email_verify_token'
import { createforgotPasswordValidator } from '~/middlewares/users-middlewares/create_forgot_password_validator'
import { validatorLogin } from '~/middlewares/users-middlewares/login_validator'
import { refreshTokenValidator } from '~/middlewares/users-middlewares/refresh_token_validator'
import { registerValidator } from '~/middlewares/users-middlewares/register_validator'
import { verifyForgotPasswordTokenValidator } from '~/middlewares/users-middlewares/verify_forgot_password_token'
import { updatePasswordValidator } from '~/middlewares/users-middlewares/update_password_validator'
import { verifedUserValidator } from '~/middlewares/users-middlewares/verifiy_user_validator'
import { updateMyProfileValidator } from '~/middlewares/users-middlewares/updateMyProfileValidator'
import { filterMiddleware } from '~/middlewares/users-middlewares/common.middleware'
import { UpdateMyProfileRequestBody } from '~/models/interface/requests/Users.requests'
import { followBodyValidator } from '~/middlewares/users-middlewares/follow_body_vaidator'

const usersRouter = Router()

usersRouter.post('/login', validatorLogin, loginControllers)
usersRouter.post('/register', registerValidator, registerControllers)
usersRouter.get('/testapi/test', (req, res, next) => {
  res.end('hello')
})
usersRouter.get('/oauth/google', OauthController)

usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, logoutControllers)

usersRouter.post('/refresh-token', refreshTokenValidator, refreshTokenController)

usersRouter.post('/verify-email', emailVerifyTokenValidator, verifyEmailControllers)

usersRouter.post('/resend-verify-email', accessTokenValidator, resendVerifyEmailControllers)

usersRouter.post('/create-forgot-password-token', createforgotPasswordValidator, createForgotPasswordTokenControllers)

usersRouter.post(
  '/verify-forgot-password-token',
  verifyForgotPasswordTokenValidator,
  verifyForgotPasswordTokenControllers
)

usersRouter.put(
  '/update-password',
  accessTokenValidator,
  // verifedUserValidator,
  updatePasswordValidator,
  updatePasswordControllers
)

usersRouter.get('/get-my-profile', accessTokenValidator, getMyProfileController)

usersRouter.patch(
  '/update-my-profile',
  accessTokenValidator,
  verifedUserValidator,
  filterMiddleware<UpdateMyProfileRequestBody>([
    'avatar',
    'bio',
    'cover_photo',
    'date_of_birth',
    'location',
    'name',
    'username',
    'webstie'
  ]),
  updateMyProfileValidator,
  updateMyProfileController
)

usersRouter.get('/:userId', getUserProfileController)

usersRouter.post('/follow', accessTokenValidator, verifedUserValidator, followBodyValidator, followControllers)

usersRouter.post('/unfollow', accessTokenValidator, verifedUserValidator, followBodyValidator, unfollowControllers)

export default usersRouter
