/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */

import { createSelectOptions } from '@countryconfig/events/utils'
import {
  ConditionalType,
  defineFormPage,
  DocumentMimeType,
  field,
  FieldType,
  ImageMimeType,
  PageTypes,
  TranslationConfig
} from '@opencrvs/toolkit/events'

const IdType = {
  NATIONAL_ID: 'NATIONAL_ID',
  PASSPORT: 'PASSPORT',
  BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE',
  OTHER: 'OTHER'
} as const

const idTypeMessageDescriptors = {
  NATIONAL_ID: {
    defaultMessage: 'National ID',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeNationalID'
  },
  PASSPORT: {
    defaultMessage: 'Passport',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypePassport'
  },
  BIRTH_CERTIFICATE: {
    defaultMessage: 'Birth Certificate',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeBirthCertificate'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeOther'
  }
} satisfies Record<keyof typeof IdType, TranslationConfig>

const ProofOfDeathType = {
  ATTESTED_LETTER_OF_DEATH: 'ATTESTED_LETTER_OF_DEATH',
  POLICE_CERTIFICATE_OF_DEATH: 'POLICE_CERTIFICATE_OF_DEATH',
  HOSPITAL_CERTIFICATE_OF_DEATH: 'HOSPITAL_CERTIFICATE_OF_DEATH',
  CORONERS_REPORT: 'CORONERS_REPORT',
  BURIAL_RECEIPT: 'BURIAL_RECEIPT',
  OTHER: 'OTHER'
} as const

const proofOfDeathMessageDescriptors = {
  ATTESTED_LETTER_OF_DEATH: {
    defaultMessage: 'Attested letter of death',
    description: 'Label for select option Attested Letter of Death',
    id: 'form.field.label.docTypeLetterOfDeath'
  },
  POLICE_CERTIFICATE_OF_DEATH: {
    defaultMessage: 'Police certificate of death',
    description: 'Label for select option Police death certificate',
    id: 'form.field.label.docTypePoliceCertificate'
  },
  HOSPITAL_CERTIFICATE_OF_DEATH: {
    defaultMessage: 'Hospital certificate of death',
    description: 'Label for select option Hospital certificate of death',
    id: 'form.field.label.docTypeHospitalDeathCertificate'
  },
  CORONERS_REPORT: {
    defaultMessage: "Coroner's report",
    description: "Label for select option Coroner's report",
    id: 'form.field.label.docTypeCoronersReport'
  },
  BURIAL_RECEIPT: {
    defaultMessage: 'Certified copy of burial receipt',
    description: 'Label for select option Certified Copy of Burial Receipt',
    id: 'form.field.label.docTypeCopyOfBurialReceipt'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.docTypeOther'
  }
} satisfies Record<keyof typeof ProofOfDeathType, TranslationConfig>

const ProofOfCauseOfDeathType = {
  VERBAL_AUTOPSY: 'VERBAL_AUTOPSY',
  MEDICALLY_CERTIFIED: 'MEDICALLY_CERTIFIED',
  OTHER: 'OTHER'
} as const

const proofOfCauseOfDeathMessageDescriptors = {
  VERBAL_AUTOPSY: {
    defaultMessage: 'Verbal autopsy report',
    description: 'Option for form field: verbalAutopsy',
    id: 'form.field.label.verbalAutopsyReport'
  },
  MEDICALLY_CERTIFIED: {
    defaultMessage: 'Medically Certified Cause of Death',
    description: 'Option for form field: medicallyCertified',
    id: 'form.field.label.medicallyCertified'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Option for form field: Other',
    id: 'form.field.label.docTypeOther'
  }
} satisfies Record<keyof typeof ProofOfCauseOfDeathType, TranslationConfig>

const DEFAULT_FILE_CONFIGURATION = {
  maxFileSize: 5 * 1024 * 1024,
  acceptedFileTypes: [
    ImageMimeType.enum['image/jpeg'],
    ImageMimeType.enum['image/png'],
    ImageMimeType.enum['image/jpg'],
    DocumentMimeType.enum['application/pdf']
  ]
}

const idTypeOptions = createSelectOptions(IdType, idTypeMessageDescriptors)

const proofOfDeathTypeOptions = createSelectOptions(
  ProofOfDeathType,
  proofOfDeathMessageDescriptors
)

const proofOfCauseOfDeathTypeOptions = createSelectOptions(
  ProofOfCauseOfDeathType,
  proofOfCauseOfDeathMessageDescriptors
)
export const documents = defineFormPage({
  id: 'documents',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Upload supporting documents',
    description: 'Form section title for documents',
    id: 'form.section.documents.title'
  },
  fields: [
    {
      id: 'documents.helper',
      type: FieldType.PARAGRAPH,
      label: {
        defaultMessage: 'The following documents are required',
        description: 'The following documents are required',
        id: 'form.field.label.proofOfBirth.fileName'
      }
    },
    {
      id: 'documents.proofOfDeceased',
      type: FieldType.FILE_WITH_OPTIONS,
      uncorrectable: true,
      required: false,
      label: {
        defaultMessage: "Proof of deceased's ID",
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.documents.field.proofOfDeceased.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: idTypeOptions
    },
    {
      id: 'documents.proofOfInformant',
      type: FieldType.FILE_WITH_OPTIONS,
      required: false,
      uncorrectable: true,
      label: {
        defaultMessage: "Proof of informant's ID",
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.documents.field.proofOfInformant.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: idTypeOptions
    },
    {
      id: 'documents.proofOfDeath',
      type: FieldType.FILE_WITH_OPTIONS,
      uncorrectable: true,
      required: false,
      label: {
        defaultMessage: 'Proof of death of deceased',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.documents.field.proofOfDeath.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: proofOfDeathTypeOptions
    },
    {
      id: 'documents.proofOfCauseOfDeath',
      type: FieldType.FILE_WITH_OPTIONS,
      uncorrectable: true,
      required: false,
      label: {
        defaultMessage: 'Proof of cause of death',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.documents.field.proofOfCauseOfDeath.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: proofOfCauseOfDeathTypeOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('eventDetails.causeOfDeathEstablished').isEqualTo(
            true
          )
        }
      ]
    }
  ]
})
