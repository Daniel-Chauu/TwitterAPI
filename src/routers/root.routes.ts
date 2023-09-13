import { Router } from 'express'
import userRouter from './users.routes'
import { errorHandler } from '~/middlewares/error.middleware'
import mediaRouter from './medias.routes'
import staticRouter from './static.routes'
import tweetRouter from './tweets.routes'
import bookmarkRouter from './bookmarks.routes'
import likeRouter from './likes.routes'
const rootRouter = Router()

rootRouter.use('/users', userRouter)

rootRouter.use('/medias', mediaRouter)

rootRouter.use('/tweets', tweetRouter)

rootRouter.use('/bookmarks', bookmarkRouter)

rootRouter.use('/likes', likeRouter)

//Error handler
rootRouter.use(errorHandler)

export default rootRouter
