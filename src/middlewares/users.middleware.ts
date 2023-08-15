import { NextFunction, Request, Response } from 'express'
import { ParamSchema, check, checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { USER_MESSAGES } from '~/constants/messages'
import { REGEX_USERNAME } from '~/constants/regex'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/User.request'
import database from '~/services/database.service'
import userService from '~/services/users.service'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

const BEAR_TOKEN = 'Bearer'
const env = process.env

const passwordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.PASSOWRD_IS_REQUIRED
  },
  isString: {
    errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_A_STRING
  },
  trim: true,
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

const confirmPasswordSchema: ParamSchema = {
  custom: {
    options: (value, { req }) => {
      if (!value) {
        throw new Error(USER_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED)
      }
      if (value !== req.body.password) {
        throw new Error(USER_MESSAGES.CONFIRM_PASSWORD_DOESN_NOT_MATCH_PASSWORD)
      }
      return true
    }
  }
}

const forgotPasswordSchema: ParamSchema = {
  custom: {
    options: async (value, { req }) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: USER_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
      try {
        const decoded_forgot_password_token = await verifyToken({
          token: value,
          jwtSecret: env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
        })
        ;(req as Request).decoded_forgot_password_token = decoded_forgot_password_token
        const user = await database.users.findOne({ _id: new ObjectId(decoded_forgot_password_token.user_id) })
        if (!user) {
          throw new ErrorWithStatus({
            message: USER_MESSAGES.USER_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        if (user.forgot_password_token !== value) {
          throw new ErrorWithStatus({
            message: USER_MESSAGES.INVALID_FORGOT_PASSWORD_TOKEN,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        return true
      } catch (error) {
        if (error instanceof JsonWebTokenError) {
          throw new ErrorWithStatus({
            message: error.message,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        throw error
      }
    }
  }
}

const nameSchema: ParamSchema = {
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
}

const dateOfBirthSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.DATE_OF_BIRTH_IS_REQUIRED
  },
  isISO8601: {
    errorMessage: USER_MESSAGES.DATE_OF_BIRTH_MUST_BE_A_ISO8601,
    options: {
      strict: true,
      strictSeparator: true
    }
  }
}

const userIdSchema: (msgIsObjectId: string) => ParamSchema = (msgIsObjectId) => {
  return {
    custom: {
      options: async (value: string) => {
        if (!ObjectId.isValid(value)) {
          throw new ErrorWithStatus({
            message: msgIsObjectId,
            status: HTTP_STATUS.NOT_FOUND
          })
        }

        const user = await database.users.findOne({ _id: new ObjectId(value) })
        if (!user) {
          throw new ErrorWithStatus({
            message: USER_MESSAGES.USER_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
      }
    }
  }
}

const loginValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: { errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED },
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
        trim: true,
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
      name: nameSchema,
      email: {
        notEmpty: { errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED },
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
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      date_of_birth: dateOfBirthSchema
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

const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: { errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED },
        isEmail: { errorMessage: USER_MESSAGES.EMAIL_IS_INVALID },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await userService.findUser(value)
            const isUserExist = Boolean(user)

            if (isUserExist) {
              req.user = user
              return true
            }
            throw new ErrorWithStatus({
              message: USER_MESSAGES.EMAIL_IS_NOT_EXISTS,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }
        }
      }
    },
    ['body']
  )
)

const verifyForgotPasswordValidator = validate(
  checkSchema(
    {
      forgot_password_token: forgotPasswordSchema
    },
    ['body']
  )
)

const resetPasswordValidator = validate(
  checkSchema({
    forgot_password_token: forgotPasswordSchema,
    password: passwordSchema,
    confirm_password: confirmPasswordSchema
  })
)

const verifiedUserValidator = (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decoded_authorization as TokenPayload
  if (verify === UserVerifyStatus.Unverified) {
    return next(
      new ErrorWithStatus({
        message: USER_MESSAGES.USER_HAVE_NOT_VERIFIED,
        status: HTTP_STATUS.FORBIDDEN
      })
    )
  }
  next()
}

const updateMeValidator = validate(
  checkSchema({
    name: {
      ...nameSchema,
      optional: true,
      isEmpty: undefined
    },
    date_of_birth: {
      ...dateOfBirthSchema,
      optional: true,
      isEmpty: undefined
    },
    bio: {
      optional: true,
      isString: {
        errorMessage: USER_MESSAGES.BIO_MUST_BE_A_STRING
      },
      trim: true,
      isLength: {
        errorMessage: USER_MESSAGES.BIO_LENGTH_MUST_BE_FROM_2_TO_200,
        options: {
          min: 2,
          max: 200
        }
      }
    },
    username: {
      optional: true,
      isString: {
        errorMessage: USER_MESSAGES.USERNAME_MUST_BE_A_STRING
      },
      trim: true,
      custom: {
        options: async (value) => {
          if (!REGEX_USERNAME.test(value)) {
            throw Error(USER_MESSAGES.INVALID_USERNAME)
          }
          const username = await database.users.findOne({ username: value })
          if (username) {
            throw Error(USER_MESSAGES.USERNAME_EXISTED)
          }
        }
      }
    },
    avatar: {
      optional: true,
      isString: {
        errorMessage: USER_MESSAGES.IMAGE_URL_MUST_BE_A_STRING
      },
      trim: true
    },
    cover_photo: {
      optional: true,
      isString: {
        errorMessage: USER_MESSAGES.IMAGE_URL_MUST_BE_A_STRING
      },
      trim: true
    }
  })
)

const followValidator = validate(
  checkSchema(
    {
      followed_user_id: userIdSchema(USER_MESSAGES.INVALID_FOLLOWED_USER_ID)
    },
    ['body']
  )
)

const unfollowValidator = validate(
  checkSchema(
    {
      user_id: userIdSchema(USER_MESSAGES.INVALID_USER_ID)
    },
    ['params']
  )
)

const changePasswordValidator = validate(
  checkSchema({
    old_password: {
      notEmpty: {
        errorMessage: USER_MESSAGES.OLD_PASSWORD_IS_REQUIRED
      },
      custom: {
        options: async (value, { req }) => {
          const { user_id } = (req as Request).decoded_authorization as TokenPayload
          const user = await database.users.findOne({ _id: new ObjectId(user_id) })
          if (!user) {
            throw new ErrorWithStatus({
              message: USER_MESSAGES.USER_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          const { password } = user
          const isMatch = password === hashPassword(value)
          if (!isMatch) {
            throw new ErrorWithStatus({
              message: USER_MESSAGES.OLD_PASSWORD_IS_INCORRECT,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }
        }
      }
    },
    password: passwordSchema,
    confirm_password: confirmPasswordSchema
  })
)

export {
  userIdSchema,
  loginValidator,
  registerValidator,
  accessTokenValidator,
  refreshTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  verifyForgotPasswordValidator,
  resetPasswordValidator,
  verifiedUserValidator,
  updateMeValidator,
  followValidator,
  unfollowValidator,
  changePasswordValidator
}
