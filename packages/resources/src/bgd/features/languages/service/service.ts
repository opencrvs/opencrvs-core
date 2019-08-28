import * as fs from 'fs'
import * as path from 'path'
import { LANGUAGES_SOURCE } from '@resources/bgd/constants'

interface IMessageIdentifier {
  [key: string]: string
}

interface ILanguage {
  lang: string
  displayName: string
  messages: IMessageIdentifier
}

export interface ILanguageDataResponse {
  data: ILanguage[]
}

export function getLanguages(application: string): ILanguageDataResponse {
  const languagesUrl = path.join(LANGUAGES_SOURCE, `${application}.json`)
  const languages = JSON.parse(fs.readFileSync(languagesUrl).toString())

  return languages
}
