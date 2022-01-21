/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { constantsMessages, userMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/search'
import { messages as correctionMessages } from '@client/i18n/messages/views/correction'
import {
  CERTIFICATE_DATE_FORMAT,
  CERTIFICATE_MONEY_RECEIPT_DATE_FORMAT,
  LANG_EN,
  REJECTED
} from '@client/utils/constants'
import { createNamesMap } from '@client/utils/data-formatting'
import {
  StatusGray,
  StatusGreen,
  StatusOrange,
  StatusRejected,
  StatusProgress,
  StatusWaitingValidation,
  StatusCertified
} from '@opencrvs/components/lib/icons'
import { ITheme } from '@opencrvs/components/lib/theme'
import {
  GQLBirthEventSearchSet,
  GQLDeathEventSearchSet,
  GQLEventSearchSet,
  GQLHumanName
} from '@opencrvs/gateway/src/graphql/schema.d'
import moment from 'moment'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import styled, { withTheme } from 'styled-components'
import { getRejectionReasonDisplayValue } from '@client/views/SearchResult/SearchResult'
import { checkExternalValidationStatus } from '@client/views/SysAdmin/Team/utils'
import {
  ICON_ALIGNMENT,
  TertiaryButton
} from '@opencrvs/components/lib/buttons'
import { goToCertificateCorrection } from '@client/navigation'
import { connect } from 'react-redux'
import { CorrectionSection } from '@client/forms'

const ExpansionContent = styled.div`
  background: ${({ theme }) => theme.colors.white};
  margin-bottom: 1px;
  border-top: ${({ theme }) => `2px solid ${theme.colors.background}`};
`
const ExpansionContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.bodyStyle};
  margin-bottom: 8px;
  &:last-child {
    margin-bottom: 0;
  }
  &.history {
    margin-left: 8px;
  }
`
const ExpansionContentContainer = styled.div`
  flex: 1;
  margin-left: 16px;
`
const StatusIcon = styled.div`
  margin-top: 3px;
`
const InProgressStatusIcon = styled(StatusIcon)`
  margin-left: -3px;
  margin-right: -3px;
`

const StyledLabel = styled.label`
  ${({ theme }) => theme.fonts.bodyBoldStyle};
  margin-right: 3px;
`
const StyledValue = styled.span`
  ${({ theme }) => theme.fonts.bodyStyle};
  text-transform: capitalize !important;
`
const ValueContainer = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  & span:not(:last-child) {
    border-right: 1px solid ${({ theme }) => theme.colors.placeholder};
    margin-right: 10px;
    padding-right: 10px;
  }
`
const RecordCorrectionButton = styled(TertiaryButton)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 4px 8px;
  position: relative;
  width: auto;
  height: 29px;
  border-radius: 4px;
  margin-left: 395px;
`
const RecordCorrectionText = styled.div`
  position: static;
  height: 21px;
  top: 29px;
  right: 8px;
  color: '#4972bb';
  font-style: normal;
  ${({ theme }) => theme.fonts.subtitleStyle};
  display: inline-flex;
  flex-direction: column;
  align-items: baseline;
  text-align: center;
  font-feature-settings: 'pnum' on, 'lnum' on;
  white-space: noWrap;
`

const EditIcon = styled.div`
  position: static;
  width: 16px;
  height: 16px;
  left: 8px;
  top: 6.5px;
  flex: none;
  order: 0;
  flex-grow: 0;
  margin: 0px 5px;
`

const HistoryWrapper = styled.div`
  margin: 24px;
`
const PaddedContent = styled.div`
  padding: 24px;
`
const OverflowContent = styled.div`
  max-height: 200px;
  overflow-y: auto;
`
const BorderedPaddedContent = styled(PaddedContent)`
  border-bottom: ${({ theme }) => `2px solid ${theme.colors.background}`};
`
const BoldSpan = styled.span`
  ${({ theme }) => theme.fonts.bodyBoldStyle};
  padding: 0 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

function LabelValue({
  label,
  value,
  id
}: {
  id?: string
  label: string
  value: string
}) {
  if (id && id.includes('expanded_history_item_comment')) {
    return (
      <OverflowContent id={id}>
        <StyledLabel>{label}:</StyledLabel>
        <StyledValue>{value}</StyledValue>
      </OverflowContent>
    )
  } else {
    return (
      <div id={id}>
        <StyledLabel>{label}:</StyledLabel>
        <StyledValue>{value}</StyledValue>
      </div>
    )
  }
}

