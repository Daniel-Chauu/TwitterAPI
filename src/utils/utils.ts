import { Request } from 'express'

const logError = (err: any, req: Request) => {
  console.log('ERROR LOG ', new Date().toLocaleString())
  console.log('Request:', req.method, req.originalUrl)
  console.log('Params:', req.params)
  console.log('Body:', req.body)
  console.log('Query:', req.query)
  console.log('Error: ', err)
  console.log('Error stack: ', err.stack)
  console.log('--------------------------------------------------------------------------------------')
}

const checkEmptyObj = (obj: object) => {
  return Object.keys(obj).length === 0
}

export { logError, checkEmptyObj }
