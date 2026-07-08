import {
  MOSIP_API_USERINFO_URL,
  OPENID_PROVIDER_CLIENT_ID,
  ESIGNET_REDIRECT_URL
} from '@countryconfig/constants'
import { logger } from '@countryconfig/logger'
import {
  FieldConditional,
  and,
  FieldConfigInput,
  field,
  ConditionalType,
  FieldType,
  not,
  never,
  or,
  FieldReference,
  window
} from '@opencrvs/toolkit/events'
import { addYears, isAfter } from 'date-fns'

const CHILD_MAX_AGE_YEARS_FOR_MOSIP = 10

interface HttpFetchValue {
  data?: { sub?: string }
}

export function getBirthInformantSection(informantRelation?: string): string {
  return (
    {
      MOTHER: 'mother',
      FATHER: 'father'
    }[informantRelation ?? ''] ?? 'informant'
  )
}

export function getInformantPsut(
  declaration: Record<string, any>,
  section: string
): string | undefined {
  return (declaration[`${section}.verify-nid-http-fetch`] as HttpFetchValue)
    ?.data?.sub
}

const upsertConditional = (
  conditionals: FieldConditional[],
  newConditional: FieldConditional
): FieldConditional[] => {
  const existingIndex = conditionals.findIndex(
    (c) => c.type === newConditional.type
  )

  if (existingIndex !== -1) {
    return conditionals.map((c, i) =>
      i === existingIndex
        ? {
            ...c,
            conditional: and(c.conditional, newConditional.conditional)
          }
        : c
    )
  }

  return [...conditionals, newConditional]
}

export const connectToMOSIPIdReader = (
  { parent, ...fieldInput }: FieldConfigInput & { parent?: FieldReference },
  {
    valuePath,
    disableIf,
    hideIf,
    additionalValueSources = []
  }: {
    valuePath: string
    disableIf?: string[]
    hideIf?: string[]
    // Used by BRN lookup
    additionalValueSources?: FieldReference[]
  }
): FieldConfigInput => {
  const page = fieldInput.id.split('.')[0]

  return connectToMOSIPVerificationStatus(
    {
      parent: [
        field(`${page}.id-reader`),
        field(`${page}.verify-nid-http-fetch`),
        ...(parent ? [parent] : [])
      ],
      ...fieldInput,
      value: [
        field(`${page}.verify-nid-http-fetch`).get(valuePath),
        field(`${page}.id-reader`).get(valuePath),
        ...additionalValueSources
      ]
    },
    { hideIf, disableIf }
  )
}

