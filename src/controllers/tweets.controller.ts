import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { TokenPayload } from '~/models/requests/User.request'
import tweetService from '~/services/tweets.service'
import { TweetReqBody } from '~/models/requests/Tweet.request'
import { success } from '~/utils/returnDataSuccess'
import { TWEET_MESSAGE } from '~/constants/messages'
import { Tweet } from '~/models/schemas/Tweet.schema'

const tweetController = {
  createTweet: async (req: Request<ParamsDictionary, any, TweetReqBody>, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const { body } = req
    const response = await tweetService.createTweet({ user_id, body })
    res.json(response)
  },
  getTweetDetail: async (req: Request, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const tweet_id = req.tweet?._id?.toString() as string
    const view = await tweetService.increaseView({ tweet_id, user_id })
    const tweet = { ...req.tweet, ...view }
    res.json(success(TWEET_MESSAGE.GET_TWEET_SUCCESSFULLY, tweet))
  }
}

export default tweetController
