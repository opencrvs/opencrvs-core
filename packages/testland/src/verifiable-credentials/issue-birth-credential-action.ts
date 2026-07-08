import {
  ActionConfig,
  ActionType,
  ConditionalType,
  FieldType,
  and,
  field,
  flag,
  not,
  window,
  status
} from '@opencrvs/toolkit/events'
import {
  InformantType,
  InformantTypeKey
} from '@countryconfig/events/birth/forms/pages/informant'
import { informantMessageDescriptors } from '@countryconfig/events/utils'
import { CREDENTIAL_OFFER_HANDLER_URL } from './routes'

const qrGenerated = not(
  field('get-credential-offer')
    .get('data.credential_offer_uri_qr')
    .isUndefined()
)

const motherExists = not(field('mother.name').isFalsy())
const fatherExists = not(field('father.name').isFalsy())

const motherAndFatherExist = and(motherExists, fatherExists)
const onlyMotherExists = and(motherExists, not(fatherExists))
const onlyFatherExists = and(fatherExists, not(motherExists))
const motherAndFatherMissing = and(not(motherExists), not(fatherExists))

const requesterLabel = {
  defaultMessage: 'Requester',
  description: 'Select who is requesting the VC',
  id: 'event.birth.custom.action.issue-vc.field.requester.label'
}

const motherOption = {
  value: 'MOTHER',
  label: {
    defaultMessage: 'Mother',
    description: 'Option label for mother requester type',
    id: 'event.birth.custom.action.issue-vc.field.requester.option.mother'
  }
}

const fatherOption = {
  value: 'FATHER',
  label: {
    defaultMessage: 'Father',
    description: 'Option label for father requester type',
    id: 'event.birth.custom.action.issue-vc.field.requester.option.father'
  }
}

const getInformantOption = (informantType: InformantTypeKey) => {
  const defaultMessage =
    informantType === InformantType.OTHER
      ? 'Informant'
      : `${informantMessageDescriptors[informantType].defaultMessage} (informant)`

  return {
    value: 'INFORMANT',
    label: {
      defaultMessage,
      description: 'Option label for informant requester type',
      id: `event.birth.custom.action.issue-vc.field.requester.option.informant.${informantType.toLowerCase()}`
    }
  }
}

const getFieldConfigForInformant = (informantType: InformantTypeKey) => {
  const informantRelationMatch =
    field('informant.relation').isEqualTo(informantType)
  const informantOption = getInformantOption(informantType)

  return [
    {
      id: 'requester.type',
      type: FieldType.SELECT,
      required: true,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(qrGenerated),
            informantRelationMatch,
            onlyMotherExists
          )
        }
      ],
      options: [motherOption, informantOption],
      label: requesterLabel
    },
    {
      id: 'requester.type',
      type: FieldType.SELECT,
      required: true,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(qrGenerated),
            informantRelationMatch,
            onlyFatherExists
          )
        }
      ],
      options: [fatherOption, informantOption],
      label: requesterLabel
    },
    {
      id: 'requester.type',
      type: FieldType.SELECT,
      required: true,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(qrGenerated),
            informantRelationMatch,
            motherAndFatherExist
          )
        }
      ],
      options: [motherOption, fatherOption, informantOption],
      label: requesterLabel
    },
    {
      id: 'requester.type',
      type: FieldType.SELECT,
      required: true,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(qrGenerated),
            informantRelationMatch,
            motherAndFatherMissing
          )
        }
      ],
      options: [informantOption],
      label: requesterLabel
    }
  ]
}

