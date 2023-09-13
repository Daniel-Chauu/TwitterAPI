import express, { Request, Response } from 'express'
import 'dotenv/config'
import rootRouter from './routers/root.routes'
import database from './services/database.service'
import { initFolder } from './utils/file'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR } from './constants/dir'
import staticRouter from './routers/static.routes'
const app = express()
const PORT = process.env.PORT

app.use(express.json())

app.use('/static', staticRouter)
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))

app.use('/api/v1', rootRouter)

database.connect()
initFolder()

app.listen(PORT, () => {
  console.log(`App is running on port ${PORT} : http://localhost:${PORT}`)
})
