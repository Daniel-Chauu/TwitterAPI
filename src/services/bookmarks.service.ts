import Bookmark from '~/models/schemas/Bookmark.schema'
import database from './database.service'
import { ObjectId, WithId } from 'mongodb'
import { success } from '~/utils/returnDataSuccess'
import { BOOKMARK_MESSAGE } from '~/constants/messages'

class BookmarkService {
  async bookmarkTweet({ tweet_id, user_id }: { user_id: string; tweet_id: string }) {
    const bookmark = await database.bookmarks.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      },
      {
        $setOnInsert: new Bookmark({ user_id, tweet_id })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    return success(BOOKMARK_MESSAGE.BOOKMARK_SUCCESSFULLY, bookmark.value as WithId<Bookmark>)
  }
  async unbookmarkTweet({ tweet_id, user_id }: { user_id: string; tweet_id: string }) {
    await database.bookmarks.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
    return success(BOOKMARK_MESSAGE.UNBOOKMARK_SUCCESSFULLY)
  }
}

const bookmarkService = new BookmarkService()
export default bookmarkService
