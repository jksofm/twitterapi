import { Router } from "express";
import { handleStaticFileImageController, handleStreamVideoController } from "~/controllers/media.constroller";

const staticRouter = Router()


staticRouter.get('/image/:name', handleStaticFileImageController)

staticRouter.get('/stream-video/:name', handleStreamVideoController)


export default staticRouter