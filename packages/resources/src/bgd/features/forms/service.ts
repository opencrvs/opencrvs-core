import { readFile } from 'fs'
import { join } from 'path'

interface IForm {
  sections: Array<any> // no point defining full types here as we don't use them
}

interface ICollectorField {
  firstNames: string
  familyName: string
  applicantFirstNames: string
  applicantFamilyName: string
}
export interface ICollectorFields {
  [key: string]: ICollectorField
}
export interface IForms {
  registerForm: {
    birth: IForm
    death: IForm
  }
  certificateCollection: ICollectorFields
}

export async function getForms(): Promise<IForms> {
  return new Promise((resolve, reject) => {
    readFile(join(__dirname, './register.json'), (err, data) => {
      err ? reject(err) : resolve(JSON.parse(data.toString()))
    })
  })
}
