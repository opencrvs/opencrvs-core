import { readFile } from 'fs'
import { join } from 'path'
import { LANGUAGES_SOURCE } from '@resources/zmb/constants'

interface IMessageIdentifier {
  [key: string]: string
}

export interface ILanguage {
  lang: string
  displayName: string
  messages: IMessageIdentifier
}

export interface ILanguageDataResponse {
  data: ILanguage[]
}

export async function getLanguages(
  application: string
): Promise<ILanguageDataResponse> {
  return new Promise((resolve, reject) => {
    readFile(join(LANGUAGES_SOURCE, `${application}.json`), (err, data) => {
      err ? reject(err) : resolve(JSON.parse(data.toString()))
    })
  })
}
