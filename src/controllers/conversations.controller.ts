import { NextFunction, Request, Response } from 'express'
import { conversationMessages } from '~/constants/messages'
import conversationService from '~/services/conversations.services'
import ConversationService from '~/services/conversations.services'
import { catchAsync } from '~/utils/catchAsync'

export const getConversationsByReceiverIdController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const receiver_id = req.params.receiverId
    const sender_id = req.decoded_authorization?.userId as string 
    const limit = Number(req.query.limit)
    const page = Number(req.query.page)
    const result = await conversationService.getConversation({ sender_id, receiver_id,limit ,page })
    res.json({
      message: conversationMessages.GET_CONVERSATION_SUCCESS,
      result
    })
  }
)
