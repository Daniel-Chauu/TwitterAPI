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

const isEmptyArr = <T>(arr: Array<T>) => {
  return arr?.length === 0
}

const pick = <T>(obj: T, array: (keyof T)[]): Partial<T> => {
  const pickDate: Partial<T> = {}
  array.forEach((item) => {
    if (obj[item]) {
      pickDate[item] = obj[item]
    }
  })
  return pickDate
}

const omit = (obj: any, key: string) => {
  const { [key]: omitKey, ...data } = obj
  return data
}

export { logError, checkEmptyObj, isEmptyArr, pick, omit }
