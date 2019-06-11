import { BRN_GENERATOR_CODE } from '@workflow/constants'
import { generateBdRegistrationNumber } from '@workflow/features/registration/brnGenerator/bdRegistrationNumberGenerator'
import { generateDefaultRegistrationNumber } from '@workflow/features/registration/brnGenerator/defaultRegistrationNumberGenerator'

enum GENERATOR_CODE {
  BD = 'bd'
}

export async function generateRegistrationNumber(
  taskResource: fhir.Task,
  practitioner: fhir.Practitioner,
  generatorCode?: string
): Promise<string> {
  // tslint:disable-next-line
  generatorCode = generatorCode ? generatorCode : BRN_GENERATOR_CODE

  switch (generatorCode) {
    case GENERATOR_CODE.BD.toString():
      return await generateBdRegistrationNumber(taskResource, practitioner)
    default:
      return generateDefaultRegistrationNumber()
  }
}
