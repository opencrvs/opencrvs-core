import { BRN_GENERATOR_CODE } from 'src/constants'
import { generateBdBRN } from './bd-brn-generator'
import { generateDefaultBRN } from './default-brn-generator'
import { ITokenPayload } from 'src/utils/authUtils.ts'

enum GENERATOR_CODE {
  BD = 'bd'
}

export function generateBirthRegistrationNumber(
  fhirBundle: fhir.Bundle,
  tokenPayload: ITokenPayload,
  generatorCode?: string
): string {
  generatorCode = generatorCode ? generatorCode : BRN_GENERATOR_CODE

  switch (generatorCode) {
    case GENERATOR_CODE.BD.toString():
      return generateBdBRN(fhirBundle, tokenPayload)
    default:
      return generateDefaultBRN()
  }
}
