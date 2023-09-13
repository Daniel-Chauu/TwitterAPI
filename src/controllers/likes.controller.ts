import { Request, Response } from 'express'
import { TokenPayload, likeReqBody } from '~/models/requests/User.request'
import likeService from '~/services/likes.service'

const likeController = {
  likePost: async (req: Request<any, any, likeReqBody>, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const { tweet_id } = req.body
    const response = await likeService.likePost({ user_id, tweet_id })
    res.json(response)
  },
  unlikePost: async (req: Request, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const { tweet_id } = req.params
    const response = await likeService.unlikePost({ user_id, tweet_id })
    res.json(response)
  }
}

export default likeController
