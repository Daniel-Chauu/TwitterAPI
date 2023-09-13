/* eslint-disable prettier/prettier */
import { validate } from '~/utils/validation'
import { Router } from 'express'
import userController from '~/controllers/users.controller'
import {
  accessTokenValidator,
  changePasswordValidator,
  emailVerifyTokenValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unfollowValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordValidator
} from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const userRouter = Router()

userRouter.post('/register', registerValidator, wrapRequestHandler(userController.register))

userRouter.post('/login', loginValidator, wrapRequestHandler(userController.login))

userRouter.get('/oauth/google', wrapRequestHandler(userController.oauth))

userRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(userController.logout))

userRouter.post('/refresh-token', refreshTokenValidator, userController.refreshToken)

userRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(userController.verifyEmailToken))

userRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(userController.resendVerifyEmailToken))

userRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(userController.forgotPassword))

userRouter.post('/verify-forgot-password', verifyForgotPasswordValidator, wrapRequestHandler(userController.verifyForgotPassword))

userRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandler(userController.resetPassword))

userRouter.get('/me', accessTokenValidator, wrapRequestHandler(userController.getMe))

userRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  wrapRequestHandler(userController.updateMe)
)

userRouter.get('/:username', wrapRequestHandler(userController.getProfile))

userRouter.post(
  '/follow',
  accessTokenValidator,
  verifiedUserValidator,
  followValidator,
  wrapRequestHandler(userController.follow)
)

userRouter.delete(
  '/follow/:user_id',
  accessTokenValidator,
  verifiedUserValidator,
  unfollowValidator,
  wrapRequestHandler(userController.unfollow)
)

userRouter.patch(
  '/change-password',
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  wrapRequestHandler(userController.changePassword)
)

export default userRouter
