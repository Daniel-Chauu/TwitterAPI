import { Router } from 'express'
import userRouter from './user.routes'
const rootRouter = Router()

rootRouter.use('/user', userRouter)

export default rootRouter
