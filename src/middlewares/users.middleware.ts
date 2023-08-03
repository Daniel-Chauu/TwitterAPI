import { Request } from 'express'
import { check, checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { USER_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import database from '~/services/database.service'
import userService from '~/services/users.service'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

const BEAR_TOKEN = 'Bearer'
const env = process.env

const loginValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: { errorMessage: USER_MESSAGES.EMAIL_ALREADY_EXISTS },
        isEmail: { errorMessage: USER_MESSAGES.EMAIL_IS_INVALID },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await userService.findUser(value, hashPassword(req.body.password))
            const isUserExist = Boolean(user)

            if (isUserExist) {
              req.user = user
              return true
            }
            throw new ErrorWithStatus({
              message: USER_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: USER_MESSAGES.PASSOWRD_IS_REQUIRED
        },
        isString: {
          errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_A_STRING
        },
        isLength: {
          errorMessage: USER_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50,
          options: {
            min: 6,
            max: 50
          }
        },
        isStrongPassword: {
          errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRONG,
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          }
        }
      }
    },
    ['body']
  )
)

const registerValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: USER_MESSAGES.NAME_IS_REQUIRED
        },
        isString: {
          errorMessage: USER_MESSAGES.NAME_MUST_BE_A_STRING
        },
        isLength: {
          errorMessage: USER_MESSAGES.NAME_LENGTH_MUST_BE_FROM_2_TO_100,
          options: {
            min: 2,
            max: 100
          }
        },
        trim: true
      },
      email: {
        notEmpty: { errorMessage: USER_MESSAGES.EMAIL_ALREADY_EXISTS },
        isEmail: { errorMessage: USER_MESSAGES.EMAIL_IS_INVALID },
        trim: true,
        custom: {
          options: async (value) => {
            const user = await userService.findUser(value)
            const isUserExist = Boolean(user)

            if (isUserExist)
              throw new ErrorWithStatus({
                message: USER_MESSAGES.EMAIL_ALREADY_EXISTS,
                status: HTTP_STATUS.BAD_REQUEST
              })
            return true
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: USER_MESSAGES.PASSOWRD_IS_REQUIRED
        },
        isString: {
          errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_A_STRING
        },
        isLength: {
          errorMessage: USER_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50,
          options: {
            min: 6,
            max: 50
          }
        },
        isStrongPassword: {
          errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRONG,
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          }
        }
      },

      confirm_password: {
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error(USER_MESSAGES.CONFIRM_PASSWORD_DOESN_NOT_MATCH_PASSWORD)
            }
            return true
          }
        }
      },
      date_of_birth: {
        isISO8601: {
          errorMessage: USER_MESSAGES.DATE_OF_BIRTH_MUST_BE_A_ISO8601,
          options: {
            strict: true,
            strictSeparator: true
          }
        }
      }
    },
    ['body']
  )
)

const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        custom: {
          options: async (value: string, { req }) => {
            if (!value)
              throw new ErrorWithStatus({
                message: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })

            const isBearToken = value.split(' ')[0]
            if (isBearToken !== BEAR_TOKEN)
              throw new ErrorWithStatus({
                message: USER_MESSAGES.ACCESS_TOKEN_IS_MALFORMED,
                status: HTTP_STATUS.UNAUTHORIZED
              })

            const token = value.split(' ')[1]

            try {
              const decoded = await verifyToken({ token, jwtSecret: env.JWT_SECRET_ACCESS_TOKEN as string })
              ;(req as Request).decoded_authorization = decoded
              return true
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: error?.message,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
            }
          }
        }
      }
    },
    ['headers']
  )
)

const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        custom: {
          options: async (value: string, { req }) => {
            console.log('🚀 ~ value:', value)
            if (!value)
              throw new ErrorWithStatus({
                message: USER_MESSAGES.REFRESH_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            try {
              const [decoded_refresh_token, refreshToken] = await Promise.all([
                verifyToken({ token: value, jwtSecret: env.JWT_SECRET_REFRESH_TOKEN as string }),
                database.refreshToken.findOne({ token: value })
              ])
              if (!refreshToken) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGES.REFRESH_TOKEN_IS_USED_OR_NOT_EXIST,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              ;(req as Request).decoded_refresh_token = decoded_refresh_token
              return true
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: error?.message,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              throw error
            }
          }
        }
      }
    },
    ['body']
  )
)

const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded_email_verify_token = await verifyToken({
                token: value,
                jwtSecret: env.JWT_SECRET_EMAIL_TOKEN as string
              })
              ;(req as Request).decoded_email_verify_token = decoded_email_verify_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: error?.message,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              throw error
            }
          }
        }
      }
    },
    ['body']
  )
)

export { loginValidator, registerValidator, accessTokenValidator, refreshTokenValidator, emailVerifyTokenValidator }
