import { ObjectId } from 'mongodb'

export interface RefreshTokenInterface {
  _id?: ObjectId
  token: string
  user_id: ObjectId
  created_at?: Date
}

class RefreshToken {
  _id?: ObjectId
  token: string
  user_id: ObjectId
  created_at: Date
  constructor({ _id, created_at, token, user_id }: RefreshTokenInterface) {
    this._id = _id
    this.token = token
    this.user_id = user_id
    this.created_at = created_at || new Date()
  }
}
export { RefreshToken }
