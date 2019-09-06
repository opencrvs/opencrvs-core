import { readFile } from 'fs'
import { join } from 'path'
import {
  TDocumentDefinitions,
  TFontFamily,
  TFontFamilyTypes
} from 'pdfmake/build/pdfmake'

interface IPDFTemplate {
  definition: TDocumentDefinitions
  fonts: { [language: string]: { [name: string]: TFontFamilyTypes } }
  vfs: TFontFamily
  transformers?: Array<any> // no point defining full types here as we don't use them
}

export interface ITemplates {
  receipt?: IPDFTemplate
  certificates: {
    birth: IPDFTemplate
    death: IPDFTemplate
  }
}

export async function getTemplates(): Promise<ITemplates> {
  return new Promise((resolve, reject) => {
    readFile(join(__dirname, './register.json'), (err, data) => {
      err ? reject(err) : resolve(JSON.parse(data.toString()))
    })
  })
}
