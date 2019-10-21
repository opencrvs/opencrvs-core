import { readFile } from 'fs'
import { join } from 'path'

interface IForm {
  sections: Array<any> // no point defining full types here as we don't use them
}

interface INameField {
  firstNamesField: string
  familyNameField: string
}
interface INameFields {
  [language: string]: INameField
}

interface ICollectorField {
  identifierTypeField: string
  identifierOtherTypeField: string
  identifierField: string
  nameFields: INameFields
  birthDateField: string
  nationalityField: string
}

interface ICertificateCollectorDefinition {
  [collector: string]: ICollectorField
}
export interface IForms {
  registerForm: {
    birth: IForm
    death: IForm
  }
  certificateCollectorDefinition: {
    birth: ICertificateCollectorDefinition
    death: ICertificateCollectorDefinition
  }
}

export async function getForms(): Promise<IForms> {
  return new Promise((resolve, reject) => {
    readFile(join(__dirname, './register.json'), (err, data) => {
      err ? reject(err) : resolve(JSON.parse(data.toString()))
    })
  })
}
