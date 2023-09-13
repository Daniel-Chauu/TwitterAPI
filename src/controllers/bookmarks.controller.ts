import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { TokenPayload } from '~/models/requests/User.request'
import { BookmarkReqBody } from '~/models/requests/Bookmark.request'
import bookmarkService from '~/services/bookmarks.service'

const bookmarkController = {
  bookmarkTweet: async (req: Request<ParamsDictionary, any, BookmarkReqBody>, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const { tweet_id } = req.body
    const response = await bookmarkService.bookmarkTweet({ user_id, tweet_id })
    res.json(response)
  },
  unbookmarkTweet: async (req: Request<ParamsDictionary, any, BookmarkReqBody>, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const { tweet_id } = req.params
    const response = await bookmarkService.unbookmarkTweet({ user_id, tweet_id })
    res.json(response)
  }
}

export default bookmarkController
