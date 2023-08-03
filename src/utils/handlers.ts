import { NextFunction, Request, RequestHandler, Response } from 'express'

const wrapRequestHandler = (fn: RequestHandler) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await fn(req, res, next)
  } catch (error) {
    next(error)
  }
}

export { wrapRequestHandler }
