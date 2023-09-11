import { Router } from 'express'
import { uploadImageController, uploadVideoController } from '~/controllers/media.constroller'
import { accessTokenValidator } from '~/middlewares/users-middlewares/access_token_validator'
import { verifedUserValidator } from '~/middlewares/users-middlewares/verifiy_user_validator'

const mediaRouter = Router()

mediaRouter.post('/upload-image', accessTokenValidator, verifedUserValidator, uploadImageController)

mediaRouter.post('/upload-video', accessTokenValidator, verifedUserValidator, uploadVideoController)

export default mediaRouter
