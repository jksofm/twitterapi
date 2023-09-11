import { ObjectId } from 'mongodb'

type BookmarkType = {
  _id?: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  created_at?: Date
}
export default class Bookmarks_Schema {
  _id?: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  created_at?: Date

  constructor({ user_id, created_at, tweet_id, _id }: BookmarkType) {
    this.user_id = user_id
    this.created_at = created_at || new Date()
    this.tweet_id = tweet_id
    this._id = _id 
  }
}
