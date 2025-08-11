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

import { isArray, omitBy } from 'lodash'
import {
  ActionType,
  ActionUpdate,
  Draft,
  EventConfig,
  EventDocument,
  EventState,
  FieldConfig,
  FieldType,
  File,
  FileFieldWithOptionValue,
  FileUploadWithOptions,
  generateActionDocument,
  generateTranslationConfig,
  generateUuid,
  getUUID,
  SignatureField,
  TestUserRole,
  TokenUserType,
  UUID
} from '@opencrvs/commons'
import {
  TENNIS_CLUB_DECLARATION_REVIEW,
  tennisClubMembershipEvent
} from '@opencrvs/commons/fixtures'

import { getUnreferencedDraftFiles } from './utils'

function getMockEventConfig({
  declaration,
  annotation
}: {
  declaration?: FieldConfig[]
  annotation?: FieldConfig[]
}) {
  const onePageEvent = {
    ...tennisClubMembershipEvent,
    declaration: {
      ...tennisClubMembershipEvent.declaration,
      pages: [
        {
          ...tennisClubMembershipEvent.declaration.pages[0],
          fields: declaration ?? []
        }
      ]
    },
    actions: [
      {
        conditionals: [],
        type: ActionType.DECLARE,
        label: {
          defaultMessage: 'Send an application',
          description:
            'This is shown as the action name anywhere the user can trigger the action from',
          id: 'event.tennis-club-membership.action.declare.label'
        },
        review: { ...TENNIS_CLUB_DECLARATION_REVIEW, fields: annotation ?? [] }
      },
      {
        conditionals: [],
        type: ActionType.VALIDATE,
        label: {
          defaultMessage: 'Validate',
          description:
            'This is shown as the action name anywhere the user can trigger the action from',
          id: 'event.tennis-club-membership.action.validate.label'
        },
        review: { ...TENNIS_CLUB_DECLARATION_REVIEW, fields: annotation ?? [] }
      }
    ]
  } satisfies EventConfig

  return onePageEvent
}

function getEvent({
  configuration,
  declaration,
  annotation
}: {
  configuration: EventConfig
  declaration: ActionUpdate
  annotation: ActionUpdate
}) {
  const event = {
    trackingId: generateUuid(),
    type: configuration.id,
    actions: [
      generateActionDocument({ configuration, action: ActionType.CREATE }),
      generateActionDocument({
        configuration: configuration,
        action: ActionType.DECLARE,
        defaults: {
          createdByUserType: TokenUserType.Enum.system,
          createdBy: 'system',
          createdByRole: TestUserRole.Enum.FIELD_AGENT,
          declaration,
          annotation
        }
      })
    ],
    createdAt: new Date(Date.now()).toISOString(),
    id: generateUuid(),
    updatedAt: new Date(Date.now()).toISOString()
  } satisfies EventDocument

  return event
}

function generateEventDraftDocument({
  eventId,
  actionType,
  annotation,
  declaration,
  configuration
}: {
  eventId: UUID
  actionType: ActionType
  rng?: () => number
  declaration?: EventState
  annotation?: EventState
  configuration: EventConfig
}): Draft {
  const action = generateActionDocument({
    configuration,
    action: actionType
  })

  const actionMetadata = omitBy(action, ['annotation', 'declaration'])

  return {
    id: getUUID(),
    transactionId: getUUID(),
    // @ts-expect-error -- omit loses inference.
    action: {
      ...actionMetadata,
      declaration: declaration ?? {},
      annotation: annotation
    },
    createdAt: new Date().toISOString(),
    eventId
  }
}

const testCases = [
  {
    property: 'annotation',
    fieldType: FieldType.FILE
  },
  {
    property: 'annotation',
    fieldType: FieldType.FILE_WITH_OPTIONS
  },
  {
    property: 'annotation',
    fieldType: FieldType.SIGNATURE
  },
  {
    property: 'declaration',
    fieldType: FieldType.FILE
  },
  {
    property: 'declaration',
    fieldType: FieldType.FILE_WITH_OPTIONS
  },
  {
    property: 'declaration',
    fieldType: FieldType.SIGNATURE
  }
] as const

