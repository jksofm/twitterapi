import { Router } from 'express'
import { getConversationsByReceiverIdController } from '~/controllers/conversations.controller'
import { receiverIdValidator } from '~/middlewares/conversations-middleware/receiver_id_validator'
import { paginationValidator } from '~/middlewares/tweets-middleware/pagination_validator'
import { accessTokenValidator } from '~/middlewares/users-middlewares/access_token_validator'
import { verifedUserValidator } from '~/middlewares/users-middlewares/verifiy_user_validator'

const conversationsRouter = Router()

conversationsRouter.get(
  '/receiver/:receiverId',
  accessTokenValidator,
  verifedUserValidator,
  receiverIdValidator,
  paginationValidator,
  getConversationsByReceiverIdController
)

export default conversationsRouter
