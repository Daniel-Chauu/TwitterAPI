import User from '~/models/schemas/User.schema'
import database from './database.service'

class UserService {
  async register({ email, password }: { email: string; password: string }) {
    const res = await database.users.insertOne(new User({ email, password }))
    return res
  }
  async checkEmailExist(email: string) {
    const isExistEmail = await database.users.findOne({ email })
    return Boolean(isExistEmail)
  }
}

const userService = new UserService()
export default userService
