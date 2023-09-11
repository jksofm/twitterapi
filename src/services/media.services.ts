import { Request } from 'express'
import formidable, { File } from 'formidable'
import sharp from 'sharp'
import { UPLOAD_FOLDER, UPLOAD_FOLDER_IMAGE, UPLOAD_FOLDER_TEMP, UPLOAD_FOLDER_VIDEO } from '~/constants/dir'
import { getNameFromFullname } from '~/utils/file'
import fs from 'fs'
import fsPromise from 'fs/promises'
import { isProduction } from '~/constants/config'
import { dotenvConfig } from '~/utils/dotenv'
import { MediaType } from '~/constants/enums'
import { Media } from '~/models/interface/media/media'
import { uploadFileToS3 } from '~/utils/s3'
import path from 'path'
import mime from 'mime'
import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3'
dotenvConfig()
class MediaService {
  constructor() {}
  handleUploadImage(req: Request) {
    const form = formidable({
      uploadDir: UPLOAD_FOLDER_TEMP,
      maxFiles: 4,
      keepExtensions: true,
      maxFieldsSize: 300 * 1024,
      maxTotalFileSize: 300 * 1024 * 5,
      filter: function ({ name, originalFilename, mimetype }) {
        const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
        if (!valid) {
          form.emit('error' as any, new Error('Invalid type') as any)
        }

        return valid
      }
    })

    return new Promise<File[]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          reject(err)
        }
        // eslint-disable-next-line no-extra-boolean-cast
        if (!Boolean(files.image)) {
          return reject(new Error('File is empty'))
        }

        resolve(files.image as File[])
      })
    })
  }
  handleUploadVideo(req: Request) {
    const form = formidable({
      uploadDir: UPLOAD_FOLDER_VIDEO,
      maxFiles: 1,
      keepExtensions: true,
      maxFieldsSize: 100 * 1024 * 1024,

      filter: function ({ name, originalFilename, mimetype }) {
        const valid = name === 'video' && Boolean(mimetype?.includes('mp4') || mimetype?.includes('quicktme'))
        if (!valid) {
          form.emit('error' as any, new Error('Invalid type') as any)
        }

        return valid
      }
    })

    return new Promise<File[]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          reject(err)
        }
        // eslint-disable-next-line no-extra-boolean-cast
        if (!Boolean(files.video)) {
          return reject(new Error('File is empty'))
        }
   
        resolve(files.video as File[])
      })
    })
  }
  async handleResizeImage(req: Request,user_id : string) {
    const files = await this.handleUploadImage(req)

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullname(file.newFilename)
        const newPath = path.resolve(UPLOAD_FOLDER_IMAGE, `${newName}.jpg`)
        console.log(newPath)
        await sharp(file.filepath).jpeg({}).toFile(newPath)

        const s3 = await uploadFileToS3({
          filename: `images/${user_id}/${newName}.jpg`,
          filePath: newPath,
          contentType: mime.getType(newPath) as string
        })
        await Promise.all([fsPromise.unlink(file.filepath), fsPromise.unlink(newPath)])

        // const urlProduction = `${process.env.HOST}/uploads/images/${newName}.jpg`
        // const urlDevelopment = `${req.protocol}://${req.hostname}:${process.env.PORT}/uploads/images/${newName}.jpg`
        return {
          url: (s3 as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaType.Image
        }
      })
    )
    return result
  }
  async uploadVideo(req: Request,user_id : string) {
    const files = await this.handleUploadVideo(req)
    const { newFilename,filepath } = files[0]
     const s3 = await uploadFileToS3({
          filename: `videos/${user_id}/${newFilename}`,
          filePath: filepath,
          contentType: mime.getType(filepath) as string
        })
    const urlProduction = `${process.env.HOST}/uploads/videos/${newFilename}`
    const urlDevelopment = `${req.protocol}://${req.hostname}:${process.env.PORT}/uploads/videos/${newFilename}`
    // return {
    //   url: isProduction ? urlProduction : urlDevelopment,
    //   type: MediaType.Video
    // }
    await fsPromise.unlink(filepath)
    return {
      url: (s3 as CompleteMultipartUploadCommandOutput).Location as string,
      type: MediaType.Video
    }
  }
}

const mediaService = new MediaService()

export default mediaService