export const getMOSIPIntegrationFields = (
  page: string,
  {
    existingConditionals,
    esignet = true
  }: { existingConditionals: FieldConditional[]; esignet?: boolean }
): FieldConfigInput[] => {
  const existingShowConditional = existingConditionals.find(
    (c) => c.type === ConditionalType.SHOW
  )
  return [
    /*
     * @opencrvs/mosip: MOSIP / E-Signet
     */
    {
      id: `${page}.verified`,
      type: FieldType.VERIFICATION_STATUS,
      parent: [
        field(`${page}.verify-nid-http-fetch`),
        field(`${page}.id-reader`)
      ],
      label: {
        id: `${page}.verified.status`,
        defaultMessage: 'Identity status',
        description: 'The title for the status field label'
      },
      configuration: {
        status: {
          id: 'verified.status.text',
          defaultMessage:
            '{value, select, authenticated {ID Authenticated} verified {ID Verified} failed {Unverified ID} pending {Pending verification} other {Invalid value}}',
          description:
            'Status text shown on the pill on both form declaration and review page'
        },
        description: {
          id: 'verified.status.description',
          defaultMessage:
            "{value, select, authenticated {This identity has been successfully authenticated with the Farajaland’s National ID System. To make edits, please remove the authentication first.} verified {This identity data has been successfully verified with the Farajaland’s National ID System. Please note that their identity has not been authenticated using the individual's biometrics. To make edits, please remove the verification first.} pending {Identity pending verification with Farajaland’s National ID system} failed {The identity data does not match an entry in Farajaland’s National ID System} other {Invalid value}}",
          description: 'Description text of the status'
        }
      },
      conditionals: existingConditionals,
      value: [
        field(`${page}.verify-nid-http-fetch`).get('data.verificationStatus'),
        field(`${page}.id-reader`).get('data.verificationStatus')
      ]
    },
    ...(esignet
      ? ([
          /*
           * @opencrvs/mosip: MOSIP / E-Signet
           */
          {
            id: `${page}.query-params`,
            type: FieldType.QUERY_PARAM_READER,
            conditionals: [
              {
                type: ConditionalType.DISPLAY_ON_REVIEW,
                conditional: never()
              }
            ],
            label: {
              id: 'form.query-params.label',
              defaultMessage: 'Query param reader',
              description:
                'This is the label for the query param reader field - usually this is hidden'
            },
            configuration: {
              pickParams: ['code', 'state']
            }
          },

          /*
           * @opencrvs/mosip: MOSIP / E-Signet
           */
          {
            id: `${page}.verify-nid-http-fetch`,
            type: FieldType.HTTP,
            conditionals: [
              {
                type: ConditionalType.DISPLAY_ON_REVIEW,
                conditional: never()
              }
            ],
            label: {
              defaultMessage: 'Fetch applicant information',
              description: 'Fetch applicant information',
              id: 'applicant.http-fetch.label'
            },
            configuration: {
              trigger: field(`${page}.query-params`),
              url: MOSIP_API_USERINFO_URL,
              timeout: 5000,
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: {
                clientId: OPENID_PROVIDER_CLIENT_ID,
                redirectUri: window().location.get('href')
              },
              params: {
                code: field(`${page}.query-params`).get('data.code'),
                state: field(`${page}.query-params`).get('data.state')
              },
              errorValue: {
                verificationStatus: 'failed'
              }
            }
          },

          /*
           * @opencrvs/mosip: MOSIP / E-Signet
           */
          {
            id: `${page}.fetch-loader`,
            type: FieldType.LOADER,
            parent: field(`${page}.verify-nid-http-fetch`),
            variant: 'highlighted',
            hideLabel: false,
            conditionals: [
              {
                type: ConditionalType.SHOW,
                conditional: not(
                  field(`${page}.verify-nid-http-fetch`)
                    .get('loading')
                    .isFalsy()
                )
              },
              {
                type: ConditionalType.DISPLAY_ON_REVIEW,
                conditional: never()
              }
            ],
            label: {
              id: 'form.fetch-loader.label',
              defaultMessage: 'Identity status',
              description:
                'This is the label for the fetch individual information loader'
            },
            configuration: {
              text: {
                id: 'form.fetch-loader.label',
                defaultMessage: "Fetching the person's data from E-Signet",
                description:
                  'This is the label for the fetch individual information loader'
              }
            }
          }
        ] satisfies FieldConfigInput[])
      : []),
    /*
     * @opencrvs/mosip: MOSIP / E-Signet
     */
    {
      id: `${page}.id-reader`,
      type: FieldType.ID_READER,
      required: false,
      label: {
        defaultMessage: 'Identity status',
        description: 'Label for ID Reader field',
        id: `event.birth.action.declare.form.section.${page}.field.qr.label`
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: existingShowConditional?.conditional
            ? and(
                existingShowConditional?.conditional,
                field(`${page}.verify-nid-http-fetch`).get('loading').isFalsy(),
                not(
                  or(
                    field(`${page}.verified`).isEqualTo('pending'),
                    field(`${page}.verified`).isEqualTo('verified'),
                    field(`${page}.verified`).isEqualTo('authenticated'),
                    field(`${page}.verified`).isEqualTo('failed')
                  )
                )
              )
            : and(
                field(`${page}.verify-nid-http-fetch`).get('loading').isFalsy(),
                not(
                  or(
                    field(`${page}.verified`).isEqualTo('pending'),
                    field(`${page}.verified`).isEqualTo('verified'),
                    field(`${page}.verified`).isEqualTo('authenticated'),
                    field(`${page}.verified`).isEqualTo('failed')
                  )
                )
              )
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
      ],
      methods: [
        ...(esignet
          ? [
              {
                id: `${page}.verify`,
                type: FieldType.LINK_BUTTON,
                label: {
                  id: 'verify.label',
                  defaultMessage: 'Authenticate',
                  description: 'The title for the E-Signet verification button'
                },
                configuration: {
                  icon: 'Fingerprint',
                  url: `${ESIGNET_REDIRECT_URL}?client_id=${OPENID_PROVIDER_CLIENT_ID}&response_type=code&scope=openid%20profile&acr_values=mosip%3Aidp%3Aacr%3Agenerated-code&claims=%7B%22userinfo%22%3A%7B%22name%22%3A%7B%22essential%22%3Atrue%7D%2C%22birthdate%22%3A%7B%22essential%22%3Atrue%7D%2C%22address%22%3A%7B%22essential%22%3Atrue%7D%7D%2C%22id_token%22%3A%7B%7D%7D`,
                  text: {
                    id: 'verify.label',
                    defaultMessage: 'Authenticate with National ID system',
                    description:
                      'The title for the E-Signet verification button'
                  }
                }
              }
            ]
          : []),
        {
          type: FieldType.QR_READER,
          label: {
            id: `event.birth.action.declare.form.section.${page}.field.qr.label`,
            defaultMessage: 'Scan QR code',
            description: 'This is the label for the field'
          },
          id: `${page}.id-reader`
        }
      ]
    }
  ]
}

