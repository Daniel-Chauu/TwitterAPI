import { MongoClient, Db, Collection } from 'mongodb'
import User from '~/models/schemas/User.schema'
import 'dotenv/config'
import { RefreshToken } from '~/models/schemas/RefreshToken.schema'
import { Follower } from '~/models/schemas/Follower.schema'
import { Tweet } from '~/models/schemas/Tweet.schema'
import HashTag from '~/models/schemas/Hashtag.schema'
import Bookmark from '~/models/schemas/Bookmark.schema'
import Like from '~/models/schemas/Like.schema'

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.uitd63h.mongodb.net/?retryWrites=true&w=majority`

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }
  async connect() {
    try {
      await this.client.connect()
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (err) {
      console.log(err)
      throw err
    }
  }

  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USER_COLLECTION as string)
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection(process.env.DB_TWEET_COLLECTION as string)
  }

  get refreshToken(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKEN_COLLECTION as string)
  }

  get followers(): Collection<Follower> {
    return this.db.collection(process.env.DB_FOLLOWER_COLECTION as string)
  }

  get hashtags(): Collection<HashTag> {
    return this.db.collection(process.env.DB_HASHTAG_COLECTION as string)
  }

  get bookmarks(): Collection<Bookmark> {
    return this.db.collection(process.env.DB_BOOKMARK_COLECTION as string)
  }

  get likes(): Collection<Like> {
    return this.db.collection(process.env.DB_LIKE_COLECTION as string)
  }
}

const database = new DatabaseService()
export default database
