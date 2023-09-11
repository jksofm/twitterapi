import * as core from 'express-serve-static-core';

export interface SearchQuery{
  content : string,
  limit : number,
  page : number
}