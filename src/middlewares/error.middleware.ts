import { NextFunction, Request, Response } from 'express'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'
import { logError, omit, pick } from '~/utils/utils'

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logError(err, req)
  if (err instanceof ErrorWithStatus) {
    return res.status(err.status).json(err)
  }

  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, { enumerable: true })
  })

  res.status(err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: err.message,
    errorInfo: omit(err, 'stack')
  })
}
