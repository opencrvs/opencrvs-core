import { IFormField, IFormData } from '@register/forms'
import { fieldToAttachmentTransformer } from '@register/forms/mappings/mutation/field-mappings'
import { deceasedSection } from '@register/forms/register/fieldDefinitions/death/deceased-section'
import { applicantsSection } from '@register/forms/register/fieldDefinitions/death/application-section'
import { defineMessages } from 'react-intl'

const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  deceased: {
    id: 'register.form.tabs.deceasedTab',
    defaultMessage: 'Deceased',
    description: 'Document for whom showd in the preview dropdown for document'
  },
  applicant: {
    id: 'register.form.tabs.applicantTab',
    defaultMessage: 'Applicant',
    description: 'Document for whom showd in the preview dropdown for document'
  }
})

export const documentForWhomFhirMapping = {
  "Proof of Deceased's ID": 'DECEASED_ID_PROOF',
  'Proof Deceased Permanent Address': 'DECEASED_PARMANENT_ADDRESS_PROOF',
  'Proof of Death of Deceased': 'DECEASED_DEATH_PROOF',
  'Proof of Date of Birth of Deceased': 'DECEASED_BIRTH_PROOF',
  "Proof of Applicant's ID": 'APPLICANT_ID_PROOF'
}

export const sectionMapping = {
  [deceasedSection.id]: [
    documentForWhomFhirMapping["Proof of Deceased's ID"],
    documentForWhomFhirMapping['Proof Deceased Permanent Address'],
    documentForWhomFhirMapping['Proof of Death of Deceased'],
    documentForWhomFhirMapping['Proof of Date of Birth of Deceased']
  ],
  [applicantsSection.id]: [
    documentForWhomFhirMapping["Proof of Applicant's ID"]
  ]
}

export const sectionTitle = {
  [deceasedSection.id]: messages.deceased,
  [applicantsSection.id]: messages.applicant
}

export const documentTypeFhirMapping = {
  'Birth Registration': 'BIRTH_REGISTRATION',
  'National ID (front)': 'NATIONAL_ID_FRONT',
  'National ID (back)': 'NATIONAL_ID_BACK',
  'Certified Post Mortem Report': 'POST_MORTEM_CERTIFICATE',
  'Hospital Discharge Certificate': 'HOSPITAL_DISCHARGE_CERTIFICATE',
  'Attested Letter of Death': 'ATTESTED_DEATH_LETTER',
  'Attested Certificate of Death': 'ATTESTED_DEATH_CERTIFICATE',
  'Certified Copy of Burial Receipt': 'BURIAL_RECEIPT',
  'Certified Copy of Funeral Receipt': 'FUNERAL_RECEIPT',
  Passport: 'PASSPORT'
}

export function deathFieldToAttachmentTransformer(
  transformedData: any,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) {
  return fieldToAttachmentTransformer(
    transformedData,
    draftData,
    sectionId,
    field,
    'registration',
    documentForWhomFhirMapping,
    documentTypeFhirMapping
  )
}
