const USER_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',
  NAME_IS_REQUIRED: 'Name is required',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  NAME_LENGTH_MUST_BE_FROM_2_TO_100: 'Name length must be from 2 to 100 characters',
  PASSOWRD_IS_REQUIRED: 'Password is required',
  PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Password length must be from 6 to 50 characters',
  PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
  PASSWORD_MUST_BE_STRONG:
    'Password must contain at least one uppercase, one lowercase and one special character, minimum length 6',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
  CONFIRM_PASSWORD_DOESN_NOT_MATCH_PASSWORD: 'Confirm password does not match password',
  DATE_OF_BIRTH_IS_REQUIRED: 'Date of birth is required',
  DATE_OF_BIRTH_MUST_BE_A_ISO8601: 'Date of birth must be a ISO8601',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  EMAIL_IS_REQUIRED: 'Email is required',
  EMAIL_IS_INVALID: 'Email is invalid',
  EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email or password is incorrect',
  EMAIL_IS_NOT_EXISTS: 'Email is not exists',
  LOGIN_SUCCESS: 'Login is successfully',
  REGISTER_SUCCESS: 'Register is successfully',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
  ACCESS_TOKEN_IS_MALFORMED: 'Access token is malformed',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_IS_USED_OR_NOT_EXIST: 'Refresh token is used or not exist',
  REFRESH_TOKEN_IS_SUCCESSFULLY: 'Refresh token is successfully',
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token is required',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_VERIFY_BEFORE: 'Email already verify before',
  EMAIL_VERIFY_IS_SUCCESSFULLY: 'Email verify is successfully',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token is required',
  INVALID_FORGOT_PASSWORD_TOKEN: 'Invalid forgot password token',
  VERIFY_FORGOT_PASSWORD_IS_SUCCESSFULLY: 'Verify forgot password is successfully',
  RESET_PASSWORD_IS_SUCCESSFULLY: 'Reset password is successfully',
  GET_PROFILE_USER_IS_SUCCESSFULLY: 'Get profile user is successfully',
  USER_HAVE_NOT_VERIFIED: 'User have not veryfied',
  BIO_MUST_BE_A_STRING: 'Bio must be a string',
  BIO_LENGTH_MUST_BE_FROM_2_TO_200: 'Bio length must be from 2 to 200',
  USERNAME_MUST_BE_A_STRING: 'Username must be a string',
  USERNAME_LENGTH_MUST_BE_FROM_2_TO_50: 'Username length must be from 2 to 50',
  IMAGE_URL_MUST_BE_A_STRING: 'Image url must be a string',
  UPDATE_PROFILE_IS_SUCCESSFULLY: 'Update profile is successfully',
  FOLLOWED: 'followed',
  FOLLOW_IS_SUCCESSFULLY: 'follow is successfully',
  UNFOLLOW_IS_SUCCESSFULLY: 'unfollow is successfully',
  INVALID_FOLLOWED_USER_ID: 'Invalid followed user id',
  INVALID_USER_ID: 'Invalid user id',
  YOU_HAVE_NOT_FOLLOWED_THIS_USER: 'You have not followed this user',
  INVALID_USERNAME: 'username must be 4-15 characters long and contain only letters, numbers, and underscores, not only numbers',
  USERNAME_EXISTED: 'Username existed',
  OLD_PASSWORD_IS_INCORRECT: 'Old password is incorrect',
  OLD_PASSWORD_IS_REQUIRED: 'Old password is required',
  UPDATE_PASSWORD_IS_SUCCESSFULLY: 'Update password is successfully',
  GMAIL_NOT_VERIFIED: 'Gmail not verified',
  UPLOAD_IMAGE_IS_SUCCESSFULLY: 'Upload image is successfully',
  UPLOAD_VIDEO_IS_SUCCESSFULLY: 'Upload video is successfully',
  RANGE_IS_REQUIRED: 'Range is required'
} as const

const TWEET_MESSAGE = {
  INVALID_TYPE: 'Invalid type',
  INVALID_AUDIENCE: 'Invalid audience',
  PARENT_ID_MUST_BE_A_VALID_TWEET_ID: 'parent id must be a valid tweet id',
  PARENT_ID_MUST_BE_NULL: 'parent id must be null',
  CONTENT_MUST_BE_A_NON_EMPTY_STRING: 'Content must be a non empty string',
  CONTENT_MUST_BE_A_EMPTY_STRING: 'Content must be a empty string',
  HASHTAG_MUST_BE_AN_ARR_OF_STRING: 'Hashtags must be an array of string',
  MENTIONS_MUST_BE_AN_ARR_OF_OBJECT_ID: 'Mentions must be an array of ObjectId',
  MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA: 'Medias must be an array of Media',
  CREATE_TWEET_SUCCESSFULLY: 'Create tweet is successfully',
  TWEET_ID_MUST_BE_AN_OBJECT_ID: 'tweet_id must be an ObjectId ',
  TWEET_ID_IS_REQUIRED: 'tweet_id is required',
  TWEET_ID_DOES_NOT_EXIST: 'tweet_id does not exist',
  YOU_MUST_BE_LOGGED_IN_TO_VIEW_THIS_TWEET: 'You must be logged in to view this tweet',
  TWEET_IS_NOT_PUBLIC: 'Tweet is not public',
  GET_TWEET_SUCCESSFULLY: 'Get tweet successfully'
} as const

const BOOKMARK_MESSAGE = {
  BOOKMARK_SUCCESSFULLY: 'Bookmark successfully',
  UNBOOKMARK_SUCCESSFULLY: 'Unbookmark successfully'
} as const

const LIKE_MESSAGE = {
  LIKE_SUCCESSFULLY: 'Like successfully',
  UNLIKE_SUCCESSFULLY: 'Unlike successfully',
  YOU_HAVE_NOT_LIKE_THIS_POST: 'You have not like this post'
}

export { USER_MESSAGES, TWEET_MESSAGE, BOOKMARK_MESSAGE, LIKE_MESSAGE }
