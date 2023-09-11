import { ObjectId } from 'mongodb'
import { TweetAudience, TweetType } from '~/constants/enums'
import { Media } from '../interface/media/media'

interface TweetConstructor {
  _id?: ObjectId
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId
  hashtags: ObjectId[]
  mentions: ObjectId[]
  media: Media[]
  guest_views?: number
  user_views?: number
  created_at?: Date
  updated_at?: Date
}
export default class Tweet_schema {
  _id?: ObjectId
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId
  hashtags: ObjectId[]
  mentions: ObjectId[]
  media: Media[]
  guest_views: number
  user_views: number
  created_at: Date
  updated_at: Date
  constructor({
    audience,
    content,
    user_id,
    type,
    parent_id,
    hashtags,
    mentions,
    guest_views,
    user_views,
    created_at,
    updated_at,
    _id,
    media
  }: TweetConstructor) {
    this._id = _id
    this.user_id = user_id
    this.type = type
    this.parent_id = parent_id || null
    this.content = content
    this.audience = audience
    this.hashtags = hashtags || []
    this.mentions = mentions || []
    this.guest_views = guest_views || 0
    this.user_views = user_views || 0
    this.created_at = created_at || new Date()
    this.updated_at = updated_at || new Date()
    this.media = media || []
  }
}
