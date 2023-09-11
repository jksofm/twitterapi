import { ObjectId } from 'mongodb'
import { DB } from './database.services'

class ConversationService {
  constructor() {}
  async getConversation({
    sender_id,
    receiver_id,
    limit = 5,
    page = 1
  }: {
    sender_id: string
    receiver_id: string
    limit?: number
    page?: number
  }) {
    const conversations = await DB.conversations
      .find({
        $or: [
          {
            sender_id: new ObjectId(sender_id),
            receiver_id: new ObjectId(receiver_id)
          },
          {
            sender_id: new ObjectId(receiver_id),
            receiver_id: new ObjectId(sender_id)
          }
        ]
      })
      .sort({ created_at: -1 })
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()

    const total = await DB.conversations.countDocuments({
      $or: [
        {
          sender_id: new ObjectId(sender_id),
          receiver_id: new ObjectId(receiver_id)
        },
        {
          sender_id: new ObjectId(receiver_id),
          receiver_id: new ObjectId(sender_id)
        }
      ]
    })

    return {
      conversations,
      pagination: {
        total,
        page : page || 1,
        limit : limit || 5,
        total_page: Math.ceil(total / limit) 
      }
    }
  }
}
const conversationService = new ConversationService()
export default conversationService
