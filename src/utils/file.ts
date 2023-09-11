import { NextFunction, Request, Response } from 'express'
import formidable, { File, Files, errors as formidableErrors } from 'formidable'

import fs from 'fs'
import path from 'path'
import { UPLOAD_FOLDER_TEMP } from '~/constants/dir'

export const initFolder = () => {
  
  if (!fs.existsSync(UPLOAD_FOLDER_TEMP)) {
    fs.mkdirSync(
      UPLOAD_FOLDER_TEMP,

      {
        recursive: true
      }
    )
  }
}

export const getNameFromFullname = (fullname:string)=>{
   const namearr = fullname.split('.')
   namearr.pop()
   return namearr.join('')

}