export const issueBirthCredentialAction = {
  type: ActionType.CUSTOM,
  customActionType: 'ISSUE_VERIFIABLE_CREDENTIAL',
  label: {
    defaultMessage: 'Issue a verifiable credential',
    description: '',
    id: 'event.birth.action.issue-vc.label'
  },
  auditHistoryLabel: {
    defaultMessage: 'Verifiable Credential issued',
    description: '',
    id: 'event.birth.action.issue-vc.audit-history-label'
  },
  icon: 'QrCode',
  flags: [
    // Adding this flag to prevents the action from being shown again after the credential is issued.
    // {
    //   id: 'vc-issued',
    //   operation: 'add'
    // }
  ],
  conditionals: [
    {
      type: ConditionalType.ENABLE,
      conditional: not(flag('vc-issued'))
    },
    {
      type: ConditionalType.SHOW,
      conditional: and(not(flag('vc-issued')), status('REGISTERED'))
    }
  ],
  form: [
    {
      id: 'supporting-copy',
      // NOTE!
      // Setting PARAGRAPH to required disables submission before the VC is issued.
      required: true,
      type: FieldType.PARAGRAPH,
      label: {
        defaultMessage:
          'Check the requesters details and issue the verifiable credential.',
        description:
          'This is the confirmation text for the registrar general feedback action',
        id: 'event.birth.custom.action.issue-vc.field.supporting-copy'
      },
      configuration: { styles: { hint: true } },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(qrGenerated)
        }
      ]
    },
    {
      id: 'requester.type',
      type: FieldType.SELECT,
      required: true,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(qrGenerated),
            field('informant.relation').isEqualTo(InformantType.MOTHER),
            fatherExists
          )
        }
      ],
      options: [motherOption, fatherOption],
      label: requesterLabel
    },
    {
      id: 'requester.type',
      type: FieldType.SELECT,
      required: true,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(qrGenerated),
            field('informant.relation').isEqualTo(InformantType.MOTHER),
            not(fatherExists)
          )
        }
      ],
      options: [motherOption],
      label: requesterLabel
    },
    {
      id: 'requester.type',
      type: FieldType.SELECT,
      required: true,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(qrGenerated),
            field('informant.relation').isEqualTo(InformantType.FATHER),
            motherExists
          )
        }
      ],
      options: [fatherOption, motherOption],
      label: requesterLabel
    },
    {
      id: 'requester.type',
      type: FieldType.SELECT,
      required: true,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(qrGenerated),
            field('informant.relation').isEqualTo(InformantType.FATHER),
            not(motherExists)
          )
        }
      ],
      options: [fatherOption],
      label: requesterLabel
    },
    ...getFieldConfigForInformant(InformantType.OTHER),
    ...getFieldConfigForInformant(InformantType.BROTHER),
    ...getFieldConfigForInformant(InformantType.GRANDFATHER),
    ...getFieldConfigForInformant(InformantType.GRANDMOTHER),
    ...getFieldConfigForInformant(InformantType.SISTER),
    ...getFieldConfigForInformant(InformantType.LEGAL_GUARDIAN),
    {
      parent: field('requester.type'),
      id: 'padding-for-layout-1',
      type: FieldType.PARAGRAPH,
      label: {
        defaultMessage: '<div style="height:60px"></div>',
        description: '60px padding for layout',
        id: 'form.field.label.padding.60px'
      },
      configuration: {},
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('requester.type').isUndefined(),
            not(qrGenerated)
          )
        }
      ]
    },
    {
      parent: field('requester.type'),
      id: 'requester.data.mother',
      type: FieldType.DATA,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('requester.type').isEqualTo('MOTHER'),
            not(qrGenerated)
          )
        }
      ],
      label: {
        defaultMessage: 'Details in the birth record',
        description: 'Title for the data section',
        id: 'event.birth.custom.action.issue-vc.field.requester.label'
      },
      configuration: {
        data: [
          { fieldId: 'mother.idType' },
          { fieldId: 'mother.nid' },
          { fieldId: 'mother.passport' },
          { fieldId: 'mother.brn' },
          { fieldId: 'mother.name' },
          { fieldId: 'mother.dob' },
          { fieldId: 'mother.age' },
          { fieldId: 'mother.nationality' }
        ]
      }
    },
    {
      parent: field('requester.type'),
      id: 'requester.data.father',
      type: FieldType.DATA,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('requester.type').isEqualTo('FATHER'),
            not(qrGenerated)
          )
        }
      ],
      label: {
        defaultMessage: 'Details in the birth record',
        description: 'Title for the data section',
        id: 'event.birth.custom.action.issue-vc.field.requester.label'
      },
      configuration: {
        data: [
          { fieldId: 'father.idType' },
          { fieldId: 'father.nid' },
          { fieldId: 'father.passport' },
          { fieldId: 'father.brn' },
          { fieldId: 'father.name' },
          { fieldId: 'father.dob' },
          { fieldId: 'father.age' },
          { fieldId: 'father.nationality' }
        ]
      }
    },
    {
      parent: field('requester.type'),
      id: 'requester.data.informant.other',
      type: FieldType.DATA,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('requester.type').isEqualTo('INFORMANT'),
            not(field('informant.relation').isEqualTo('MOTHER')),
            not(field('informant.relation').isEqualTo('FATHER')),
            not(qrGenerated)
          )
        }
      ],
      label: {
        defaultMessage: 'Details in the birth record',
        description: 'Title for the data section',
        id: 'event.birth.custom.action.issue-vc.field.requester.label'
      },
      configuration: {
        data: [
          { fieldId: 'informant.idType' },
          { fieldId: 'informant.nid' },
          { fieldId: 'informant.passport' },
          { fieldId: 'informant.brn' },
          { fieldId: 'informant.name' },
          { fieldId: 'informant.dob' },
          { fieldId: 'informant.age' },
          { fieldId: 'informant.other.relation' },
          { fieldId: 'informant.nationality' }
        ]
      }
    },
    {
      parent: field('requester.type'),
      id: 'request-credential-offer-button',
      type: FieldType.BUTTON,
      required: true,
      label: {
        defaultMessage: 'Verifiable credential offer',
        description: 'Button to request the credential offer from issuer',
        id: 'event.birth.custom.action.issue-vc.field.request-credential-offer-button.label'
      },
      configuration: {
        text: {
          defaultMessage: 'Generate',
          description: 'Button to request the credential offer from issuer',
          id: 'event.birth.custom.action.issue-vc.field.request-credential-offer-button.configuration.text'
        }
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('requester.type').isUndefined()),
            not(qrGenerated)
          )
        }
      ]
    },
    {
      id: 'get-credential-offer',
      parent: field('request-credential-offer-button'),
      type: FieldType.HTTP,
      label: {
        defaultMessage: 'Get Credential Offer',
        description: 'HTTP request to get the credential offer from the issuer',
        id: 'event.birth.custom.action.issue-vc.field.get-credential-offer.label'
      },
      configuration: {
        trigger: field('request-credential-offer-button'),
        url: CREDENTIAL_OFFER_HANDLER_URL,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: { pathname: window().location.get('pathname') },
        timeout: 10000
      }
    },
    {
      id: 'qr-code-explain-paragraph',
      parent: field('get-credential-offer'),
      type: FieldType.PARAGRAPH,
      label: {
        defaultMessage:
          'Scan the QR code below with your digital wallet to receive your Verifiable Credential.',
        description: 'Explanation for the QR code field',
        id: 'event.birth.custom.action.issue-vc.field.qr-code.configuration.text'
      },
      configuration: {
        styles: { hint: true, textAlign: 'center' }
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: qrGenerated
        }
      ]
    },
    {
      id: 'qr-code',
      parent: field('get-credential-offer'),
      type: FieldType.IMAGE_VIEW,
      label: {
        defaultMessage: 'QR Code',
        description: 'Upload the QR code image for the VC',
        id: 'event.birth.custom.action.issue-vc.field.qr-code.configuration.alt'
      },
      hideLabel: true,
      value: field('get-credential-offer').get('data.credential_offer_uri_qr'),
      configuration: {
        textAlign: 'center',
        width: '30%'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: qrGenerated
        }
      ]
    },
    {
      id: 'requester.acceptedVcOffer',
      parent: field('get-credential-offer'),
      type: FieldType.CHECKBOX,
      required: true,
      defaultValue: false,
      label: {
        defaultMessage:
          'I confirm that the citizen has accepted the verifiable credential offer',
        description:
          'Confirmation checkbox shown before issuing verifiable credential',
        id: 'event.birth.custom.action.issue-vc.field.accepted-vc-offer.label'
      },
      validation: [
        {
          message: {
            defaultMessage:
              'Please confirm that the citizen has accepted the verifiable credential offer',
            description: 'Validation for credential offer acceptance checkbox',
            id: 'event.birth.custom.action.issue-vc.field.accepted-vc-offer.error'
          },
          validator: field('requester.acceptedVcOffer').isEqualTo(true)
        }
      ],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: qrGenerated
        }
      ]
    }
  ]
} satisfies ActionConfig
