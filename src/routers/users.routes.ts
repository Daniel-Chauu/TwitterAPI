import { validate } from '~/utils/validation'
import { Router } from 'express'
import userController from '~/controllers/users.controller'
import { registerValidator } from '~/middlewares/users.middleware'

const userRouter = Router()

userRouter.post('/register', registerValidator, userController.register)

export default userRouter
