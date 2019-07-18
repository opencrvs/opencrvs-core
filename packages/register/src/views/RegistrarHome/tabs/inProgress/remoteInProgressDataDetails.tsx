import { StatusProgress } from '@opencrvs/components/lib/icons'
import { Spinner } from '@opencrvs/components/lib/interface'
import { ITheme } from '@opencrvs/components/lib/theme'
import {
  GQLBirthRegistration,
  GQLContactPoint,
  GQLDeathRegistration,
  GQLHumanName,
  GQLQuery
} from '@opencrvs/gateway/src/graphql/schema.d'
import { messages } from './messages'
import {
  CERTIFICATE_DATE_FORMAT,
  CERTIFICATE_MONEY_RECEIPT_DATE_FORMAT,
  LANG_EN,
  LOCAL_DATE_FORMAT
} from '@register/utils/constants'
import { createNamesMap } from '@register/utils/data-formatting'
import { formatLongDate } from '@register/utils/date-formatting'
import { roleMessages } from '@register/utils/roleTypeMessages'
import { FETCH_REGISTRATION_BY_COMPOSITION } from '@register/views/RegistrarHome/queries'
import * as Sentry from '@sentry/browser'
import moment from 'moment'
import * as React from 'react'
import { Query } from 'react-apollo'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import styled, { withTheme } from 'styled-components'
import { IApplication } from '@register/applications'

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
`
const ExpansionContentContainer = styled.div`
  flex: 1;
  margin-left: 10px;
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
  padding: 10px 25px;
  margin: 20px 0px;
`

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
  ${({ theme }) => theme.fonts.bodyStyle};
  text-align: center;
  margin: 25px;
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

type IProps = InjectedIntlProps & {
  theme: ITheme
  eventId: string
}

class RemoteInProgressDataDetailsComponent extends React.Component<IProps> {
  transformer = (data: GQLQuery) => {
    const { locale } = this.props.intl
    const registration =
      data && data.fetchRegistration && data.fetchRegistration.registration
    const type = (registration && registration.type) || ''
    let name
    let dateOfEvent
    let informant
    if (type.toLowerCase() === 'birth') {
      const birthReg = data && (data.fetchRegistration as GQLBirthRegistration)
      name = (birthReg.child && birthReg.child.name) || []
      dateOfEvent = birthReg.child && birthReg.child.birthDate

      informant = birthReg && birthReg.informant
    } else {
      const deathReg = data && (data.fetchRegistration as GQLDeathRegistration)
      name = (deathReg.deceased && deathReg.deceased.name) || []
      dateOfEvent =
        deathReg.deceased &&
        deathReg.deceased.deceased &&
        deathReg.deceased.deceased.deathDate
      informant = deathReg && deathReg.informant
    }

    return {
      informantRelation:
        registration &&
        registration.contact &&
        this.props.intl.formatMessage(messages[registration.contact as string]),
      informantContactNumber: registration && registration.contactPhoneNumber,
      statuses:
        (registration &&
          registration.status &&
          registration.status.map(status => {
            return {
              type: status && status.type,
              practitionerName:
                (status &&
                  status.user &&
                  ((createNamesMap(status.user.name as GQLHumanName[])[
                    locale
                  ] as string) ||
                    (createNamesMap(status.user.name as GQLHumanName[])[
                      LANG_EN
                    ] as string))) ||
                '',
              timestamp: status && formatLongDate(status.timestamp, locale),
              practitionerRole:
                status && status.user && status.user.role
                  ? this.props.intl.formatMessage(
                      roleMessages[status.user.role as string]
                    )
                  : '',
              officeName:
                locale === LANG_EN
                  ? status && status.office && status.office.name
                  : status && status.office && status.office.alias
            }
          })) ||
        []
    }
  }

  render() {
    const { intl, eventId } = this.props
    return (
      <ExpansionContent>
        <Query
          query={FETCH_REGISTRATION_BY_COMPOSITION}
          variables={{
            id: eventId
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
                  {intl.formatMessage(messages.queryError)}
                </ErrorText>
              )
            } else if (loading) {
              return (
                <SpinnerContainer>
                  <QuerySpinner
                    id="query-spinner"
                    baseColor={this.props.theme.colors.background}
                  />
                </SpinnerContainer>
              )
            }
            const transformedData = this.transformer(data)
            return (
              <>
                {transformedData.statuses
                  .map((status, index) => {
                    const { practitionerName, practitionerRole } = status
                    const type = status.type as string
                    const officeName = status.officeName as string
                    const timestamp = moment(
                      status.timestamp as string,
                      LOCAL_DATE_FORMAT
                    ).format(CERTIFICATE_DATE_FORMAT)
                    return (
                      <HistoryWrapper key={index}>
                        <ExpansionContainer id={type + '-' + index}>
                          <StatusIcon>
                            <StatusProgress />
                          </StatusIcon>
                          <ExpansionContentContainer>
                            <LabelValue
                              label={intl.formatMessage(
                                messages.applicationCreationLabel
                              )}
                              value={timestamp}
                            />
                            <ValueContainer>
                              <StyledLabel>
                                {intl.formatMessage(
                                  messages.applicationInformantLabel
                                )}
                                :
                              </StyledLabel>
                              <ValuesWithSeparator
                                strings={[
                                  transformedData.informantRelation || '',
                                  transformedData.informantContactNumber || ''
                                ]}
                              />
                            </ValueContainer>
                            <br />
                            <ValueContainer>
                              <StyledLabel>
                                {this.props.intl.formatMessage(
                                  messages.applicationInitiatorLabel
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
                          </ExpansionContentContainer>
                        </ExpansionContainer>
                      </HistoryWrapper>
                    )
                  })
                  .reverse()}
              </>
            )
          }}
        </Query>
      </ExpansionContent>
    )
  }
}

export const RemoteInProgressDataDetails = injectIntl(
  withTheme(RemoteInProgressDataDetailsComponent)
)
