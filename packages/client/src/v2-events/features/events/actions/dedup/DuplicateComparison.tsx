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
  EventIndex,
  EventState,
  FieldConfig,
  FieldType,
  isFieldDisplayedOnReview,
  isPageVisible
} from '@opencrvs/commons/client'
import {
  ComparisonListView,
  Content,
  ContentSize,
  FullBodyContent,
  Stack,
  Text
} from '@opencrvs/components'
import { summaryMessages } from '@client/v2-events/features/workqueues/EventOverview/components/EventSummary'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { flattenEventIndex, getUsersFullName } from '@client/v2-events/utils'
import { useUsers } from '@client/v2-events/hooks/useUsers'
import { noop } from '@client/v2-events'
import { useEventConfiguration } from '../../useEventConfiguration'
import { Output, ValueOutput } from '../../components/Output'
import { AdministrativeArea } from '../../registered-fields'
import { DocumentViewer } from '../../components/DocumentViewer'
import { duplicateMessages } from './ReviewDuplicate'

const RightAlignedOnSmallScreen = styled(Text)`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    text-align: end;
  }
`

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
          config: field,
          value: declaration[field.id]
        })}
      </DocWrapper>
    ))
}

function UserFullName({ userId }: { userId: string }) {
  const intl = useIntl()
  const users = useUsers()
  const user = users.getUser.useQuery(userId).data
  if (!user) {
    return null
  }
  return getUsersFullName(user.name, intl.locale)
}

export function DuplicateComparison({
  originalEvent,
  potentialDuplicateEvent
}: {
  originalEvent: EventIndex
  potentialDuplicateEvent: EventIndex
}) {
  const intl = useIntl()
  const flattenedIntl = useIntlFormatMessageWithFlattenedParams()
  const { eventConfiguration } = useEventConfiguration(originalEvent.type)

  const flattenedPotentialDuplicateEvent = flattenEventIndex(
    potentialDuplicateEvent
  )
  const flattenedOriginalEvent = flattenEventIndex(originalEvent)

  const originalDeclaration = originalEvent.declaration
  const potentialDuplicateDeclaration = potentialDuplicateEvent.declaration

  const hideFieldTypes = [
    FieldType.FILE,
    FieldType.FILE_WITH_OPTIONS,
    FieldType.BULLET_LIST,
    FieldType.DIVIDER
  ]

  const comparisonData: ComparisonDeclaration[] =
    eventConfiguration.declaration.pages
      .filter(
        (page) =>
          isPageVisible(page, originalDeclaration) ||
          isPageVisible(page, potentialDuplicateDeclaration)
      )
      .map((page) => ({
        title: intl.formatMessage(page.title),
        data: page.fields
          .filter(
            (field) =>
              isFieldDisplayedOnReview(field, originalDeclaration) ||
              isFieldDisplayedOnReview(field, potentialDuplicateDeclaration)
          )
          .filter(
            ({ type }) =>
              !hideFieldTypes.some((typeToHide) => type === typeToHide)
          )
          // Refer to 'findPreviousValueWithSameLabel' in Output.tsx for explanation
          .reduce<FieldConfig[]>((acc, field) => {
            const fieldWithSameLabelDontExist = !acc.find(
              (f) => f.label.id === field.label.id
            )
            if (fieldWithSameLabelDontExist) {
              acc.push(field)
            }
            return acc
          }, [])
          .map((field) => ({
            label: intl.formatMessage(field.label),
            rightValue: Output({
              field,
              value: potentialDuplicateDeclaration[field.id],
              previousForm: potentialDuplicateDeclaration,
              formConfig: eventConfiguration.declaration,
              displayEmptyAsDash: true,
              showPreviouslyMissingValuesAsChanged: false
            }),
            leftValue: Output({
              field,
              value: originalDeclaration[field.id],
              previousForm: originalDeclaration,
              formConfig: eventConfiguration.declaration,
              displayEmptyAsDash: true,
              showPreviouslyMissingValuesAsChanged: false
            })
          }))
      }))
      .filter(({ data }) => data.length > 0)

  const declarationDetailsComparison: ComparisonDeclaration = {
    title: intl.formatMessage(duplicateMessages.duplicateDeclarationDetails),
    data: [
      {
        label: intl.formatMessage(summaryMessages.status.label),
        rightValue: flattenedIntl.formatMessage(summaryMessages.status.value, {
          'event.status': potentialDuplicateEvent.status
        }),
        leftValue: flattenedIntl.formatMessage(summaryMessages.status.value, {
          'event.status': originalEvent.status
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
            'event.trackingId': potentialDuplicateEvent.trackingId
          }
        ),
        leftValue: flattenedIntl.formatMessage(
          summaryMessages.trackingId.value,
          {
            'event.trackingId': originalEvent.trackingId
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
          <AdministrativeArea.Output
            value={flattenedPotentialDuplicateEvent['event.registeredAt']}
          />
        ) : null,
        leftValue: flattenedOriginalEvent['event.registeredAt'] ? (
          <AdministrativeArea.Output
            value={flattenedOriginalEvent['event.registeredAt']}
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
                  {originalEvent.trackingId}
                </Text>
              ),
              duplicateTrackingId: potentialDuplicateEvent.trackingId
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
                  <ComparisonListView
                    key={`comparison-${index}`}
                    headings={[
                      originalEvent.trackingId,
                      potentialDuplicateEvent.trackingId
                    ]}
                  >
                    {sections.data.map((item, id) => (
                      <ComparisonListView.Row
                        key={`row-${id}`}
                        heading={{
                          right: potentialDuplicateEvent.trackingId,
                          left: originalEvent.trackingId
                        }}
                        label={
                          <Text color="grey600" element="span" variant="bold16">
                            {item.label}
                          </Text>
                        }
                        leftValue={
                          <RightAlignedOnSmallScreen
                            element="span"
                            variant="reg16"
                          >
                            {item.leftValue}
                          </RightAlignedOnSmallScreen>
                        }
                        rightValue={
                          <RightAlignedOnSmallScreen
                            element="span"
                            variant="reg16"
                          >
                            {item.rightValue}
                          </RightAlignedOnSmallScreen>
                        }
                      />
                    ))}
                  </ComparisonListView>
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
                {originalEvent.trackingId}
              </Text>
              <DocumentViewer
                comparisonView={true}
                disabled={true}
                form={originalDeclaration}
                formConfig={eventConfiguration.declaration}
                showInMobile={false}
                onEdit={noop}
              />
              <MobileOnly>
                <SupportingDocumentList
                  declaration={originalDeclaration}
                  declarationConfig={eventConfiguration.declaration}
                />
              </MobileOnly>
            </div>
            <div style={{ flex: 1 }}>
              <Text color="grey400" element="p" variant="bold14">
                {potentialDuplicateEvent.trackingId}
              </Text>
              <DocumentViewer
                comparisonView={true}
                disabled={true}
                form={potentialDuplicateDeclaration}
                formConfig={eventConfiguration.declaration}
                showInMobile={false}
                onEdit={noop}
              />
              <MobileOnly>
                <SupportingDocumentList
                  declaration={potentialDuplicateDeclaration}
                  declarationConfig={eventConfiguration.declaration}
                />
              </MobileOnly>
            </div>
          </SupportingDocumentWrapper>
        </Content>
      </div>
    </FullBodyContent>
  )
}
