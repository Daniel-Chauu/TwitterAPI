/* eslint-disable prettier/prettier */
import { Request, Response, response } from 'express'
import userService from '~/services/users.service'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  FollowRequestBody,
  GetProfileRequestParams,
  LogoutBody,
  RegisterBody,
  ResetPasswordBody,
  TokenPayload,
  UnfollowRequestParams,
  UpdateMeRequestBody,
  changePasswordReqBody
} from '~/models/requests/User.request'
import { hashPassword } from '~/utils/crypto'
import User from '~/models/schemas/User.schema'
import { success } from '~/utils/returnDataSuccess'
import { USER_MESSAGES } from '~/constants/messages'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { ObjectId } from 'mongodb'
import { pick } from '~/utils/utils'
import 'dotenv/config'

const userController = {
  register: async (req: Request<ParamsDictionary, any, RegisterBody>, res: Response) => {
    const response = await userService.register(req.body)
    res.status(HTTP_STATUS.CREATED).json(response)
  },
  login: async (req: Request, res: Response) => {
    const { _id, verify } = req.user as User
    const user_id = _id?.toString() as string
    const [access_token, refresh_token] = await userService.login({ user_id, verify })
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
  },
  forgotPassword: async (req: Request, res: Response) => {
    const { _id, verify } = req.user as User
    const response = await userService.forgotPassword({ user_id: (_id as ObjectId).toString(), verify })
    res.status(HTTP_STATUS.OK).json(response)
  },
  verifyForgotPassword: (req: Request, res: Response) => {
    return res.status(HTTP_STATUS.OK).json(success(USER_MESSAGES.VERIFY_FORGOT_PASSWORD_IS_SUCCESSFULLY))
  },
  resetPassword: async (req: Request<ParamsDictionary, any, ResetPasswordBody>, res: Response) => {
    const { user_id } = req.decoded_forgot_password_token as TokenPayload
    const { password } = req.body
    const response = await userService.resetPassword(user_id, password)
    res.status(HTTP_STATUS.OK).json(response)
  },
  getMe: async (req: Request, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const response = await userService.getMe(user_id)
    res.status(HTTP_STATUS.OK).json(response)
  },
  updateMe: async (req: Request<ParamsDictionary, any, UpdateMeRequestBody>, res: Response) => {
    const { body, decoded_authorization } = req
    const { user_id } = decoded_authorization as TokenPayload
    const payload = pick(body, ['avatar', 'bio', 'cover_photo', 'date_of_birth', 'location', 'name', 'username', 'website'])
    const response = await userService.updateMe({ user_id, payload })
    res.status(HTTP_STATUS.OK).json(response)
  },
  getProfile: async (req: Request, res: Response) => {
    const { username } = req.params
    const response = await userService.getProfile(username)
    res.status(HTTP_STATUS.OK).json(response)
  },
  follow: async (req: Request<ParamsDictionary, any, FollowRequestBody>, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const { followed_user_id } = req.body
    const response = await userService.follow({ user_id, followed_user_id })
    res.status(HTTP_STATUS.OK).json(response)
  },
  unfollow: async (req: Request, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const { user_id: followed_user_id } = req.params
    const response = await userService.unfollow({ user_id, followed_user_id })
    res.status(HTTP_STATUS.OK).json(response)
  },
  changePassword: async (req: Request<ParamsDictionary, any, changePasswordReqBody>, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const { password } = req.body
    console.log('==================CHECK==================')
    const response = await userService.changePassword({ user_id, new_password: password })
    res.status(HTTP_STATUS.OK).json(response)
  },
  oauth: async (req: Request, res: Response) => {
    const { code } = req.query
    const response = await userService.oauth(code as string)
    const urlRedirect = `${process.env.CLIENT_REDIRECT_CALLBACK}?access_token=${response.access_token}&refresh_token=${response.refresh_token}&verify=${response.verify}`
    res.redirect(urlRedirect)
  }
}

export default userController
