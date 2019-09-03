import * as React from 'react'
import styled, { withTheme } from 'styled-components'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { Spinner } from '@opencrvs/components/lib/interface'
import { FETCH_REGISTRATION_BY_COMPOSITION } from './queries'
import { Query } from 'react-apollo'
import * as Sentry from '@sentry/browser'
import { ITheme } from '@opencrvs/components/lib/theme'
import {
  GQLDeathRegistration,
  GQLHumanName,
  GQLQuery,
  GQLComment,
  GQLBirthRegistration,
  GQLContactPoint
} from '@opencrvs/gateway/src/graphql/schema.d'
import {
  createNamesMap,
  extractCommentFragmentValue
} from '@register/utils/data-formatting'
import { formatLongDate } from '@register/utils/date-formatting'
import {
  LANG_EN,
  REJECTED,
  REJECT_REASON,
  REJECT_COMMENTS,
  LOCAL_DATE_FORMAT,
  CERTIFICATE_DATE_FORMAT,
  CERTIFICATE_MONEY_RECEIPT_DATE_FORMAT
} from '@register/utils/constants'
import {
  constantsMessages,
  errorMessages,
  userMessages
} from '@register/i18n/messages'
import { messages } from '@register/i18n/messages/views/search'
import moment from 'moment'
import {
  StatusGray,
  StatusGreen,
  StatusOrange,
  StatusRejected
} from '@opencrvs/components/lib/icons'

const ExpansionContent = styled.div`
  background: ${({ theme }) => theme.colors.white};
  margin-bottom: 1px;
  border-top: ${({ theme }) => `2px solid ${theme.colors.background}`};
`
const QuerySpinner = styled(Spinner)`
  width: 50px;
  height: 50px;
  margin: 30px;
`
const SpinnerContainer = styled.div`
  min-height: 70px;
  min-width: 70px;
  display: flex;
  justify-content: center;
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
const HistoryWrapper = styled.div`
  margin: 24px;
`
const PaddedContent = styled.div`
  padding: 24px;
`
const BorderedPaddedContent = styled(PaddedContent)`
  border-bottom: ${({ theme }) => `2px solid ${theme.colors.background}`};
`
const BoldSpan = styled.span`
  ${({ theme }) => theme.fonts.bodyBoldStyle};
  padding: 0 10px;
`
const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
  ${({ theme }) => theme.fonts.bodyStyle};
  text-align: center;
  margin: 24px;
`

function LabelValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <StyledLabel>{label}:</StyledLabel>
      <StyledValue>{value}</StyledValue>
    </div>
  )
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
  sections.map(section => {
    section = section.charAt(0) + section.slice(1).toLowerCase()
    formattedString.push(section)
    return section
  })

  return formattedString.join(' ')
}

type IProps = IntlShapeProps & {
  theme: ITheme
  eventId: string
}

export class RowHistoryViewComponent extends React.Component<IProps> {
  transformer = (data: GQLQuery) => {
    const { locale } = this.props.intl
    const registration =
      data && data.fetchRegistration && data.fetchRegistration.registration
    const type = (registration && registration.type) || ''
    let name
    let dateOfEvent
    let contactNumber: string | undefined | null
    if (type.toLowerCase() === 'birth') {
      const birthReg = data && (data.fetchRegistration as GQLBirthRegistration)
      name = (birthReg.child && birthReg.child.name) || []
      dateOfEvent = birthReg.child && birthReg.child.birthDate
      contactNumber =
        birthReg.registration && birthReg.registration.contactPhoneNumber
    } else {
      const deathReg = data && (data.fetchRegistration as GQLDeathRegistration)
      name = (deathReg.deceased && deathReg.deceased.name) || []
      dateOfEvent =
        deathReg.deceased &&
        deathReg.deceased.deceased &&
        deathReg.deceased.deceased.deathDate
      const informant = deathReg && deathReg.informant
      contactNumber =
        informant &&
        informant.individual &&
        informant.individual.telecom &&
        informant.individual.telecom[0] &&
        (informant.individual.telecom[0] as GQLContactPoint).value
    }

    return {
      type,
      name: createNamesMap(name as GQLHumanName[])[locale] as string,
      dateOfEvent:
        (dateOfEvent &&
          moment(dateOfEvent.toString(), 'YYYY-MM-DD').format(
            CERTIFICATE_MONEY_RECEIPT_DATE_FORMAT
          )) ||
        '',
      contactNumber,
      statuses:
        (registration &&
          registration.status &&
          registration.status.map(status => {
            return {
              type: status && status.type,
              practitionerName:
                (status &&
                  status.user &&
                  (createNamesMap(status.user.name as GQLHumanName[])[
                    locale
                  ] as string)) ||
                '',
              timestamp: status && formatLongDate(status.timestamp, locale),
              practitionerRole:
                status && status.user && status.user.role
                  ? this.props.intl.formatMessage(
                      userMessages[status.user.role as string]
                    )
                  : '',
              officeName:
                locale === LANG_EN
                  ? status && status.office && status.office.name
                  : status && status.office && status.office.alias,
              rejectReasons:
                (status &&
                  status.type === REJECTED &&
                  extractCommentFragmentValue(
                    (status.comments as GQLComment[]) || [],
                    REJECT_REASON
                  )) ||
                '',
              comment:
                (status &&
                  status.type === REJECTED &&
                  extractCommentFragmentValue(
                    (status.comments as GQLComment[]) || [],
                    REJECT_COMMENTS
                  )) ||
                ''
            }
          })) ||
        []
    }
  }

