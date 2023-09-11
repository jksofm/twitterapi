import { ObjectId } from 'mongodb'

type TweetCircleType = {
  _id?: ObjectId
  user_id: ObjectId
  user_id_in_circle: ObjectId
  created_at?: Date
}
export default class TweetCircles_Schema {
  _id?: ObjectId
  user_id: ObjectId
  user_id_in_circle: ObjectId
  created_at?: Date

  constructor({ user_id, created_at, user_id_in_circle, _id }: TweetCircleType) {
    this.user_id = user_id
    this.created_at = created_at || new Date()
    this.user_id_in_circle = user_id_in_circle || new ObjectId()
    this._id = _id || new ObjectId()
  }
}
