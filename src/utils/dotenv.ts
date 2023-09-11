import path, { dirname } from 'path'
import dotenv from 'dotenv'
import { isProduction } from '~/constants/config'

export const dotenvConfig = () => {
  const pathFile = path.join(path.resolve(), isProduction ? '/.env.production' : '/.env')

  dotenv.config({ path: pathFile })
}

export const pathRoot = path.resolve()
