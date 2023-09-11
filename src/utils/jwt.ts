import jwt from 'jsonwebtoken'
import { TokenPayload } from '~/models/interface/requests/Users.requests'

export const signToken = (payload: any, options: jwt.SignOptions, privatekey: string) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(
      payload,
      privatekey,
      {
        ...options,
        algorithm: 'HS256'
      },
      (error, token) => {
        if (error) {
          throw reject(error)
        }
        resolve(token as string)
      }
    )
  })
}

export const verifyToken = ({ token, secretKey }: { token: string; secretKey: string }) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, secretKey, (error, decoded) => {
      if (error) {
        throw reject(error)
      }
      resolve(decoded as TokenPayload)
    })
  })
}
