import { Request, Response } from 'express'
import userService from '~/services/users.service'

const userController = {
  register: async (req: Request, res: Response) => {
    const { email, password } = req.body
    try {
      const response = await userService.register({ email, password })
      res.status(200).json('register is successfully')
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}

export default userController
