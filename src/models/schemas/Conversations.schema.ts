import { ObjectId } from 'mongodb'

type ConversationType = {
  _id?: ObjectId
  sender_id: ObjectId
  receiver_id: ObjectId
  created_at?: Date
  updated_at? : Date
  message : string
}
export default class Conversation_Schema {
  _id?: ObjectId
  sender_id: ObjectId
  receiver_id: ObjectId
  created_at?: Date
  updated_at? : Date
  message : string

  constructor({ sender_id, created_at, receiver_id, _id,updated_at,message }: ConversationType) {
    this.sender_id = sender_id
    this.created_at = created_at || new Date()
    this.receiver_id = receiver_id
    this._id = _id 
    this.updated_at = updated_at || new Date()
    this.message = message
  }
}
