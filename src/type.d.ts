import { Request } from "express";
import User from "./models/schemas/User.schema";
import { TokenPayload } from "./models/interface/requests/Users.requests";
import Tweet_schema from "./models/schemas/Tweet.schema";



declare module 'express' {
  interface Request {
    user? : User
    decoded_authorization?: TokenPayload ,
    decoded_refresh_token? : TokenPayload,
    decoded_email_verify_token? : TokenPayload,
    decoded_forgot_password_verify_token? : TokenPayload,
    refresh_Token? : string,
    tweet? :  Tweet_schema 
  }
}