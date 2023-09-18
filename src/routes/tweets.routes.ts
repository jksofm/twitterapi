import { Router } from 'express'
import {
  createBookmarkController,
  createLikeController,
  createTweetCircleControllers,
  createTweetController,
  deleteBookmarkController,
  deleteTweetCircleControllers,
  deleteTweetController,
  getNewFeedController,
  getTweetChildrenController,
  getTweetDetailController,
  unLikeController
} from '~/controllers/tweets.controller'
import { validatorAudience } from '~/middlewares/tweets-middleware/audience_validator'
import { validatorCreateTweet } from '~/middlewares/tweets-middleware/create_tweet_validator'
import { validatorTweetId } from '~/middlewares/tweets-middleware/tweetId_validator'
import { accessTokenValidator } from '~/middlewares/users-middlewares/access_token_validator'
import { getTweetChildrenValidator } from '~/middlewares/tweets-middleware/get_tweet_children_validator'
import { isUserLoggedInValidator } from '~/middlewares/users-middlewares/is_User_Logged_in_validator'
import { verifedUserValidator } from '~/middlewares/users-middlewares/verifiy_user_validator'
import { paginationValidator } from '~/middlewares/tweets-middleware/pagination_validator'

const tweetsRouter = Router()

///Twweet
tweetsRouter.post('/', accessTokenValidator, verifedUserValidator, validatorCreateTweet, createTweetController)
tweetsRouter.delete(
  '/:tweetId',
  accessTokenValidator,
  verifedUserValidator,
  validatorCreateTweet,
  deleteTweetController
)

tweetsRouter.get(
  '/:tweetId',

  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifedUserValidator),
  validatorTweetId,
  validatorAudience,

  getTweetDetailController
)
tweetsRouter.get(
  '/new_feed/user',
  paginationValidator,
  accessTokenValidator,
  verifedUserValidator,
  getNewFeedController
)

// Query : {limit : number , page : number , tweet_tpe}
tweetsRouter.get(
  '/:tweetId/children',
  getTweetChildrenValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifedUserValidator),
  validatorTweetId,
  validatorAudience,

  getTweetChildrenController
)

//Tweet Circle
tweetsRouter.post('/tweet_circle/create', accessTokenValidator, verifedUserValidator, createTweetCircleControllers)

tweetsRouter.delete(
  '/tweet_circle/:user_id_in_circle',
  accessTokenValidator,
  verifedUserValidator,
  deleteTweetCircleControllers
)
//Bookmark
tweetsRouter.post('/bookmark/:tweetId', accessTokenValidator, verifedUserValidator, createBookmarkController)
tweetsRouter.delete('/bookmark/:tweetId', accessTokenValidator, verifedUserValidator, deleteBookmarkController)

///Like
tweetsRouter.post('/like/:tweetId', accessTokenValidator, verifedUserValidator, createLikeController)
tweetsRouter.delete('/like/:tweetId', accessTokenValidator, verifedUserValidator, unLikeController)
export default tweetsRouter
