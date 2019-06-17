import * as elasticsearch from 'elasticsearch'
import { ES_HOST } from '@search/constants'

export const client = new elasticsearch.Client({
  host: ES_HOST
})
