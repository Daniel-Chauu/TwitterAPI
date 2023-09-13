import { Router } from 'express'
import tweetController from '~/controllers/tweets.controller'
import {
  audienceValidator,
  createTweetValidator,
  isUserLoggedInValidator,
  tweetIdValidator
} from '~/middlewares/tweets.middleware'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const tweetRouter = Router()

tweetRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createTweetValidator,
  wrapRequestHandler(tweetController.createTweet)
)

tweetRouter.get(
  '/:tweet_id',
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  wrapRequestHandler(tweetController.getTweetDetail)
)

export default tweetRouter
