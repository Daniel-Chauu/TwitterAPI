import { Router } from 'express'
import userRouter from './users.routes'
import { errorHandler } from '~/middlewares/error.middleware'
const rootRouter = Router()

rootRouter.use('/users', userRouter)

//Error handler
rootRouter.use(errorHandler)

export default rootRouter
