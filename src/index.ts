import express, { NextFunction, Request, Response } from 'express'
import usersRouter from './routes/users.routes'
import { DB } from './services/database.services'
import dotenv from 'dotenv'
import { error } from 'console'
import { defaultErrorHandler } from './controllers/errors.controller'
import mediaRouter from './routes/media.routes'
import { initFolder } from './utils/file'
import path from 'path'
import { UPLOAD_FOLDER } from './constants/dir'
import staticRouter from './routes/static.routes'
import tweetsRouter from './routes/tweets.routes'
import searchRouter from './routes/search.routes'
import swaggerUI from 'swagger-ui-express'
import YAML from 'yaml'
import fs from 'fs'
import swaggerJSDoc from 'swagger-jsdoc'
import argv from 'minimist'
import helmet from 'helmet'
import { createServer } from 'http'
import cors from 'cors'
// import '~/utils/fake'
import '~/utils/s3'

import conversationsRouter from './routes/conversations.routes'
import { rateLimit } from 'express-rate-limit'
import initSocket from '~/utils/socket'
import { dotenvConfig } from './utils/dotenv'
import { isProduction } from './constants/config'

const app = express()

const httpServer = createServer(app)
// Xu li bien moi truong
dotenvConfig()
// limit request
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: 'draft-7', // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
  legacyHeaders: false // X-RateLimit-* headers
  // store: ... , // Use an external store for more precise rate limiting
})
app.use(limiter)
//Xu li file tĩnh
const pathUpload = path.join(UPLOAD_FOLDER)
app.use('/uploads', express.static(pathUpload))
//swagger js-doc
const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hello World',
      version: '1.0.0'
    }
  },
  apis: ['./src/routes/*.routes.ts'] // files containing annotations as above
}
//// Kiem tra moi truong
console.log(argv(process.argv.slice(2)))

const openapiSpecification = swaggerJSDoc(options)
// app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(openapiSpecification))

/// Swagger with yaml file
const file = fs.readFileSync(path.resolve('twitter_swagger.yaml'), 'utf8')
const swaggerDocument = YAML.parse(file)
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))

//Xu li cors
app.use(cors({}))

//Security wwith helmet
app.use(helmet())

// connect database và index
DB.connect().then(() => {
  DB.indexUsers()
  DB.indexRefreshTokens()
  DB.indexFollowers()
  DB.indexTweets()
})
// sendVerifyEmail('lequochuypy1998@gmail.com', 'Tiêu đề email', '<h1>Nội dung email</h1>')
/// Khoi tao folder khi upload
initFolder()

//Chuyen doi json ve object cho body
app.use(express.json())
// Router
app.use('/api/media', mediaRouter)
app.use('/static', staticRouter)

app.use('/api/users', usersRouter)
app.use('/api/tweets', tweetsRouter)
app.use('/api/search', searchRouter)
app.use('/api/chat', conversationsRouter)

///Socket Io
initSocket(httpServer)

//Listen port
httpServer.listen(process.env.PORT, () => {
  console.log(`Currently listenning on  ${process.env.PORT}`)
})
//Error Handler
app.use(defaultErrorHandler)