function ValuesWithSeparator(props: { strings: string[] }): JSX.Element {
  return (
    <ValueContainer>
      {props.strings.map((value, index) => (
        <span key={index}>{value}</span>
      ))}
    </ValueContainer>
  )
}

function formatRoleCode(str: string) {
  const sections = str.split('_')
  const formattedString: string[] = []
  sections.map((section) => {
    section = section.charAt(0) + section.slice(1).toLowerCase()
    formattedString.push(section)
    return section
  })

  return formattedString.join(' ')
}

type IProps = IntlShapeProps & {
  theme: ITheme
  eventDetails?: GQLEventSearchSet | null
  goToCertificateCorrection: typeof goToCertificateCorrection
}

type ISODateString = string

interface IOperationHistory {
  type: string | null | undefined
  practitionerName: string
  timestamp: string | null | undefined
  practitionerRole: string
  officeName: string | (string | null)[] | null | undefined
  facilityName: string | (string | null)[] | null | undefined
  rejectReasons: string
  comment: string
}

export class RowHistoryViewComponent extends React.Component<IProps> {
  transformer = () => {
    const eventDetails = this.props.eventDetails as GQLEventSearchSet

    const { locale } = this.props.intl
    const type = eventDetails.type || ''
    const contactNumber =
      eventDetails.registration && eventDetails.registration.contactNumber

    let dateOfEvent
    if (type.toLowerCase() === 'birth') {
      const birthEventDetails = eventDetails as GQLBirthEventSearchSet
      dateOfEvent = birthEventDetails.dateOfBirth
    } else {
      const deathEventDetails = eventDetails as GQLDeathEventSearchSet
      dateOfEvent = deathEventDetails.dateOfDeath
    }

    return {
      type,
      trackingId:
        (eventDetails.registration && eventDetails.registration.trackingId) ||
        '',
      dateOfEvent:
        (dateOfEvent &&
          moment(dateOfEvent.toString(), 'YYYY-MM-DD').format(
            CERTIFICATE_MONEY_RECEIPT_DATE_FORMAT
          )) ||
        '',
      contactNumber,
      operationHistories:
        (eventDetails.operationHistories &&
          eventDetails.operationHistories.map((operationHistory) => {
            return {
              type: operationHistory && operationHistory.operationType,
              practitionerName:
                (operationHistory &&
                  (createNamesMap(
                    operationHistory.operatorName as GQLHumanName[]
                  )[locale] as string)) ||
                '',
              timestamp:
                operationHistory &&
                (operationHistory.operatedOn as ISODateString),
              practitionerRole:
                operationHistory && operationHistory.operatorRole
                  ? this.props.intl.formatMessage(
                      userMessages[operationHistory.operatorRole as string]
                    )
                  : '',
              officeName:
                locale === LANG_EN
                  ? operationHistory && operationHistory.operatorOfficeName
                  : operationHistory && operationHistory.operatorOfficeAlias,
              facilityName:
                locale === LANG_EN
                  ? operationHistory &&
                    operationHistory.notificationFacilityName
                  : operationHistory &&
                    operationHistory.notificationFacilityAlias,
              rejectReasons:
                (operationHistory &&
                  operationHistory.operationType === REJECTED &&
                  operationHistory.rejectReason) ||
                '',
              comment:
                (operationHistory &&
                  operationHistory.operationType === REJECTED &&
                  operationHistory.rejectComment) ||
                ''
            }
          })) ||
        []
    }
  }

