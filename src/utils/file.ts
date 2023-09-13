import { Request } from 'express'
import { existsSync, mkdirSync, renameSync } from 'fs'
import path from 'path'
import { success } from './returnDataSuccess'
import { File } from 'formidable'
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'

const initFolder = () => {
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR].forEach((dir) => {
    if (!existsSync(dir)) {
      mkdirSync(dir, {
        recursive: true
      })
    }
  })
}

const handleUploadImages = async (req: Request) => {
  const formidable = (await import('formidable')).default

  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
    maxFiles: 4,
    keepExtensions: true, // save extension file / VD :  false -> anime  || true -> anime.png
    maxFileSize: 300 * 1024, // 300KB,
    maxTotalFileSize: 300 * 1024 * 4,
    filter: ({ name, mimetype, originalFilename }) => {
      if (name !== 'image') {
        form.emit('error' as any, new Error('You must be upload an image with key is image') as any)
      }
      if (!mimetype?.includes('image/')) {
        form.emit('error' as any, new Error('Invalid file type') as any)
      }
      return true
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, file) => {
      if (err) {
        return reject(err)
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(file?.image)) {
        return reject(new Error('File is not empty'))
      }
      resolve(file.image)
    })
  })
}

const handleUploadVideos = async (req: Request) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR,
    maxFiles: 1,
    maxFileSize: 50 * 1024 * 1024,
    filter({ name, originalFilename, mimetype }) {
      if (name !== 'video') {
        form.emit('error' as any, new Error('You must be upload an video with key is video') as any)
      }
      return true
    }
  })
  return new Promise<File[]>((res, rej) => {
    form.parse(req, (err, fields, file) => {
      if (err) rej(err)

      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(file?.video)) {
        return rej(new Error('File is not empty'))
      }

      const videos = file.video as File[]
      videos.forEach((video) => {
        const ext = getExtensionFilename(video.originalFilename as string)
        renameSync(video.filepath, `${video.filepath}.${ext}`)
        video.newFilename = video.newFilename + '.' + ext
        video.filepath = video.filepath + '.' + ext
      })

      res(file.video as File[])
    })
  })
}

const getNameFileExceptExtension = (filename: string) => {
  const filenameArr = filename.split('.')
  filenameArr.pop()
  return filenameArr.join('')
}

export const getExtensionFilename = (filename: string) => {
  const extension = filename.split('.')
  return extension[extension.length - 1]
}

export { initFolder, handleUploadImages, handleUploadVideos, getNameFileExceptExtension }
