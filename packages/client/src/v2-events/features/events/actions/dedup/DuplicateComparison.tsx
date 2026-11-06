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
import React from 'react'
import styled from 'styled-components'
import { useIntl } from 'react-intl'
import {
  DeclarationFormConfig,
  EventDocument,
  EventIndex,
  EventState,
  FieldConfig,
  FieldType,
  FieldTypesToHideInReview,
  getDeclaration,
  getDeclarationFields,
  getDeclarationPages,
  isFieldDisplayedOnReview,
  isPageVisible,
  PlainDate,
  resolveVersion,
  toPlainDate,
  todayISO,
  UUID
} from '@opencrvs/commons/client'
import {
  Content,
  ContentSize,
  FullBodyContent,
  List,
  Stack,
  Text
} from '@opencrvs/components'
import { summaryMessages } from '@client/v2-events/features/workqueues/EventOverview/components/EventSummary'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import {
  flattenEventIndex,
  getUsersFullName,
  recordAnchorDate
} from '@client/v2-events/utils'
import { useUsers } from '@client/v2-events/hooks/useUsers'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import { useAdministrativeAreas } from '@client/v2-events/hooks/useAdministrativeAreas'
import { useEventConfigurationForRecord } from '../../useEventConfiguration'
import { Output, ValueOutput } from '../../components/Output'
import { DocumentViewer } from '../../components/DocumentViewer'
import { duplicateMessages } from './ReviewDuplicate'

const SupportingDocumentWrapper = styled(Stack)`
  position: sticky;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    flex-direction: column;
    align-items: flex-start;
  }
`

const MobileOnly = styled.div`
  display: none;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: block;
  }
`

const DocWrapper = styled.div`
  padding: 8px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};
`

interface ComparisonDeclaration {
  title: React.ReactNode | string
  data: {
    label: React.ReactNode

    rightValue: React.ReactNode
    leftValue: React.ReactNode
  }[]
}

function SupportingDocumentList({
  declaration,
  declarationConfig
}: {
  declaration: EventState
  declarationConfig: DeclarationFormConfig
}) {
  return declarationConfig.pages
    .flatMap(({ fields }) => fields)
    .filter(
      (field) =>
        field.type === FieldType.FILE ||
        field.type === FieldType.FILE_WITH_OPTIONS
    )
    .filter(({ id }) => declaration[id])
    .map((field) => (
      <DocWrapper key={field.id}>
        {ValueOutput({
          // File fields only — no location is rendered, so today's anchor is
          // inert here.
          anchor: todayISO(),
          config: field,
          value: declaration[field.id]
        })}
      </DocWrapper>
    ))
}

function UserFullName({ userId }: { userId: string }) {
  const intl = useIntl()
  const users = useUsers()

  const user = users.getUsers.useQueryById(userId).data
  if (!user) {
    return null
  }
  return getUsersFullName(user.name)
}

function RegisteredAtOfficeName({
  id,
  anchor
}: {
  id?: UUID
  anchor: PlainDate
}) {
  const { getLocations } = useLocations()
  const { getAdministrativeAreas } = useAdministrativeAreas()

  const locations = getLocations.useSuspenseQuery()
  const administrativeAreas = getAdministrativeAreas.useSuspenseQuery()

  // The registered-at office renders under the name it carried on the date the
  // record was registered.
  const versions = id
    ? (locations.get(id)?.versions ?? administrativeAreas.get(id)?.versions)
    : undefined

  return versions ? resolveVersion(versions, anchor).name : null
}

const hideFieldTypes = [
  ...FieldTypesToHideInReview,
  FieldType.FILE,
  FieldType.FILE_WITH_OPTIONS
]

/**
 * One column of the comparison. Each record renders with the configuration
 * version it was created under.
 */
