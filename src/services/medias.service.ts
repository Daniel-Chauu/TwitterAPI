import { Request } from 'express'
import { unlinkSync } from 'fs'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { getExtensionFilename, getNameFileExceptExtension, handleUploadImages, handleUploadVideos } from '~/utils/file'
import 'dotenv/config'
import path from 'path'
import { success } from '~/utils/returnDataSuccess'
import { USER_MESSAGES } from '~/constants/messages'
import { environment } from '~/constants/config'
import 'dotenv/config'
import { Media } from '~/models/Other'
import { MediaType } from '~/constants/enum'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'

const DEVELOPMENT = process.env.ENVIRONTMENT_DEVELOPMENT
const LOCALHOST = process.env.LOCALHOST
const PRODUCTION_HOST = process.env.PRODUCTION_HOST

class MediaService {
  async uploadImages(req: Request) {
    const files = await handleUploadImages(req)

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newFilename = getNameFileExceptExtension(file.newFilename)
        const newPathImage = path.resolve(UPLOAD_IMAGE_DIR, `${newFilename}.jpeg`)
        await sharp(file.filepath).jpeg().toFile(newPathImage)
        unlinkSync(file.filepath)
        return {
          url:
            environment === DEVELOPMENT
              ? `${LOCALHOST}/static/image/${newFilename}.jpeg`
              : `${PRODUCTION_HOST}/static/image/${newFilename}.jpeg`,
          type: MediaType.Image
        }
      })
    )
    return success(USER_MESSAGES.UPLOAD_IMAGE_IS_SUCCESSFULLY, result)
  }
  async uploadVideos(req: Request) {
    const files = await handleUploadVideos(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        // const extension = getExtensionFilename(file.originalFilename as string)
        return {
          url:
            environment === DEVELOPMENT
              ? `${LOCALHOST}/static/video/${file.newFilename}`
              : `${PRODUCTION_HOST}/static/video/${file.newFilename}`,
          type: MediaType.Video
        }
      })
    )
    return success(USER_MESSAGES.UPLOAD_VIDEO_IS_SUCCESSFULLY, result)
  }
  async uploadVideoHLS(req: Request) {
    const files = await handleUploadVideos(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const a = await encodeHLSWithMultipleVideoStreams(file.filepath)
        console.log('🚀 ~ a:', a)
        return {
          url:
            environment === DEVELOPMENT
              ? `${LOCALHOST}/static/video/${file.newFilename}`
              : `${PRODUCTION_HOST}/static/video/${file.newFilename}`,
          type: MediaType.Video
        }
      })
    )
    return success(USER_MESSAGES.UPLOAD_VIDEO_IS_SUCCESSFULLY, result)
  }
}

const mediaService = new MediaService()
export default mediaService
