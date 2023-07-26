import { Request, Response, Router } from 'express'

const userRouter = Router()

userRouter.get('/', async (req: Request, res: Response) => {
  res.json('Hello World User')
})

export default userRouter
