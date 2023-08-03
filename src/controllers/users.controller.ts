import { Request, Response } from 'express'
import userService from '~/services/users.service'
import { ParamsDictionary } from 'express-serve-static-core'
import { LogoutBody, RegisterBody, TokenPayload } from '~/models/requests/User.request'
import { hashPassword } from '~/utils/crypto'
import User from '~/models/schemas/User.schema'
import { success } from '~/utils/returnDataSuccess'
import { USER_MESSAGES } from '~/constants/messages'
import { HTTP_STATUS } from '~/constants/httpStatus'

const userController = {
  register: async (req: Request<ParamsDictionary, any, RegisterBody>, res: Response) => {
    const response = await userService.register(req.body)
    res.status(HTTP_STATUS.CREATED).json(response)
  },
  login: async (req: Request, res: Response) => {
    const { _id } = req.user as User
    const user_id = _id?.toString() as string
    const [access_token, refresh_token] = await userService.login(user_id)
    res.status(HTTP_STATUS.OK).json(
      success(USER_MESSAGES.LOGIN_SUCCESS, {
        access_token,
        refresh_token,
        user: req.user
      })
    )
  },
  logout: async (req: Request<ParamsDictionary, any, LogoutBody>, res: Response) => {
    const { decoded_refresh_token } = req
    const response = await userService.logout(decoded_refresh_token?.user_id as string)
    res.status(HTTP_STATUS.OK).json(response)
  },
  verifyEmailToken: async (req: Request, res: Response) => {
    const { decoded_email_verify_token } = req
    const response = await userService.verifyEmailToken(decoded_email_verify_token as TokenPayload)
    res.status(HTTP_STATUS.OK).json(response)
  },
  resendVerifyEmailToken: async (req: Request, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const response = await userService.resendVerifyEmailToken(user_id)
    res.status(HTTP_STATUS.OK).json(response)
  }
}

export default userController
