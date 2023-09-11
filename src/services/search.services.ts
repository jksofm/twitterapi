import { SearchQuery } from '~/models/interface/requests/Searchs.request'
import { DB } from './database.services'

class SearchService {
  async search({ content, limit = 5, page = 1 }: SearchQuery) {
    // console.log(await DB.tweets.indexes())
    // DB.tweets.dropIndexes()

    // await DB.tweets.createIndex({ content: 'text' })
    // console.log('------')
    // console.log(await DB.tweets.indexExists(['content_text']))
    // console.log('------')

    // console.log(await DB.tweets.indexes())
    try {
      const result = await DB.tweets
        .find({ $text: { $search: content } })

        .skip(limit * (page - 1))
        .limit(limit)
        .toArray()

      console.log(result)
      return result
    } catch (e) {
      console.log(e)
      return e
    }
  }
}

const searchService = new SearchService()

export default searchService
