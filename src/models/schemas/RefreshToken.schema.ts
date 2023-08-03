import { ObjectId } from 'mongodb'

export interface RefreshTokenInterface {
  _id?: ObjectId
  token: string
  user_id: ObjectId
  createdAt?: Date
}

class RefreshToken {
  _id?: ObjectId
  token: string
  user_id: ObjectId
  createdAt: Date
  constructor({ _id, createdAt, token, user_id }: RefreshTokenInterface) {
    this._id = _id
    this.token = token
    this.user_id = user_id
    this.createdAt = createdAt || new Date()
  }
}
export { RefreshToken }