function useComparisonSide(event: EventDocument, eventState: EventIndex) {
  const validatorContext = useValidatorContext(event)
  const { eventConfiguration } = useEventConfigurationForRecord(eventState)
  const declaration = eventState.declaration
  const pages = getDeclarationPages(eventConfiguration)
  const fieldsById = new Map(
    getDeclarationFields(eventConfiguration).map((field) => [field.id, field])
  )
  // Declaration fields render at the record's own anchor: the date of event,
  // or the date that the record was created.
  const anchor = recordAnchorDate(eventState)

  function isPageShown(pageId: string) {
    const page = pages.find(({ id }) => id === pageId)
    return page ? isPageVisible(page, declaration, validatorContext) : false
  }

  function isFieldShown(fieldId: string) {
    const field = fieldsById.get(fieldId)
    return field
      ? isFieldDisplayedOnReview(field, declaration, validatorContext)
      : false
  }

  /**
   * Renders the value of one comparison cell. Fields that share a label, such
   * as the location field and the address field of the place of birth, are
   * one row. The field that the declaration shows gives the value. When this
   * version has none of the fields, the cell stays empty.
   */
  function renderValue(rowFields: FieldConfig[]) {
    const candidates = rowFields.flatMap(({ id }) => fieldsById.get(id) ?? [])
    const field =
      candidates.find((candidate) =>
        isFieldDisplayedOnReview(candidate, declaration, validatorContext)
      ) ?? candidates.at(0)

    return field ? (
      <Output
        anchor={anchor}
        displayEmptyAsDash={true}
        eventConfig={eventConfiguration}
        field={field}
        formConfig={getDeclaration(eventConfiguration)}
        previousForm={declaration}
        value={declaration[field.id]}
      />
    ) : null
  }

  return {
    declaration,
    eventConfiguration,
    pages,
    fieldsById,
    flattened: flattenEventIndex(eventState),
    // The registered-at office renders at the record's registration date, or
    // at today when the record is not registered.
    registrationAnchor: eventState.legalStatuses.REGISTERED
      ? toPlainDate(eventState.legalStatuses.REGISTERED.createdAt)
      : todayISO(),
    isPageShown,
    isFieldShown,
    renderValue
  }
}

