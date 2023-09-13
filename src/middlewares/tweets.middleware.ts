import { wrapRequestHandler } from '~/utils/handlers'
import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType } from '~/constants/enum'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { TWEET_MESSAGE } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { Media } from '~/models/Other'
import database from '~/services/database.service'
import { numberEnumToArray } from '~/utils/commons'
import { checkEmptyObj, isEmptyArr } from '~/utils/utils'
import { validate } from '~/utils/validation'
import { Tweet } from '~/models/schemas/Tweet.schema'

const tweetType = numberEnumToArray(TweetType)
const audienceType = numberEnumToArray(TweetAudience)
const mediaType = numberEnumToArray(MediaType)

export const createTweetValidator = validate(
  checkSchema({
    type: {
      isIn: {
        options: [tweetType],
        errorMessage: TWEET_MESSAGE.INVALID_TYPE
      }
    },
    audience: {
      isIn: {
        options: [audienceType],
        errorMessage: TWEET_MESSAGE.INVALID_AUDIENCE
      }
    },
    parent_id: {
      custom: {
        options: (value, { req }) => {
          const { type } = req.body
          if ([TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) && !ObjectId.isValid(value)) {
            throw new ErrorWithStatus({
              message: TWEET_MESSAGE.PARENT_ID_MUST_BE_A_VALID_TWEET_ID,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }
          if (type === TweetType.Tweet && value !== null) {
            throw new ErrorWithStatus({
              message: TWEET_MESSAGE.PARENT_ID_MUST_BE_NULL,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }
          return true
        }
      }
    },
    content: {
      custom: {
        options: (value, { req }) => {
          const { type, mentions, hashtags } = req.body
          if (
            [TweetType.Comment, TweetType.QuoteTweet, TweetType.Tweet].includes(type) &&
            isEmptyArr(mentions) &&
            isEmptyArr(hashtags)
          ) {
            throw new Error(TWEET_MESSAGE.CONTENT_MUST_BE_A_NON_EMPTY_STRING)
          }
          if (type === TweetType.Retweet && value !== '') {
            throw new Error(TWEET_MESSAGE.CONTENT_MUST_BE_A_EMPTY_STRING)
          }
          return true
        }
      }
    },
    hashtags: {
      isArray: true,
      optional: true,
      custom: {
        options: (value, { req }) => {
          const isArrString = value.every((item: any) => typeof item === 'string')
          if (!isArrString) {
            throw new Error(TWEET_MESSAGE.HASHTAG_MUST_BE_AN_ARR_OF_STRING)
          }
          return true
        }
      }
    },
    mentions: {
      isArray: true,
      optional: true,
      custom: {
        options: (value, { req }) => {
          const isArrObjectId = value.every((item: any) => ObjectId.isValid(item))
          if (!isArrObjectId) {
            throw new Error(TWEET_MESSAGE.MENTIONS_MUST_BE_AN_ARR_OF_OBJECT_ID)
          }
          return true
        }
      }
    },
    medias: {
      custom: {
        options: (value: Media[], { req }) => {
          const isArrMediaObj = value.every((item) => {
            return typeof item.url === 'string' && mediaType.includes(item.type)
          })
          if (!isArrMediaObj) {
            throw new Error(TWEET_MESSAGE.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA)
          }
          return true
        }
      }
    }
  })
)

export const tweetIdValidator = validate(
  checkSchema(
    {
      tweet_id: {
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new Error(TWEET_MESSAGE.TWEET_ID_IS_REQUIRED)
            }
            if (!ObjectId.isValid(value)) {
              throw new Error(TWEET_MESSAGE.TWEET_ID_MUST_BE_AN_OBJECT_ID)
            }
            const [tweet] = await database.tweets
              .aggregate<Tweet>([
                {
                  $match: {
                    _id: new ObjectId(`${value}`)
                  }
                },
                {
                  $lookup: {
                    from: 'hashtags',
                    localField: 'hashtags',
                    foreignField: '_id',
                    as: 'hashtags'
                  }
                },
                {
                  $lookup: {
                    from: 'users',
                    localField: 'mentions',
                    foreignField: '_id',
                    as: 'mentions'
                  }
                },
                {
                  $addFields: {
                    mentions: {
                      $map: {
                        input: '$mentions',
                        as: 'mention',
                        in: {
                          _id: '$$mention._id',
                          name: '$$mention.name',
                          username: '$$mention.username',
                          email: '$$mention.email'
                        }
                      }
                    }
                  }
                },
                {
                  $lookup: {
                    from: 'bookmarks',
                    localField: '_id',
                    foreignField: 'tweet_id',
                    as: 'bookmarks'
                  }
                },
                {
                  $lookup: {
                    from: 'likes',
                    localField: '_id',
                    foreignField: 'tweet_id',
                    as: 'likes'
                  }
                },
                {
                  $lookup: {
                    from: 'tweets',
                    localField: '_id',
                    foreignField: 'parent_id',
                    as: 'tweets_children'
                  }
                },
                {
                  $addFields: {
                    bookmarks: {
                      $size: '$bookmarks'
                    },
                    likes: {
                      $size: '$likes'
                    },
                    retweets: {
                      $size: {
                        $filter: {
                          input: '$tweets_children',
                          as: 'tweet',
                          cond: {
                            $eq: ['$$tweet.type', 1]
                          }
                        }
                      }
                    },
                    comments: {
                      $size: {
                        $filter: {
                          input: '$tweets_children',
                          as: 'tweet',
                          cond: {
                            $eq: ['$$tweet.type', 2]
                          }
                        }
                      }
                    },
                    quoteTweets: {
                      $size: {
                        $filter: {
                          input: '$tweets_children',
                          as: 'tweet',
                          cond: {
                            $eq: ['$$tweet.type', 3]
                          }
                        }
                      }
                    }
                  }
                },
                {
                  $project: {
                    tweets_children: 0
                  }
                }
              ])
              .toArray()
            if (!tweet) {
              throw new ErrorWithStatus({
                message: TWEET_MESSAGE.TWEET_ID_DOES_NOT_EXIST,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            ;(req as Request).tweet = tweet
            return true
          }
        }
      }
    },
    ['params', 'body']
  )
)

export const isUserLoggedInValidator =
  (middleware: (req: Request, res: Response, next: NextFunction) => void) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      return middleware(req, res, next)
    }
    next()
  }

export const audienceValidator = wrapRequestHandler(async (req: Request, res: Response, next: NextFunction) => {
  const tweet = req.tweet as Tweet
  console.log('🚀 ~ tweet:', tweet)
  if (tweet.audience === TweetAudience.TwitterCircle) {
    if (!req.decoded_authorization) {
      throw new ErrorWithStatus({
        message: TWEET_MESSAGE.YOU_MUST_BE_LOGGED_IN_TO_VIEW_THIS_TWEET,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }
    const { user_id: author_id } = tweet
    const { user_id: viewer_id } = req.decoded_authorization
    const author = await database.users.findOne({ _id: new ObjectId(author_id) })
    const isEnableToView = author?.twitter_circle?.some((id) => id.equals(viewer_id))
    const isAuthor = author?._id.equals(viewer_id)
    if (!isAuthor && !isEnableToView) {
      throw new ErrorWithStatus({
        message: TWEET_MESSAGE.TWEET_IS_NOT_PUBLIC,
        status: HTTP_STATUS.FORBIDDEN
      })
    }
  }
  next()
})
