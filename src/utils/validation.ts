import express from 'express'
import { body, validationResult, ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { Entity, ErrorWithStatus } from '~/models/Errors'
import { checkEmptyObj } from './utils'

export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await validation.run(req)
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }
    const objectErrors = errors.mapped()
    const EntityErrors = new Entity({ errors: {} })
    const ErrorStatus = new ErrorWithStatus({ message: '', status: 400 })
    for (const key in objectErrors) {
      const { msg } = objectErrors[key]
      if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        ErrorStatus.message = msg.message
        ErrorStatus.status = msg.status
      } else {
        EntityErrors.errors[key] = objectErrors[key]
      }
    }
    if (checkEmptyObj(EntityErrors.errors)) return next(ErrorStatus)
    next(EntityErrors)
  }
}
