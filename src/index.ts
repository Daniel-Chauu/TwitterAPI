import express, { Request, Response } from 'express'
import 'dotenv/config'
import rootRouter from './routers/root.routes'
import database from './services/database.service'
const app = express()
const PORT = process.env.PORT

app.use('/api/v1', rootRouter)

database.connect().catch(console.dir)

app.listen(PORT, () => {
  console.log(`App is running on port ${PORT} : http://localhost:${PORT}`)
})
