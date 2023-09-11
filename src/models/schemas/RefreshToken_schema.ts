import { ObjectId } from 'mongodb'

type RefreshTokenType = {
  _id?: ObjectId
  token: string
  created_at?: Date
  user_id: ObjectId
  iat? : number
  exp? : number
}
export default class Refresh_Token_Schema {
  _id?: ObjectId
  token: string
  created_at?: Date
  user_id: ObjectId
  iat? : Date
  exp? : Date


  constructor({ token, user_id, _id, created_at,iat,exp }: RefreshTokenType) {
    this._id = _id
    this.token = token || ''
    this.created_at = created_at || new Date()
    this.user_id = user_id
    this.iat = new Date((iat || 1)*1000)
    this.exp = new Date((exp || 1)* 1000)
  }
}