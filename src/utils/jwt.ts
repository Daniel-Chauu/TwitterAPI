import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken'
import 'dotenv/config'
import { TokenPayload } from '~/models/requests/User.request'

const signToken = ({
  payload,
  privateKey,
  options = {
    algorithm: 'HS256'
  }
}: {
  payload: string | Buffer | object
  privateKey: string
  options?: SignOptions
}) =>
  new Promise<string>((res, rej) => {
    jwt.sign(payload, privateKey, options, function (err, token) {
      if (err) throw rej(err)
      res(token as string)
    })
  })

const verifyToken = ({ token, jwtSecret }: { token: string; jwtSecret: string }) =>
  new Promise<TokenPayload>((res, rej) => {
    jwt.verify(token, jwtSecret as string, (err, decoded) => {
      if (err) throw rej(err)
      res(decoded as TokenPayload)
    })
  })

export { signToken, verifyToken }
