import { EventIndex, NameFieldValue } from '@opencrvs/toolkit/events'
import type { BirthCredentialData } from './birth-credential-definition'

const BIRTH_ISSUER_DID = 'did:web:issuer.opencrvs.dev'

export const birthCredentialTemplate = (event: EventIndex) => {
  const childName = event.declaration['child.name'] as NameFieldValue
  const registrationNumber = event.legalStatuses.REGISTERED!.registrationNumber // non-null assertion is safe because this template should only be used for registered events
  const fatherName = event.declaration['father.name'] as
    | NameFieldValue
    | undefined
  const motherName = event.declaration['mother.name'] as
    | NameFieldValue
    | undefined
  const dateOfEvent = event.dateOfEvent as string
  const childGender =
    (event.declaration['child.gender'] as string) === 'male' ? 1 : 2

  return {
    issuerDid: BIRTH_ISSUER_DID,
    credentialConfigurationId: 'crvs_birth_v1',
    credentialData: {
      given_name: childName.firstname,
      middle_name: childName.middlename,
      family_name: childName.surname,
      registration_number: registrationNumber,
      birthdate: dateOfEvent,

      place_of_birth: {
        name: 'Chamakubi Health Post, Ibombo, Central',
        country: 'FAR'
      },

      nationalities: ['FAR'],

      sex: childGender,

      parents: [
        {
          given_name: motherName?.firstname,
          middle_name: motherName?.middlename,
          family_name: motherName?.surname,
          identifier: event.declaration['mother.nid'] as string | undefined,
          nationalities: ['FAR']
        },
        {
          given_name: fatherName?.firstname,
          middle_name: fatherName?.middlename,
          family_name: fatherName?.surname,
          identifier: event.declaration['father.nid'] as string | undefined,
          nationalities: ['FAR']
        }
      ]
    } satisfies BirthCredentialData,
    mapping: {
      id: '<uuid>',
      iat: '<timestamp-seconds>',
      nbf: '<timestamp-seconds>',
      exp: '<timestamp-in-seconds:365d>'
    },
    authenticationMethod: 'PRE_AUTHORIZED',
    selectiveDisclosure: {
      fields: {
        given_name: { sd: true },
        middle_name: { sd: true },
        family_name: { sd: true },
        registration_number: { sd: true },
        birthdate: {
          sd: true
        },
        place_of_birth: {
          sd: true
        }
      },
      decoyMode: 'NONE',
      decoys: 0
    }
  }
}
