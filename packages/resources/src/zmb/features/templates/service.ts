import { readFile } from 'fs'
import { join } from 'path'
import { IPDFTemplate } from '@opencrvs/register/src/pdfRenderer/transformer/types'

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