describe('getUnreferencedDraftFiles', () => {
  const fileConfig = {
    configuration: {
      maxFileSize: 1000000
    },
    id: 'applicant.image',
    type: FieldType.FILE,
    label: generateTranslationConfig('image'),
    required: true
  } satisfies File

  const fileWithOptionConfig = {
    configuration: {
      maxFileSize: 1000000
    },
    id: 'applicant.file-with-options',
    type: FieldType.FILE_WITH_OPTIONS,
    label: generateTranslationConfig('file with options'),
    required: true,
    options: [
      {
        value: 'option-1',
        label: generateTranslationConfig('file with options 1')
      },
      {
        value: 'option-2',
        label: generateTranslationConfig('file with options 2')
      }
    ]
  } satisfies FileUploadWithOptions

  const signatureConfig = {
    configuration: {
      maxFileSize: 1000000
    },
    id: 'applicant.signature',
    type: FieldType.SIGNATURE,
    label: generateTranslationConfig('signature'),
    required: true,
    signaturePromptLabel: generateTranslationConfig('signature prompt')
  } satisfies SignatureField

  const fileTypeConfigs = {
    [FieldType.FILE]: fileConfig,
    [FieldType.FILE_WITH_OPTIONS]: fileWithOptionConfig,
    [FieldType.SIGNATURE]: signatureConfig
  }

  const filesByType = {
    [FieldType.FILE]: {
      original: {
        [fileConfig.id]: {
          path: `/ocrvs/non-draft-image-${FieldType.FILE}.jpg`,
          type: 'image/jpeg',
          originalFilename: 'random-2.jpg'
        }
      },
      previous: {
        [fileConfig.id]: {
          originalFilename: 'abcd.png',
          path: `/ocrvs/previous-draft-image-${FieldType.FILE}.png`,
          type: 'image/png'
        }
      },
      current: {
        [fileConfig.id]: {
          originalFilename: 'abcde.png',
          path: `/ocrvs/current-draft-image-${FieldType.FILE}.png`,
          type: 'image/png'
        }
      }
    },
    [FieldType.FILE_WITH_OPTIONS]: {
      original: {
        [fileWithOptionConfig.id]: [
          {
            option: 'option-1',
            path: `/ocrvs/non-draft-image-${FieldType.FILE_WITH_OPTIONS}.jpg`,
            type: 'image/jpeg',
            originalFilename: 'random-2.jpg'
          }
        ] satisfies FileFieldWithOptionValue
      },
      previous: {
        [fileWithOptionConfig.id]: [
          {
            originalFilename: 'abcd.png',
            path: `/ocrvs/previous-draft-image-${FieldType.FILE_WITH_OPTIONS}.png`,
            type: 'image/png',
            option: 'option-1'
          }
        ] satisfies FileFieldWithOptionValue
      },
      current: {
        [fileWithOptionConfig.id]: [
          {
            originalFilename: 'abcde.png',
            path: `/ocrvs/current-draft-image-${FieldType.FILE_WITH_OPTIONS}.png`,
            type: 'image/png',
            option: 'option-1'
          }
        ] satisfies FileFieldWithOptionValue
      }
    },
    [FieldType.SIGNATURE]: {
      original: {
        [signatureConfig.id]: {
          path: `/ocrvs/non-draft-image-${FieldType.SIGNATURE}.jpg`,
          type: 'image/jpeg',
          originalFilename: 'random-2.jpg'
        }
      },
      previous: {
        [signatureConfig.id]: {
          originalFilename: 'abcd.png',
          path: `/ocrvs/previous-draft-image-${FieldType.SIGNATURE}.png`,
          type: 'image/png'
        }
      },
      current: {
        [signatureConfig.id]: {
          originalFilename: 'abcde.png',
          path: `/ocrvs/current-draft-image-${FieldType.SIGNATURE}.png`,
          type: 'image/png'
        }
      }
    }
  }

  test.each(testCases)(
    `returns unreferenced file from $property when field type is $fieldType`,
    ({ property, fieldType }) => {
      const configProps =
        property === 'declaration'
          ? { declaration: [fileTypeConfigs[fieldType]] }
          : { annotation: [fileTypeConfigs[fieldType]] }
      const mockConfig = getMockEventConfig(configProps)

      // 1. Create event with one file in declaration. We want to ensure if someone updates the function, it will not delete already declared files.
      const mockEvent = getEvent({
        configuration: mockConfig,
        declaration:
          property === 'declaration' ? filesByType[fieldType].original : {},
        annotation:
          property === 'annotation' ? filesByType[fieldType].original : {}
      })

      // 2. create pair of drafts with different files of the same type.
      const currentDraft = generateEventDraftDocument({
        actionType: ActionType.VALIDATE,
        eventId: mockEvent.id,
        declaration:
          property === 'declaration' ? filesByType[fieldType].current : {},
        annotation:
          property === 'annotation' ? filesByType[fieldType].current : {},
        configuration: mockConfig
      })

      const previousDraft = generateEventDraftDocument({
        actionType: ActionType.VALIDATE,
        eventId: mockEvent.id,
        declaration:
          property === 'declaration' ? filesByType[fieldType].previous : {},
        annotation:
          property === 'annotation' ? filesByType[fieldType].previous : {},
        configuration: mockConfig
      })

      const unreferencedFiles = getUnreferencedDraftFiles({
        event: mockEvent,
        configuration: mockConfig,
        currentDraft,
        previousDraft
      })

      // 3. Make sure the previous draft file is returned.
      const [expectedFile] = Object.entries(
        filesByType[fieldType].previous
      ).map(([key, value]) => ({
        id: key,
        value: isArray(value) ? value[0].path : value.path
      }))

      expect(unreferencedFiles).toHaveLength(1)
      expect(unreferencedFiles[0]).toEqual(expectedFile)
    }
  )

  test('Removes multiple draft files of different type from declaration', () => {
    const mockConfig = getMockEventConfig({
      declaration: [fileConfig, fileWithOptionConfig, signatureConfig]
    })

    // 1. Create event with one file in declaration. We want to ensure if someone updates the function, it will not delete already declared files.
    const mockEvent = getEvent({
      configuration: mockConfig,
      declaration: {
        ...filesByType[FieldType.FILE].original,
        ...filesByType[FieldType.FILE_WITH_OPTIONS].original,
        ...filesByType[FieldType.SIGNATURE].original
      },
      annotation: {}
    })

    const currentDraft = generateEventDraftDocument({
      actionType: ActionType.VALIDATE,
      eventId: mockEvent.id,
      declaration: {},
      configuration: mockConfig,
      annotation: {}
    })

    const previousDraftDeclaration = {
      ...filesByType[FieldType.FILE].previous,
      ...filesByType[FieldType.FILE_WITH_OPTIONS].previous,
      ...filesByType[FieldType.SIGNATURE].previous
    }

    const previousDraft = generateEventDraftDocument({
      actionType: ActionType.VALIDATE,
      eventId: mockEvent.id,
      configuration: mockConfig,
      declaration: previousDraftDeclaration
    })

    const unreferencedFiles = getUnreferencedDraftFiles({
      event: mockEvent,
      configuration: mockConfig,
      currentDraft,
      previousDraft
    })

    const expectedFiles = Object.entries(previousDraftDeclaration).map(
      ([key, value]) => ({
        id: key,
        value: isArray(value) ? value[0].path : value.path
      })
    )

    expect(unreferencedFiles).toEqual(expectedFiles)
  })

  test('Does not mark files unreferenced if they are referenced in event actions', () => {
    const mockConfig = getMockEventConfig({
      declaration: [fileConfig, fileWithOptionConfig, signatureConfig]
    })

    const nonDraftDeclaration = {
      ...filesByType[FieldType.FILE].original,
      ...filesByType[FieldType.FILE_WITH_OPTIONS].original,
      ...filesByType[FieldType.SIGNATURE].original
    }

    const mockEvent = getEvent({
      configuration: mockConfig,
      declaration: nonDraftDeclaration,
      annotation: {}
    })

    const currentDraft = generateEventDraftDocument({
      actionType: ActionType.VALIDATE,
      eventId: mockEvent.id,
      // NOTE: Even if declaration is empty, i should not delete the files in referenced in previous declaration as long as they are referenced in the actual event actions.
      declaration: {},
      configuration: mockConfig,
      annotation: {}
    })

    const previousDraft = generateEventDraftDocument({
      actionType: ActionType.VALIDATE,
      eventId: mockEvent.id,
      configuration: mockConfig,
      // NOTE: A previous draft included the whole payload of the actual declaration.
      declaration: nonDraftDeclaration
    })

    const unreferencedFiles = getUnreferencedDraftFiles({
      event: mockEvent,
      configuration: mockConfig,
      currentDraft,
      previousDraft
    })

    expect(unreferencedFiles).toEqual([])
  })

  // In general this situation should not happen through the client.
  test('Does not remove annotation drafts when the action type is different', () => {
    const mockConfig = getMockEventConfig({
      annotation: [fileConfig, fileWithOptionConfig, signatureConfig]
    })

    const mockEvent = getEvent({
      configuration: mockConfig,
      declaration: {},
      annotation: {
        ...filesByType[FieldType.FILE].original,
        ...filesByType[FieldType.FILE_WITH_OPTIONS].original,
        ...filesByType[FieldType.SIGNATURE].original
      }
    })

    const currentDraft = generateEventDraftDocument({
      actionType: ActionType.VALIDATE,
      eventId: mockEvent.id,
      configuration: mockConfig,
      annotation: {
        ...filesByType[FieldType.FILE].current,
        ...filesByType[FieldType.FILE_WITH_OPTIONS].current,
        ...filesByType[FieldType.SIGNATURE].current
      }
    })

    const previousDraft = generateEventDraftDocument({
      actionType: ActionType.DECLARE,
      eventId: mockEvent.id,
      configuration: mockConfig,
      annotation: {
        ...filesByType[FieldType.FILE].previous,
        ...filesByType[FieldType.FILE_WITH_OPTIONS].previous,
        ...filesByType[FieldType.SIGNATURE].previous
      }
    })

    const unreferencedFiles = getUnreferencedDraftFiles({
      event: mockEvent,
      configuration: mockConfig,
      currentDraft,
      previousDraft
    })

    expect(unreferencedFiles).toEqual([])
  })
})