export const connectToMOSIPVerificationStatus = (
  fieldInput: FieldConfigInput,
  {
    hideIf,
    disableIf
  }: {
    hideIf?: string[]
    disableIf?: string[]
  }
): FieldConfigInput => {
  const page = fieldInput.id.split('.')[0]
  let updatedConditionals = fieldInput.conditionals || []

  if (Array.isArray(hideIf) && hideIf.length > 0) {
    const hideConditional = {
      type: ConditionalType.SHOW,
      conditional: not(
        hideIf.reduce(
          (acc, status) => or(acc, field(`${page}.verified`).isEqualTo(status)),
          never()
        )
      )
    }
    updatedConditionals = upsertConditional(
      updatedConditionals,
      hideConditional
    )
  }

  if (Array.isArray(disableIf) && disableIf.length > 0) {
    const disableConditional = {
      type: ConditionalType.ENABLE,
      conditional: not(
        disableIf.reduce(
          (acc, status) => or(acc, field(`${page}.verified`).isEqualTo(status)),
          never()
        )
      )
    }
    updatedConditionals = upsertConditional(
      updatedConditionals,
      disableConditional
    )
  }

  return {
    ...fieldInput,
    conditionals: updatedConditionals
  }
}

/**
 * Determines whether the birth registration should be forwarded to MOSIP.
 * @param declaration The declaration object containing event data.
 * @returns True if the registration should be forwarded, false otherwise.
 */
export function shouldForwardBirthRegistrationToMosip(
  declaration: Record<string, any>
): boolean {
  logger.info('Evaluating whether to forward birth registration to MOSIP...')
  if (declaration['child.dob'] === undefined) {
    logger.info('Missing child.dob in declaration, cannot forward to MOSIP')
    return false
  }
  if (
    declaration['mother.verified'] !== 'verified' &&
    declaration['mother.verified'] !== 'authenticated' &&
    declaration['father.verified'] !== 'verified' &&
    declaration['father.verified'] !== 'authenticated' &&
    declaration['informant.verified'] !== 'verified' &&
    declaration['informant.verified'] !== 'authenticated'
  ) {
    logger.info(
      'Neither mother, father nor informant is verified or authenticated, cannot forward to MOSIP'
    )
    return false
  }

  const mosipEligibilityExpiryDate = addYears(
    new Date(declaration['child.dob']),
    CHILD_MAX_AGE_YEARS_FOR_MOSIP
  )

  return !isAfter(Date.now(), mosipEligibilityExpiryDate)
}

/**
 * Determines whether the death registration should be forwarded to MOSIP.
 * @param declaration The declaration object containing event data.
 * @returns True if the registration should be forwarded, false otherwise.
 */
export function shouldForwardDeathRegistrationToMosip(
  declaration: Record<string, any>
): boolean {
  const informantRelation = declaration['informant.relation']
  if (informantRelation === 'SPOUSE')
    return (
      declaration['spouse.verified'] === 'verified' ||
      declaration['spouse.verified'] === 'authenticated'
    )
  return (
    declaration['informant.verified'] === 'verified' ||
    declaration['informant.verified'] === 'authenticated'
  )
}
