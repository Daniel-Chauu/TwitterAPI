import User from '~/models/schemas/User.schema'
import database from './database.service'
import { RegisterBody, TokenPayload } from '~/models/requests/User.request'
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

class UserService {
  private generateAccessToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_EXPRIES_IN
      }
    })
  }
  private generateRefreshToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.REFRESH_EXPRIES_IN
      }
    })
  }
  private generateAccessRefreshToken(user_id: string) {
    return Promise.all([this.generateAccessToken(user_id), this.generateRefreshToken(user_id)])
  }
  private generateVerifyEmailToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken },
      privateKey: process.env.JWT_SECRET_EMAIL_TOKEN as string,
      options: {
        expiresIn: process.env.EMAIL_TOKEN_EXPRIES_IN
      }
    })
  }

  async findUser(email: string, password?: string) {
    if (password) {
      return await database.users.findOne({ email, password })
    }
    return await database.users.findOne({ email })
  }
  async register(payload: RegisterBody) {
    const user_id = new ObjectId().toString()
    const email_verify_token = await this.generateVerifyEmailToken(user_id)

    const [token] = await Promise.all([
      this.generateAccessRefreshToken(user_id),
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
  async login(user_id: string) {
    const [access_token, refresh_token] = await this.generateAccessRefreshToken(user_id)
    await database.refreshToken.insertOne(new RefreshToken({ token: refresh_token, user_id: new ObjectId(user_id) }))
    return [access_token, refresh_token]
  }

  async logout(user_id: string) {
    await database.refreshToken.deleteMany({ user_id: new ObjectId(user_id) })
    return success('Logout is successfully')
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

    await database.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          email_verify_token: '',
          verify: UserVerifyStatus.Verified,
          updated_at: '$$NOW'
        }
      }
    ])
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

    const verify_email_token = await this.generateVerifyEmailToken(user_id)
    await database.users.updateOne({ _id: new ObjectId(user_id) }, { $set: { email_verify_token: verify_email_token } })
    console.log(verify_email_token)
    return success('Resend email is successfully')
  }
}

const userService = new UserService()
export default userService
