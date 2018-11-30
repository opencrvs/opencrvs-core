import { BRN_GENERATOR_CODE } from 'src/constants'
import { generateBdBRN } from './bd-brn-generator'
import { generateDefaultBRN } from './default-brn-generator'

enum GENERATOR_CODE {
  BD = 'bd'
}

export async function generateBirthRegistrationNumber(
  taskResource: fhir.Task,
  token: string,
  generatorCode?: string
): Promise<string> {
  generatorCode = generatorCode ? generatorCode : BRN_GENERATOR_CODE

  switch (generatorCode) {
    case GENERATOR_CODE.BD.toString():
      return await generateBdBRN(taskResource, token)
    default:
      return generateDefaultBRN()
  }
}
