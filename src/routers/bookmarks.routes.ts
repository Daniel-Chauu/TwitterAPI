import { Router } from 'express'
import bookmarkController from '~/controllers/bookmarks.controller'
import { tweetIdValidator } from '~/middlewares/tweets.middleware'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middleware'

const bookmarkRouter = Router()

bookmarkRouter.post('/', accessTokenValidator, verifiedUserValidator, tweetIdValidator, bookmarkController.bookmarkTweet)

bookmarkRouter.delete('/tweets/:tweet_id', accessTokenValidator, verifiedUserValidator, bookmarkController.unbookmarkTweet)

export default bookmarkRouter
