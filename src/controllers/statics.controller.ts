import { Request, Response } from 'express'
import { createReadStream, statSync, statfsSync } from 'fs'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { USER_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import mime from 'mime'

const staticController = {
  serveImage: (req: Request, res: Response) => {
    const { filename } = req.params
    return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, filename), (err) => {
      if (err) res.status((err as any).status).send('NOT FOUND')
    })
  },
  serveVideo: (req: Request, res: Response) => {
    const { range } = req.headers
    if (!range) {
      return res.status(HTTP_STATUS.BAD_REQUEST).send(USER_MESSAGES.RANGE_IS_REQUIRED)
    }
    const { filename } = req.params
    const videoPath = path.resolve(UPLOAD_VIDEO_DIR, filename)
    const videoSize = statSync(videoPath).size
    const chunkSize = 10 ** 6
    const start = Number(range.replace(/\D/g, ''))
    const end = Math.min(start + chunkSize, videoSize - 1)
    const contentLength = end - start + 1
    const contentType = mime.getType(videoPath) || 'video/*'
    const headers = {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': contentType
    }
    res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers)
    const videoSteams = createReadStream(videoPath, { start, end })
    videoSteams.pipe(res)
    // const { filename } = req.params
    // return res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, filename), (err) => {
    //   if (err) res.status((err as any).status).send('NOT FOUND')
    // })
  }
}

export default staticController
