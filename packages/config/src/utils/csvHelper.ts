import { parseString } from 'fast-csv'

export type PlainObject = {
  [key: string]: string
}

export function csvToJSON(csv: string): Promise<PlainObject[]> {
  return new Promise((resolve, reject) => {
    const result = [] as any[]
    parseString(csv, { headers: true })
      .on('error', (error) => reject(error))
      .on('data', (row) => result.push(row))
      .on('end', () => resolve(result))
  })
}
