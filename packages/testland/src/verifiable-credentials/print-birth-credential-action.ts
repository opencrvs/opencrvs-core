import {
  FieldType,
  field,
  window,
  FieldConfig,
  ConditionalType,
  never
} from '@opencrvs/toolkit/events'
import { PAPER_CREDENTIAL_HANDLER_URL } from './routes'

/**
 * These fields will be included in print certificate action form as hidden. The credential will be minted before printing.
 */
export const printBirthCredentialActionFields = [
  {
    id: 'verifiable-credential-creation-http-request',
    type: FieldType.HTTP,
    label: {
      defaultMessage: 'Create verifiable credential',
      description: 'Label for the field that creates the verifiable credential',
      id: 'event.birth.action.certificate.form.section.collectPayment.createCredential.label'
    },
    configuration: {
      url: PAPER_CREDENTIAL_HANDLER_URL,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: { pathname: window().location.get('pathname') },
      timeout: 10000
    },
    conditionals: [
      {
        type: ConditionalType.DISPLAY_ON_REVIEW,
        conditional: never()
      }
    ]
  },
  {
    id: 'verifiable-credential',
    type: FieldType.ALPHA_HIDDEN,
    parent: field('verifiable-credential-creation-http-request'),
    label: {
      defaultMessage: 'Verifiable credential URL',
      description:
        'This field stores the verifiable credential URL returned from the issuer after creation',
      id: 'event.birth.action.certificate.form.section.collectPayment.verifiableCredentialUrl.label'
    },
    value: field('verifiable-credential-creation-http-request').get(
      'data.credential_qr'
    ),
    conditionals: [
      {
        type: ConditionalType.DISPLAY_ON_REVIEW,
        conditional: never()
      }
    ]
  }
] satisfies FieldConfig[]
