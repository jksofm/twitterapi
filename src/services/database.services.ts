import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb'
import dotenv from 'dotenv'
import User_Schema from '~/models/schemas/User.schema'
import Refresh_Token_Schema from '~/models/schemas/RefreshToken_schema'
import { PROCESS_ENV } from '~/constants/process.env'
import Follower_schema from '~/models/schemas/Follower.schema'

import { dotenvConfig } from '~/utils/dotenv'
import Tweet_schema from '~/models/schemas/Tweet.schema'
import Hashtags_Schema from '~/models/schemas/Hashtags.schema'
import Bookmarks_Schema from '~/models/schemas/Bookmark.schema'
import Likes_Schema from '~/models/schemas/Like.schema'
import TweetCircles_Schema from '~/models/schemas/Tweet_circle.schema'
import Conversation_Schema from '~/models/schemas/Conversations.schema'

dotenvConfig()
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter.4kzawrl.mongodb.net/?retryWrites=true&w=majority`
// Create a MongoClient with a MongoClientOptions object to set the Stable API version

class Database {
  private client: MongoClient
  private db: Db

  constructor() {
    this.client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    })
    this.db = this.client.db(process.env.DB_NAME as string)
  }
  async connect() {
    try {
      // console.log(path.join(projectRootPath,'.env'))

      // Connect the client to the server	(optional starting in v4.7)
      await this.client.connect()
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })

      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log(error)
    }
  }
  get users(): Collection<User_Schema> {
    return this.db.collection(process.env.DB_USERS_COLLECTION_NAME as string)
  }
  get refreshToken(): Collection<Refresh_Token_Schema> {
    return this.db.collection(process.env.DB_REFRESH_TOKEN_COLLECTION_NAME as string)
  }
  get follower(): Collection<Follower_schema> {
    return this.db.collection(process.env.DB_FOLLOWER_COLLECTION_NAME as string)
  }
  get tweets(): Collection<Tweet_schema> {
    return this.db.collection(process.env.DB_TWEET_COLLECTION_NAME as string)
  }

  get hashtags(): Collection<Hashtags_Schema> {
    return this.db.collection(process.env.DB_HASHTAGS_COLLECTION_NAME as string)
  }
  get bookmarks(): Collection<Bookmarks_Schema> {
    return this.db.collection(process.env.DB_BOOKMARKS_COLLECTION_NAME as string)
  }
  get likes(): Collection<Likes_Schema> {
    return this.db.collection(process.env.DB_LIKES_COLLECTION_NAME as string)
  }
  get tweetCircles(): Collection<TweetCircles_Schema> {
    return this.db.collection(process.env.DB_TWEET_CIRCLE_COLLECTION_NAME as string)
  }
  get conversations(): Collection<Conversation_Schema> {
    return this.db.collection(process.env.DB_CONVERSATION_COLLECTION_NAME as string)
  }
  async indexUsers() {
    // const exists = await this.users.indexExists(['email_1_password_1', 'username_1', 'email_1'])
    // if (!exists) {
    //   this.users.createIndex({ email: 1, password: 1 })
    //   this.users.createIndex({ email: 1 }, { unique: true })
    //   this.users.createIndex({ username: 1 }, { unique: true })
    // }
  }
  async indexTweets() {
    const exists = await this.tweets.indexExists(['content_text'])
    if (exists === false) {
      await this.tweets.createIndex({ content: 'text' })
    }
    // DB.tweets.dropIndexes()
  }
  async indexRefreshTokens() {
    const exists = await this.refreshToken.indexExists(['token_1', 'exp_1'])
    if (!exists) {
      this.refreshToken.createIndex({ token: 1 })
      this.refreshToken.createIndex(
        { exp: 1 },
        {
          expireAfterSeconds: 0
        }
      )
    }
  }
  async indexFollowers() {
    const exists = await this.refreshToken.indexExists([' user_id_1_followed_user_id_1'])
    if (!exists) {
      this.users.createIndex({ user_id: 1, followed_user_id: 1 })
    }
  }
}

export const DB = new Database()
