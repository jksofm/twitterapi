import path, { dirname } from 'path'
import dotenv from 'dotenv'
import fs from 'fs'

import { isProduction } from '~/constants/config'

const env = process.env.NODE_ENV

const envFilename = `.env.${env}`
export const dotenvConfig = () => {
  // if (!env) {
  //   console.log(`Ban chưa cung cấp biến môi trường NODE_ENV (ví dụ : development , production)`)
  //   process.exit(1)
  // }
  // console.log(`Phat hiện NODE_ENV=${env}, vì thế app sẽ dùng file môi trường là ${envFilename}`)
  // if (!fs.existsSync(path.resolve(envFilename))) {
  //   console.log(`Không tìm thấy file môi trường ${envFilename}`)
  //   process.exit(1)
  // }
  const pathFile = path.join(path.resolve(), env ? `/${envFilename}` : '/.env')

  dotenv.config({ path: pathFile })
}

export const pathRoot = path.resolve()
