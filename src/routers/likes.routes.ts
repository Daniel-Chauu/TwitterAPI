import { Router } from 'express'
import likeController from '~/controllers/likes.controller'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middleware'

const likeRouter = Router()

likeRouter.post('/', accessTokenValidator, verifiedUserValidator, likeController.likePost)

likeRouter.delete('/:tweet_id', accessTokenValidator, verifiedUserValidator, likeController.unlikePost)

export default likeRouter
