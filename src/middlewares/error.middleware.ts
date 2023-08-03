import { NextFunction, Request, Response } from 'express'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { logError } from '~/utils/utils'

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logError(err, req)
  res.status(err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json(err)
}
