import User from '~/models/schemas/User.schema'
import database from './database.service'
import { RegisterBody, TokenPayload, UpdateMeRequestBody } from '~/models/requests/User.request'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import 'dotenv/config'
import { ObjectId } from 'mongodb'
import { RefreshToken } from '~/models/schemas/RefreshToken.schema'
import { ErrorWithStatus } from '~/models/Errors'
import { USER_MESSAGES } from '~/constants/messages'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { success } from '~/utils/returnDataSuccess'
import { Follower } from '~/models/schemas/Follower.schema'
import axios from 'axios'

interface userInfoGoggle {
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name: string
  family_name: string
  picture: string
  locale: string
}

class UserService {
  private generateAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken, verify },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_EXPRIES_IN
      }
    })
  }
  private generateRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken, verify },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.REFRESH_EXPRIES_IN
      }
    })
  }
  private generateAccessRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return Promise.all([this.generateAccessToken({ user_id, verify }), this.generateRefreshToken({ user_id, verify })])
  }
  private generateVerifyEmailToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.EmailVerifyToken, verify },
      privateKey: process.env.JWT_SECRET_EMAIL_TOKEN as string,
      options: {
        expiresIn: process.env.EMAIL_TOKEN_EXPRIES_IN
      }
    })
  }
  private generateForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.ForgotPasswordToken, verify },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPRIES_IN
      }
    })
  }
  private async getOauthGoogleToken(code: string) {
    const body = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    }
    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    return data as {
      access_token: string
      id_token: string
    }
  }
  private async getGoogleUserInfo(access_token: string, id_token: string) {
    const { data } = await axios.get<userInfoGoggle>('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: {
        access_token,
        alt: 'json'
      },
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    })
    return data
  }

  async findUser(email: string, password?: string) {
    if (password) {
      return await database.users.findOne({ email, password })
    }
    return await database.users.findOne({ email })
  }
  async register(payload: RegisterBody) {
    const user_id = new ObjectId().toString()
    const email_verify_token = await this.generateVerifyEmailToken({ user_id, verify: UserVerifyStatus.Unverified })

    const [token] = await Promise.all([
      this.generateAccessRefreshToken({ user_id, verify: UserVerifyStatus.Unverified }),
      database.users.insertOne(
        new User({
          ...payload,
          _id: new ObjectId(user_id),
          date_of_birth: new Date(payload.date_of_birth),
          password: hashPassword(payload.password),
          email_verify_token
        })
      )
    ])

    const [access_token, refresh_token] = token
    await database.refreshToken.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token as string
      })
    )

    return success(USER_MESSAGES.REGISTER_SUCCESS, {
      access_token,
      refresh_token,
      email_verify_token
    })
  }
  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [access_token, refresh_token] = await this.generateAccessRefreshToken({ user_id, verify })
    await database.refreshToken.insertOne(new RefreshToken({ token: refresh_token, user_id: new ObjectId(user_id) }))
    return [access_token, refresh_token]
  }
  async logout(user_id: string) {
    await database.refreshToken.deleteMany({ user_id: new ObjectId(user_id) })
    return success('Logout is successfully')
  }
  async refreshToken({ refresh_token, user_id, verify }: { user_id: string; refresh_token: string; verify: UserVerifyStatus }) {
    const [newToken] = await Promise.all([
      this.generateAccessRefreshToken({ user_id: user_id, verify }),
      database.refreshToken.deleteOne({ token: refresh_token })
    ])
    const [new_access_token, new_refresh_token] = newToken
    await database.refreshToken.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: new_refresh_token
      })
    )
    return success(USER_MESSAGES.REFRESH_TOKEN_IS_SUCCESSFULLY, {
      access_token: new_access_token,
      refresh_token: new_refresh_token
    })
  }
  async verifyEmailToken(email_verify_token: TokenPayload) {
    const { user_id } = email_verify_token
    const user = await database.users.findOne({ _id: new ObjectId(user_id) })
    if (!user) {
      throw new ErrorWithStatus({
        message: USER_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    if (user.email_verify_token === '') {
      throw new ErrorWithStatus({
        message: USER_MESSAGES.EMAIL_ALREADY_VERIFY_BEFORE,
        status: HTTP_STATUS.OK
      })
    }
    const [access_token, refresh_token] = await this.generateAccessRefreshToken({ user_id, verify: UserVerifyStatus.Verified })
    await database.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          email_verify_token: '',
          verify: UserVerifyStatus.Verified,
          updated_at: '$$NOW'
        }
      }
    ])
    await database.refreshToken.insertOne(new RefreshToken({ token: refresh_token, user_id: new ObjectId(user_id) }))
    return {
      status: HTTP_STATUS.OK,
      message: USER_MESSAGES.EMAIL_VERIFY_IS_SUCCESSFULLY
    }
  }
  async resendVerifyEmailToken(user_id: string) {
    const user = await database.users.findOne({ _id: new ObjectId(user_id) })
    if (!user) {
      console.log('Check NOT FOUND')
      throw new ErrorWithStatus({ message: USER_MESSAGES.USER_NOT_FOUND, status: HTTP_STATUS.NOT_FOUND })
    }
    if (user.verify === UserVerifyStatus.Verified) {
      console.log('Check VERYFIED')
      throw new ErrorWithStatus({
        message: USER_MESSAGES.EMAIL_ALREADY_VERIFY_BEFORE,
        status: HTTP_STATUS.OK
      })
    }

    const verify_email_token = await this.generateVerifyEmailToken({ user_id, verify: UserVerifyStatus.Unverified })
    await database.users.updateOne({ _id: new ObjectId(user_id) }, { $set: { email_verify_token: verify_email_token } })
    console.log(verify_email_token)
    return success('Resend email is successfully')
  }
  async forgotPassword({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const forgot_password_token = await this.generateForgotPasswordToken({ user_id, verify })
    await database.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          forgot_password_token,
          updated_at: '$$NOW'
        }
      }
    ])
    //send email vs link : ...
    console.log(forgot_password_token)
    return success('Plesea!! Check your email to reset password')
  }
  async resetPassword(user_id: string, password: string) {
    await database.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          forgot_password_token: '',
          password: hashPassword(password)
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return success(USER_MESSAGES.RESET_PASSWORD_IS_SUCCESSFULLY)
  }
  async getMe(user_id: string) {
    const userInfo = await database.users.findOne(
      { _id: new ObjectId(user_id) },
      { projection: { password: 0, email_verify_token: 0, forgot_password_token: 0 } }
    )
    return success(USER_MESSAGES.GET_PROFILE_USER_IS_SUCCESSFULLY, userInfo)
  }
  async getProfile(username: string) {
    const user = await database.users.findOne({ username })
    if (!user) {
      throw new ErrorWithStatus({
        message: USER_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return success(USER_MESSAGES.GET_PROFILE_USER_IS_SUCCESSFULLY, user)
  }
  async updateMe({ user_id, payload }: { user_id: string; payload: UpdateMeRequestBody }) {
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload
    const user = await database.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          ...(_payload as UpdateMeRequestBody & { date_of_birth?: Date })
        }
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return success(USER_MESSAGES.UPDATE_PROFILE_IS_SUCCESSFULLY, user.value)
  }
  async follow({ followed_user_id, user_id }: { user_id: string; followed_user_id: string }) {
    const followed = await database.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })

    if (followed) {
      return success(USER_MESSAGES.FOLLOWED)
    }

    await database.followers.insertOne(
      new Follower({
        followed_user_id: new ObjectId(followed_user_id),
        user_id: new ObjectId(user_id)
      })
    )
    return success(USER_MESSAGES.FOLLOW_IS_SUCCESSFULLY)
  }
  async unfollow({ followed_user_id, user_id }: { user_id: string; followed_user_id: string }) {
    const followed = await database.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })

    if (!followed) {
      return success(USER_MESSAGES.YOU_HAVE_NOT_FOLLOWED_THIS_USER)
    }

    await database.followers.deleteOne({
      followed_user_id: new ObjectId(followed_user_id),
      user_id: new ObjectId(user_id)
    })
    return success(USER_MESSAGES.UNFOLLOW_IS_SUCCESSFULLY)
  }
  async changePassword({ new_password, user_id }: { user_id: string; new_password: string }) {
    await database.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          password: hashPassword(new_password)
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return success(USER_MESSAGES.UPDATE_PASSWORD_IS_SUCCESSFULLY)
  }
  async oauth(code: string) {
    const { access_token, id_token } = await this.getOauthGoogleToken(code)
    const userInfo = await this.getGoogleUserInfo(access_token, id_token)

    if (!userInfo.verified_email) {
      throw new ErrorWithStatus({
        message: USER_MESSAGES.GMAIL_NOT_VERIFIED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const user = await database.users.findOne({ email: userInfo.email })

    if (user) {
      const [access_token, refresh_token] = await this.generateAccessRefreshToken({
        user_id: user._id.toString(),
        verify: user.verify
      })
      await database.refreshToken.insertOne(
        new RefreshToken({
          user_id: user._id,
          token: refresh_token
        })
      )
      return {
        access_token,
        refresh_token,
        verify: user.verify
      }
    } else {
      const { email, name, verified_email } = userInfo
      const password = Math.random().toString(30).slice(2, 15)
      const {
        data: { access_token, refresh_token }
      } = await this.register({
        email,
        name,
        date_of_birth: new Date().toISOString(),
        password,
        confirm_password: password
      })
      return {
        access_token,
        refresh_token,
        verify: UserVerifyStatus.Unverified
      }
    }
  }
}

const userService = new UserService()
export default userService
