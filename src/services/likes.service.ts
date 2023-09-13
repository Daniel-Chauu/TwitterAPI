import { ObjectId } from 'mongodb'
import database from './database.service'
import Like from '~/models/schemas/Like.schema'
import { success } from '~/utils/returnDataSuccess'
import { LIKE_MESSAGE } from '~/constants/messages'

class LikeService {
  async likePost({ tweet_id, user_id }: { user_id: string; tweet_id: string }) {
    const response = await database.likes.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      },
      {
        $setOnInsert: new Like({ tweet_id, user_id })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    return success(LIKE_MESSAGE.LIKE_SUCCESSFULLY, response.value)
  }
  async unlikePost({ tweet_id, user_id }: { user_id: string; tweet_id: string }) {
    const response = await database.likes.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
    if (response.value !== null) return success(LIKE_MESSAGE.UNLIKE_SUCCESSFULLY, response)
    return success(LIKE_MESSAGE.YOU_HAVE_NOT_LIKE_THIS_POST)
  }
}

const likeService = new LikeService()
export default likeService
