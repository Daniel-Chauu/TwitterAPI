import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { BOOKMARK_MESSAGE } from '~/constants/messages'
import database from '~/services/database.service'
import { validate } from '~/utils/validation'