export function DuplicateComparison({
  originalEvent,
  potentialDuplicateEvent,
  originalEventState,
  potentialDuplicateEventState
}: {
  originalEvent: EventDocument
  potentialDuplicateEvent: EventDocument
  originalEventState: EventIndex
  potentialDuplicateEventState: EventIndex
}) {
  const intl = useIntl()
  const flattenedIntl = useIntlFormatMessageWithFlattenedParams()
  const original = useComparisonSide(originalEvent, originalEventState)
  const potentialDuplicate = useComparisonSide(
    potentialDuplicateEvent,
    potentialDuplicateEventState
  )

  // Pages and fields from both versions(original and porential duplicate)
  // The version pinned by original wins on page title, order and label
  const unionPages = [
    ...original.pages,
    ...potentialDuplicate.pages.filter(
      ({ id }) => !original.pages.some((page) => page.id === id)
    )
  ].map((page) => ({
    id: page.id,
    title: page.title,
    fields: [
      ...(original.pages.find(({ id }) => id === page.id)?.fields ?? []),
      ...(
        potentialDuplicate.pages.find(({ id }) => id === page.id)?.fields ?? []
      ).filter(({ id }) => !original.fieldsById.has(id))
    ]
  }))

  const comparisonData: ComparisonDeclaration[] = unionPages
    .filter(
      ({ id }) => original.isPageShown(id) || potentialDuplicate.isPageShown(id)
    )
    .map((page) => ({
      title: intl.formatMessage(page.title),
      data: page.fields
        .filter(
          ({ id }) =>
            original.isFieldShown(id) || potentialDuplicate.isFieldShown(id)
        )
        .filter(
          ({ type }) =>
            !hideFieldTypes.some((typeToHide) => type === typeToHide)
        )
        // Group fields by label.id, preserving form order. Multiple fields
        // can share the same label (e.g. "child.birthLocation" /
        // "child.birthLocation.privateHome" / "child.birthLocation.other"
        // all map to "Location of birth"). We render one row per unique
        // label and each side picks its active field.
        .reduce<Array<{ labelId: string; fields: FieldConfig[] }>>(
          (acc, field) => {
            const existing = acc.find((g) => g.labelId === field.label.id)

            // If the field already exists, add it to the existing group
            if (existing) {
              existing.fields.push(field)
            } else {
              // If the field does not exist, create a new group for it
              acc.push({ labelId: field.label.id, fields: [field] })
            }
            return acc
          },
          []
        )
        .map(({ fields }) => ({
          label: intl.formatMessage(fields[0].label),
          leftValue: original.renderValue(fields),
          rightValue: potentialDuplicate.renderValue(fields)
        }))
    }))
    .filter(({ data }) => data.length > 0)

  const declarationDetailsComparison: ComparisonDeclaration = {
    title: intl.formatMessage(duplicateMessages.duplicateDeclarationDetails),
    data: [
      {
        label: intl.formatMessage(summaryMessages.status.label),
        rightValue: flattenedIntl.formatMessage(summaryMessages.status.value, {
          'event.status': potentialDuplicateEventState.status
        }),
        leftValue: flattenedIntl.formatMessage(summaryMessages.status.value, {
          'event.status': originalEventState.status
        })
      },
      {
        label: intl.formatMessage(summaryMessages.event.label),
        rightValue: intl.formatMessage(original.eventConfiguration.label),
        leftValue: intl.formatMessage(original.eventConfiguration.label)
      },
      {
        label: intl.formatMessage(summaryMessages.trackingId.label),
        rightValue: flattenedIntl.formatMessage(
          summaryMessages.trackingId.value,
          {
            'event.trackingId': potentialDuplicateEventState.trackingId
          }
        ),
        leftValue: flattenedIntl.formatMessage(
          summaryMessages.trackingId.value,
          {
            'event.trackingId': originalEventState.trackingId
          }
        )
      },
      {
        label: intl.formatMessage(summaryMessages.registrationNumber.label),
        rightValue: flattenedIntl.formatMessage(
          summaryMessages.registrationNumber.value,
          potentialDuplicate.flattened
        ),
        leftValue: flattenedIntl.formatMessage(
          summaryMessages.registrationNumber.value,
          original.flattened
        )
      },
      {
        label: intl.formatMessage(duplicateMessages.registeredAt),
        rightValue: potentialDuplicate.flattened['event.registeredAt'] ? (
          <RegisteredAtOfficeName
            anchor={potentialDuplicate.registrationAnchor}
            id={potentialDuplicate.flattened['event.registeredAt']}
          />
        ) : null,
        leftValue: original.flattened['event.registeredAt'] ? (
          <RegisteredAtOfficeName
            anchor={original.registrationAnchor}
            id={original.flattened['event.registeredAt']}
          />
        ) : null
      },
      {
        label: intl.formatMessage(duplicateMessages.registeredBy),
        rightValue: potentialDuplicate.flattened['event.registeredBy'] ? (
          <UserFullName
            userId={potentialDuplicate.flattened['event.registeredBy']}
          />
        ) : null,
        leftValue: original.flattened['event.registeredBy'] ? (
          <UserFullName userId={original.flattened['event.registeredBy']} />
        ) : null
      }
    ]
  }

  comparisonData.unshift(declarationDetailsComparison)

  return (
    <FullBodyContent>
      <div>
        <Content
          showTitleOnMobile
          size={ContentSize.LARGE}
          title={intl.formatMessage(
            duplicateMessages.duplicateComparePageTitle,
            {
              actualTrackingId: (
                <Text color="negative" element="span" variant="bold18">
                  {originalEventState.trackingId}
                </Text>
              ),
              duplicateTrackingId: potentialDuplicateEventState.trackingId
            }
          )}
        >
          <Stack alignItems={'stretch'} direction="column" gap={20}>
            {comparisonData.map((sections, index) => {
              return (
                <div key={`comparison-div-${index}`}>
                  <Text color="grey600" element="span" variant="bold18">
                    {sections.title}
                  </Text>
                  <List key={`comparison-${index}`}>
                    <List.Header
                      value={
                        <Text color="negative" element="span" variant="reg16">
                          {originalEventState.trackingId}
                        </Text>
                      }
                      value2={
                        <Text color="grey600" element="span" variant="reg16">
                          {potentialDuplicateEventState.trackingId}
                        </Text>
                      }
                    />
                    {sections.data.map((item, id) => (
                      <List.Item
                        key={`row-${id}`}
                        label={item.label}
                        value={item.leftValue}
                        value2={item.rightValue}
                      />
                    ))}
                  </List>
                </div>
              )
            })}
          </Stack>
        </Content>
      </div>
      <div>
        <Content
          showTitleOnMobile
          size={ContentSize.LARGE}
          title={intl.formatMessage(
            duplicateMessages.duplicateComparePageSupportingDocuments
          )}
        >
          <SupportingDocumentWrapper gap={25} justifyContent={'space-between'}>
            <div style={{ flex: 1 }}>
              <Text color="redDark" element="p" variant="bold14">
                {originalEventState.trackingId}
              </Text>
              <DocumentViewer
                comparisonView={true}
                form={original.declaration}
                formConfig={getDeclaration(original.eventConfiguration)}
                showInMobile={false}
              />
              <MobileOnly>
                <SupportingDocumentList
                  declaration={original.declaration}
                  declarationConfig={getDeclaration(
                    original.eventConfiguration
                  )}
                />
              </MobileOnly>
            </div>
            <div style={{ flex: 1 }}>
              <Text color="grey400" element="p" variant="bold14">
                {potentialDuplicateEventState.trackingId}
              </Text>
              <DocumentViewer
                comparisonView={true}
                form={potentialDuplicate.declaration}
                formConfig={getDeclaration(
                  potentialDuplicate.eventConfiguration
                )}
                showInMobile={false}
              />
              <MobileOnly>
                <SupportingDocumentList
                  declaration={potentialDuplicate.declaration}
                  declarationConfig={getDeclaration(
                    potentialDuplicate.eventConfiguration
                  )}
                />
              </MobileOnly>
            </div>
          </SupportingDocumentWrapper>
        </Content>
      </div>
    </FullBodyContent>
  )
}
