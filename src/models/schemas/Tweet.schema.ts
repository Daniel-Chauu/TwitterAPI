import { ObjectId } from 'mongodb'
import { TweetAudience, TweetType } from '~/constants/enum'
import { Media } from '../Other'

interface TweetConstructor {
  _id?: ObjectId
  user_id: string
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: string | null
  hashtags: ObjectId[]
  mentions: string[]
  medias: Media[]
  guest_views?: number
  user_views?: number
  created_at?: Date
  updated_at?: Date
}

export class Tweet {
  _id?: ObjectId
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: ObjectId | null
  hashtags: ObjectId[]
  mentions: ObjectId[]
  medias: Media[]
  guest_views: number
  user_views: number
  created_at: Date
  updated_at: Date
  constructor({
    _id,
    audience,
    content,
    created_at,
    guest_views,
    hashtags,
    medias,
    mentions,
    parent_id,
    type,
    updated_at,
    user_id,
    user_views
  }: TweetConstructor) {
    const date = new Date()
    this._id = _id
    this.user_id = new ObjectId(user_id)
    this.type = type
    this.audience = audience
    this.content = content
    this.parent_id = parent_id ? new ObjectId(parent_id) : null
    this.hashtags = hashtags
    this.mentions = mentions.map((mention) => new ObjectId(mention))
    this.medias = medias
    this.guest_views = guest_views || 0
    this.user_views = user_views || 0
    this.created_at = created_at || date
    this.updated_at = updated_at || date
  }
}
