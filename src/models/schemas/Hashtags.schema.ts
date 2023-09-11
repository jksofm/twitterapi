import { ObjectId } from 'mongodb'

type HashtagsType = {
  _id?: ObjectId
  content: string
  created_at?: Date
  updated_at?: Date
  
}
export default class Hashtags_Schema {
  _id?: ObjectId
  content: string
  created_at?: Date
  updated_at?: Date
 

  constructor({ content, created_at, updated_at,_id }: HashtagsType) {
    this.content = content
    this.created_at = created_at || new Date()
    this.updated_at = updated_at || new Date()
    this._id = _id || new ObjectId()
    
  }
}
