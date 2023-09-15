import { NextFunction, Request, Response } from 'express'
import path from 'path'
import { UPLOAD_FOLDER, UPLOAD_FOLDER_IMAGE, UPLOAD_FOLDER_VIDEO } from '~/constants/dir'
import mime from 'mime'
import httpStatusCode from '~/constants/httpStatusCode'
import { usersMessages } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/interface/errors/Error'
import mediaService from '~/services/media.services'
import fs from 'fs'
import { catchAsync } from '~/utils/catchAsync'

export const uploadImageController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user_id = req.decoded_authorization?.userId
    const result = await mediaService.handleResizeImage(req, user_id)

    res.json({
      message: usersMessages.UPLOAD_FILE_SUCCESS,
      result
    })
  } catch (error: any) {
    throw new ErrorWithStatus({
      message: error.message,
      status: httpStatusCode.BAD_REQUEST
    })
  }
})

export const handleStaticFileImageController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_FOLDER_IMAGE, name), (err) => {
    if (err) {
      res.status(httpStatusCode.NOT_FOUND).send('Not found')
    }
  })
})
export const handleStreamVideoController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const range = req.headers.range
  // if (!range) res.status(httpStatusCode.BAD_REQUEST).send('Requires Range header')
  // console.log("range")
  // if(!range){
  //    throw new Error('Requires Range headers')
  // }

  const name = req.params.name
  const videoPath = path.resolve(UPLOAD_FOLDER_VIDEO, name)
  // console.log(videoPath)

  const videoSize = fs.statSync(videoPath).size
  // console.log(videoSize)

  const chunkSize = 10 * 10 * 10 * 10 * 10 * 10 // 1 MB

  const start = Number(range?.replace(/\D/g, ''))

  const end = Math.min(start + chunkSize, videoSize - 1)

  const contentLength = end - start + 1
  const contentType = mime.getType(videoPath) || 'video/*'
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }

  res.writeHead(httpStatusCode.PARTIAL_CONTENT, headers)

  const videoStreams = fs.createReadStream(videoPath, { start, end })
  videoStreams.pipe(res)
})

export const uploadVideoController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user_id = req.decoded_authorization?.userId
    const result = await mediaService.uploadVideo(req, user_id)

    res.json({
      message: usersMessages.UPLOAD_FILE_SUCCESS,
      result: {
        result
      }
    })
  } catch (error: any) {
    throw new ErrorWithStatus({
      message: error.message,
      status: httpStatusCode.BAD_REQUEST
    })
  }
})
