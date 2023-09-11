import { ObjectId } from 'mongodb'

type LikeType = {
  _id?: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  created_at?: Date
}
export default class Likes_Schema {
  _id?: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  created_at?: Date

  constructor({ user_id, created_at, tweet_id, _id }: LikeType) {
    this.user_id = user_id
    this.created_at = created_at || new Date()
    this.tweet_id = tweet_id || new ObjectId()
    this._id = _id || new ObjectId()
  }
}
