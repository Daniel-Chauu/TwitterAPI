import { validate } from '~/utils/validation'
import { Router } from 'express'
import userController from '~/controllers/users.controller'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const userRouter = Router()

userRouter.post('/register', registerValidator, wrapRequestHandler(userController.register))

userRouter.post('/login', loginValidator, wrapRequestHandler(userController.login))

userRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(userController.logout))

userRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(userController.verifyEmailToken))

userRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(userController.resendVerifyEmailToken))

export default userRouter
