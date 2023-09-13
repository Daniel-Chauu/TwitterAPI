import { Router } from 'express'
import staticController from '~/controllers/statics.controller'

const staticRouter = Router()

staticRouter.get('/image/:filename', staticController.serveImage)

staticRouter.get('/video-stream/:filename', staticController.serveVideo)

export default staticRouter
