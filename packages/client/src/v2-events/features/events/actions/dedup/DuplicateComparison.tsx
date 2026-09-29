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
  getDeclarationPages,
  isFieldDisplayedOnReview,
  isPageVisible,
  PlainDate,
  resolveVersion,
  toPlainDate,
  todayISO,
  UUID,
  ValidatorContext
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
import { useEventConfiguration } from '../../useEventConfiguration'
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
  const validatorContextOfOriginalEvent = useValidatorContext(originalEvent)
  const validatorContextOfPotentialDuplicateEvent = useValidatorContext(
    potentialDuplicateEvent
  )

  const flattenedIntl = useIntlFormatMessageWithFlattenedParams()
  const { eventConfiguration } = useEventConfiguration(originalEventState.type)

  const flattenedPotentialDuplicateEvent = flattenEventIndex(
    potentialDuplicateEventState
  )
  const flattenedOriginalEvent = flattenEventIndex(originalEventState)

  const originalDeclaration = originalEventState.declaration
  const potentialDuplicateDeclaration = potentialDuplicateEventState.declaration

  // Each side's declaration fields render at that record's own anchor —
  // date of event, falling back to the record's creation date.
  const originalAnchor = recordAnchorDate(originalEventState)
  const potentialDuplicateAnchor = recordAnchorDate(
    potentialDuplicateEventState
  )

  // The registered-at office renders at each record's registration date, per
  // the per-fact anchoring rule. Falls back to today when unregistered.
  const originalRegistrationAnchor =
    (originalEventState.legalStatuses.REGISTERED
      ? toPlainDate(originalEventState.legalStatuses.REGISTERED.createdAt)
      : undefined) ?? todayISO()
  const potentialDuplicateRegistrationAnchor =
    (potentialDuplicateEventState.legalStatuses.REGISTERED
      ? toPlainDate(
          potentialDuplicateEventState.legalStatuses.REGISTERED.createdAt
        )
      : undefined) ?? todayISO()

  const hideFieldTypes = [
    ...FieldTypesToHideInReview,
    FieldType.FILE,
    FieldType.FILE_WITH_OPTIONS
  ]

  const comparisonData: ComparisonDeclaration[] = getDeclarationPages(
    eventConfiguration
  )
    .filter(
      (page) =>
        isPageVisible(
          page,
          originalDeclaration,
          validatorContextOfOriginalEvent
        ) ||
        isPageVisible(
          page,
          potentialDuplicateDeclaration,
          validatorContextOfPotentialDuplicateEvent
        )
    )
    .map((page) => ({
      title: intl.formatMessage(page.title),
      data: page.fields
        .filter(
          (field) =>
            isFieldDisplayedOnReview(
              field,
              originalDeclaration,
              validatorContextOfOriginalEvent
            ) ||
            isFieldDisplayedOnReview(
              field,
              potentialDuplicateDeclaration,
              validatorContextOfPotentialDuplicateEvent
            )
        )
        .filter(
          ({ type }) =>
            !hideFieldTypes.some((typeToHide) => type === typeToHide)
        )
        // Group fields by label.id, preserving form order. Multiple fields
        // can share the same label (e.g. "child.birthLocation" /
        // "child.birthLocation.privateHome" / "child.birthLocation.other"
        // all map to "Location of birth"). We render one row per unique
        // label and pick the active field per side separately below.
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
        .map(({ fields }) => {
          // Each side may have a different field "active" — e.g. when one
          // record uses HEALTH_FACILITY and the other was corrected to
          // PRIVATE_HOME, the LOCATION field is active on one side and the
          // ADDRESS field on the other. Pick the field whose conditional
          // is satisfied per declaration so the comparison row shows the
          // value the user actually entered, not a stale field config.
          const pickFieldForReview = (
            declaration: EventState,
            ctx: ValidatorContext
          ): FieldConfig =>
            fields.find((f) => isFieldDisplayedOnReview(f, declaration, ctx)) ??
            fields[0]

          const leftField = pickFieldForReview(
            originalDeclaration,
            validatorContextOfOriginalEvent
          )
          const rightField = pickFieldForReview(
            potentialDuplicateDeclaration,
            validatorContextOfPotentialDuplicateEvent
          )

          return {
            label: intl.formatMessage(fields[0].label),
            rightValue: (
              <Output
                anchor={potentialDuplicateAnchor}
                displayEmptyAsDash={true}
                eventConfig={eventConfiguration}
                field={rightField}
                formConfig={getDeclaration(eventConfiguration)}
                previousForm={potentialDuplicateDeclaration}
                value={potentialDuplicateDeclaration[rightField.id]}
              />
            ),
            leftValue: (
              <Output
                anchor={originalAnchor}
                displayEmptyAsDash={true}
                eventConfig={eventConfiguration}
                field={leftField}
                formConfig={getDeclaration(eventConfiguration)}
                previousForm={originalDeclaration}
                value={originalDeclaration[leftField.id]}
              />
            )
          }
        })
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
        rightValue: intl.formatMessage(eventConfiguration.label),
        leftValue: intl.formatMessage(eventConfiguration.label)
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
          flattenedPotentialDuplicateEvent
        ),
        leftValue: flattenedIntl.formatMessage(
          summaryMessages.registrationNumber.value,
          flattenedOriginalEvent
        )
      },
      {
        label: intl.formatMessage(duplicateMessages.registeredAt),
        rightValue: flattenedPotentialDuplicateEvent['event.registeredAt'] ? (
          <RegisteredAtOfficeName
            anchor={potentialDuplicateRegistrationAnchor}
            id={flattenedPotentialDuplicateEvent['event.registeredAt']}
          />
        ) : null,
        leftValue: flattenedOriginalEvent['event.registeredAt'] ? (
          <RegisteredAtOfficeName
            anchor={originalRegistrationAnchor}
            id={flattenedOriginalEvent['event.registeredAt']}
          />
        ) : null
      },
      {
        label: intl.formatMessage(duplicateMessages.registeredBy),
        rightValue: flattenedPotentialDuplicateEvent['event.registeredBy'] ? (
          <UserFullName
            userId={flattenedPotentialDuplicateEvent['event.registeredBy']}
          />
        ) : null,
        leftValue: flattenedOriginalEvent['event.registeredBy'] ? (
          <UserFullName userId={flattenedOriginalEvent['event.registeredBy']} />
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
                form={originalDeclaration}
                formConfig={getDeclaration(eventConfiguration)}
                showInMobile={false}
              />
              <MobileOnly>
                <SupportingDocumentList
                  declaration={originalDeclaration}
                  declarationConfig={getDeclaration(eventConfiguration)}
                />
              </MobileOnly>
            </div>
            <div style={{ flex: 1 }}>
              <Text color="grey400" element="p" variant="bold14">
                {potentialDuplicateEventState.trackingId}
              </Text>
              <DocumentViewer
                comparisonView={true}
                form={potentialDuplicateDeclaration}
                formConfig={getDeclaration(eventConfiguration)}
                showInMobile={false}
              />
              <MobileOnly>
                <SupportingDocumentList
                  declaration={potentialDuplicateDeclaration}
                  declarationConfig={getDeclaration(eventConfiguration)}
                />
              </MobileOnly>
            </div>
          </SupportingDocumentWrapper>
        </Content>
      </div>
    </FullBodyContent>
  )
}
