import { readFile } from 'fs'
import { join } from 'path'

interface IField {
  firstNames: string
  familyName: string
  applicantFirstNames: string
  applicantFamilyName: string
}

export interface IFields {
  [key: string]: IField
}

export async function getCollectorFields(): Promise<IFields> {
  return new Promise((resolve, reject) => {
    readFile(join(__dirname, './collector.json'), (err, data) => {
      err ? reject(err) : resolve(JSON.parse(data.toString()))
    })
  })
}
