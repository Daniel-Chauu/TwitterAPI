import { Request, Response } from 'express'
import mediaService from '~/services/medias.service'

const mediaController = {
  uploadImages: async (req: Request, res: Response) => {
    const response = await mediaService.uploadImages(req)
    res.json(response)
  },
  uploadVideos: async (req: Request, res: Response) => {
    const response = await mediaService.uploadVideos(req)
    res.json(response)
  },
  uploadVideoHLS: async (req: Request, res: Response) => {
    const response = await mediaService.uploadVideoHLS(req)
    res.json(response)
  }
}

export default mediaController
