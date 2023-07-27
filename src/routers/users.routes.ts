import { Request, Response, Router } from 'express'
import userController from '~/controllers/users.controller'

const userRouter = Router()

userRouter.post('/register', userController.register)

export default userRouter