  getDeclarationStatusIcon = (status: string) => {
    switch (status) {
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
      case 'DECLARED':
        return constantsMessages.applicationSubmittedOn
      case 'VALIDATED':
        return constantsMessages.applicationValidatedOn
      case 'REGISTERED':
        return constantsMessages.applicationRegisteredOn
      case 'REJECTED':
        return constantsMessages.applicationRejectedOn
      default:
        return constantsMessages.applicationSubmittedOn
    }
  }

  render() {
    const { intl } = this.props
    return (
      <ExpansionContent>
        <Query
          query={FETCH_REGISTRATION_BY_COMPOSITION}
          variables={{
            id: this.props.eventId
          }}
        >
          {({
            loading,
            error,
            data
          }: {
            loading: any
            error?: any
            data?: any
          }) => {
            if (error) {
              Sentry.captureException(error)
              return (
                <ErrorText id="search-result-error-text-expanded">
                  {intl.formatMessage(errorMessages.queryError)}
                </ErrorText>
              )
            } else if (loading) {
              return (
                <SpinnerContainer>
                  <QuerySpinner id="query-spinner" />
                </SpinnerContainer>
              )
            }
            const transformedData = this.transformer(data)
            return (
              <>
                <BorderedPaddedContent>
                  <ExpansionContainer>
                    <label>{intl.formatMessage(constantsMessages.name)}:</label>
                    <BoldSpan>{transformedData.name}</BoldSpan>
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
                    <label>
                      {intl.formatMessage(messages.informantContact)}:
                    </label>
                    <BoldSpan>{transformedData.contactNumber}</BoldSpan>
                  </ExpansionContainer>
                </BorderedPaddedContent>
                <>
                  {transformedData.statuses
                    .map((status, index) => {
                      const {
                        practitionerName,
                        practitionerRole,
                        rejectReasons,
                        comment
                      } = status
                      const type = status.type as string
                      const officeName = status.officeName as string
                      const timestamp = moment(
                        status.timestamp as string,
                        LOCAL_DATE_FORMAT
                      ).format(CERTIFICATE_DATE_FORMAT)
                      return (
                        <HistoryWrapper key={index}>
                          <ExpansionContainer
                            id={type + '-' + index}
                            className="history"
                          >
                            {this.getDeclarationStatusIcon(type)}
                            <ExpansionContentContainer>
                              <LabelValue
                                label={intl.formatMessage(
                                  this.getWorkflowDateLabel(type)
                                )}
                                value={timestamp}
                              />
                              <ValueContainer>
                                <StyledLabel>
                                  {this.props.intl.formatMessage(
                                    constantsMessages.by
                                  )}
                                  :
                                </StyledLabel>
                                <ValuesWithSeparator
                                  strings={[
                                    practitionerName,
                                    formatRoleCode(practitionerRole),
                                    officeName
                                  ]}
                                />
                              </ValueContainer>
                              {rejectReasons && (
                                <>
                                  <LabelValue
                                    label={intl.formatMessage(
                                      constantsMessages.update
                                    )}
                                    value={rejectReasons}
                                  />
                                  <LabelValue
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
          }}
        </Query>
      </ExpansionContent>
    )
  }
}

export const RowHistoryView = injectIntl(withTheme(RowHistoryViewComponent))
