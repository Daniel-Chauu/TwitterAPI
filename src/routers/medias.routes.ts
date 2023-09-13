import express from 'express'
import mediaController from '~/controllers/medias.controller'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const mediaRouter = express.Router()

mediaRouter.post('/upload-images', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(mediaController.uploadImages))

mediaRouter.post('/upload-videos', wrapRequestHandler(mediaController.uploadVideos))

mediaRouter.post(
  '/upload-video-hls',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(mediaController.uploadVideoHLS)
)

export default mediaRouter
