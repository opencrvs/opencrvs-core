import { BRN_GENERATOR_CODE } from 'src/constants'
import { generateBdRegistrationNumber } from './bdRegistrationNumberGenerator'
import { generateDefaultRegistrationNumber } from './defaultRegistrationNumberGenerator'

enum GENERATOR_CODE {
  BD = 'bd'
}

export async function generateRegistrationNumber(
  taskResource: fhir.Task,
  practitioner: fhir.Practitioner,
  generatorCode?: string
): Promise<string> {
  generatorCode = generatorCode ? generatorCode : BRN_GENERATOR_CODE

  switch (generatorCode) {
    case GENERATOR_CODE.BD.toString():
      return await generateBdRegistrationNumber(taskResource, practitioner)
    default:
      return generateDefaultRegistrationNumber()
  }
}
