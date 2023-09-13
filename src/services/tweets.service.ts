import { TweetReqBody } from '~/models/requests/Tweet.request'
import database from './database.service'
import { Tweet } from '~/models/schemas/Tweet.schema'
import { success } from '~/utils/returnDataSuccess'
import { TWEET_MESSAGE } from '~/constants/messages'
import HashTag from '~/models/schemas/Hashtag.schema'
import { ObjectId, WithId } from 'mongodb'

class TweetService {
  async checkAndCreateHashTag(hashtags: string[]) {
    const res = await Promise.all(
      hashtags.map((hashtag) => {
        return database.hashtags.findOneAndUpdate(
          {
            name: hashtag
          },
          {
            $setOnInsert: new HashTag({ name: hashtag })
          },
          {
            upsert: true,
            returnDocument: 'after'
          }
        )
      })
    )
    return res.map((hashtag) => (hashtag.value as WithId<HashTag>)._id)
  }

  async createTweet({ user_id, body }: { user_id: string; body: TweetReqBody }) {
    const hashtags = await this.checkAndCreateHashTag(body.hashtags)
    const tweet = await database.tweets.insertOne(
      new Tweet({
        type: body.type,
        audience: body.audience,
        content: body.content,
        hashtags,
        mentions: body.mentions,
        parent_id: body.parent_id,
        user_id: user_id,
        medias: body.medias
      })
    )
    return success(TWEET_MESSAGE.CREATE_TWEET_SUCCESSFULLY, tweet)
  }

  async increaseView({ user_id, tweet_id }: { user_id?: string; tweet_id: string }) {
    const incView = user_id ? { user_views: 1 } : { guest_views: 1 }
    const response = await database.tweets.findOneAndUpdate(
      {
        _id: new ObjectId(tweet_id)
      },
      {
        $inc: incView
      },
      {
        returnDocument: 'after',
        projection: {
          user_views: 1,
          guest_views: 1
        }
      }
    )
    return response.value as WithId<{ guest_views: number; user_views: number }>
  }
}

const tweetService = new TweetService()
export default tweetService
