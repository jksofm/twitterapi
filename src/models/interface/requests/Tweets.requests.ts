import { TweetAudience, TweetType } from "~/constants/enums"
import { Media } from "../media/media"

export interface TweetRequestBody {
  type: TweetType
  audience: TweetAudience
  content: string
  hashtags: string[]
  parent_id: null | string
  mentions: string[]
  media: Media[]
}