  getDeclarationStatusIcon = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <InProgressStatusIcon>
            <StatusProgress />
          </InProgressStatusIcon>
        )
      case 'DECLARED':
        return (
          <StatusIcon>
            <StatusOrange />
          </StatusIcon>
        )
      case 'VALIDATED':
        return (
          <StatusIcon>
            <StatusGray />
          </StatusIcon>
        )
      case 'WAITING_VALIDATION':
        return (
          <StatusIcon>
            <StatusWaitingValidation />
          </StatusIcon>
        )
      case 'REGISTERED':
        return (
          <StatusIcon>
            <StatusGreen />
          </StatusIcon>
        )
      case 'REJECTED':
        return (
          <StatusIcon>
            <StatusRejected />
          </StatusIcon>
        )
      case 'CERTIFIED':
        return (
          <StatusIcon>
            <StatusCertified />
          </StatusIcon>
        )
      default:
        return (
          <StatusIcon>
            <StatusOrange />
          </StatusIcon>
        )
    }
  }

  getWorkflowDateLabel = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return constantsMessages.applicationStartedOn
      case 'DECLARED':
        return constantsMessages.applicationSubmittedOn
      case 'VALIDATED':
        return constantsMessages.applicationValidatedOn
      case 'WAITING_VALIDATION':
        return constantsMessages.applicationSentForExternalValidationOn
      case 'REGISTERED':
        return constantsMessages.applicationRegisteredOn
      case 'REJECTED':
        return constantsMessages.applicationRejectedOn
      case 'CERTIFIED':
        return constantsMessages.applicationCollectedOn
      default:
        return constantsMessages.applicationSubmittedOn
    }
  }

  getValueSepartorsProp = (operationHistory: IOperationHistory) => {
    //Search service only populate facility name for in-progress notifications
    const facilityName =
      operationHistory.facilityName && (operationHistory.facilityName as string)

    if (operationHistory.type === 'IN_PROGRESS' && facilityName) {
      return [facilityName]
    } else {
      const officeName = operationHistory.officeName as string
      return [
        operationHistory.practitionerName,
        formatRoleCode(operationHistory.practitionerRole),
        officeName
      ]
    }
  }

  getRenderedData() {
    const { intl } = this.props
    const eventDetails = this.props.eventDetails as GQLEventSearchSet
    const type = eventDetails.type || ''

    const transformedData = this.transformer()
    return (
      <>
        <BorderedPaddedContent>
          <ExpansionContainer>
            <label>{intl.formatMessage(constantsMessages.trackingId)}:</label>
            <BoldSpan>{transformedData.trackingId}</BoldSpan>
          </ExpansionContainer>
          <ExpansionContainer>
            <label>
              {intl.formatMessage(
                transformedData.type.toLowerCase() === 'birth'
                  ? constantsMessages.dob
                  : constantsMessages.dod
              )}
              :
            </label>
            <BoldSpan>{transformedData.dateOfEvent}</BoldSpan>
          </ExpansionContainer>
          <ExpansionContainer>
            <label>{intl.formatMessage(messages.informantContact)}:</label>
            <BoldSpan>{transformedData.contactNumber}</BoldSpan>
          </ExpansionContainer>
        </BorderedPaddedContent>
        <>
          {transformedData.operationHistories
            .filter((item) => checkExternalValidationStatus(item.type))
            .map((operationHistory, index) => {
              const { rejectReasons, comment } = operationHistory
              const type = operationHistory.type as string
              const timestamp = moment(operationHistory.timestamp!).format(
                CERTIFICATE_DATE_FORMAT
              )
              return (
                <HistoryWrapper key={index}>
                  <ExpansionContainer
                    id={type + '-' + index}
                    className="history"
                  >
                    {this.getDeclarationStatusIcon(type)}
                    <ExpansionContentContainer>
                      <LabelValue
                        id="expanded_history_item_timestamp"
                        label={intl.formatMessage(
                          this.getWorkflowDateLabel(type)
                        )}
                        value={timestamp}
                      />
                      <ValueContainer>
                        <StyledLabel>
                          {this.props.intl.formatMessage(constantsMessages.by)}:
                        </StyledLabel>
                        <ValuesWithSeparator
                          strings={this.getValueSepartorsProp(operationHistory)}
                        />
                        {type === 'REGISTERED' && (
                          <RecordCorrectionButton
                            align={ICON_ALIGNMENT.LEFT}
                            onClick={() =>
                              this.props.goToCertificateCorrection(
                                eventDetails.id,
                                CorrectionSection.Corrector
                              )
                            }
                            icon={() => (
                              <EditIcon>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-6 w-6"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </EditIcon>
                            )}
                          >
                            <RecordCorrectionText>
                              {intl.formatMessage(correctionMessages.title)}
                            </RecordCorrectionText>
                          </RecordCorrectionButton>
                        )}
                      </ValueContainer>
                      {rejectReasons && (
                        <>
                          <LabelValue
                            label={intl.formatMessage(constantsMessages.update)}
                            value={rejectReasons
                              .split(',')
                              .map((reason) =>
                                intl.formatMessage(
                                  getRejectionReasonDisplayValue(reason)
                                )
                              )
                              .join(', ')}
                          />
                          <LabelValue
                            id="expanded_history_item_comment"
                            label={intl.formatMessage(
                              constantsMessages.comment
                            )}
                            value={comment}
                          />
                        </>
                      )}
                    </ExpansionContentContainer>
                  </ExpansionContainer>
                </HistoryWrapper>
              )
            })
            .reverse()}
        </>
      </>
    )
  }

  render() {
    return <ExpansionContent>{this.getRenderedData()}</ExpansionContent>
  }
}

export const RowHistoryView = connect(undefined, {
  goToCertificateCorrection: goToCertificateCorrection
})(injectIntl(withTheme(RowHistoryViewComponent)))
