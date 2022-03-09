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
import {
  IDeclaration,
  SUBMISSION_STATUS,
  updateFieldAgentDeclaredDeclarations
} from '@client/declarations'
import { Header } from '@client/components/interface/Header/Header'
import { Query } from '@client/components/Query'
import {
  constantsMessages,
  dynamicConstantsMessages,
  errorMessages
} from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/fieldAgentHome'
import {
  goToDeclarationRecordAudit,
  goToEvents as goToEventsAction,
  goToFieldAgentHomeTab as goToFieldAgentHomeTabAction
} from '@client/navigation'
import {
  OPERATIONAL_REPORT,
  PERFORMANCE_HOME,
  REGISTRAR_HOME
} from '@client/navigation/routes'
import { getUserDetails } from '@client/profile/profileSelectors'
import { SEARCH_DECLARATIONS_USER_WISE } from '@client/search/queries'
import styled, { ITheme, withTheme } from '@client/styledComponents'
import {
  EMPTY_STRING,
  FIELD_AGENT_HOME_TAB_IN_PROGRESS,
  FIELD_AGENT_HOME_TAB_REQUIRE_UPDATES,
  FIELD_AGENT_HOME_TAB_SENT_FOR_REVIEW,
  FIELD_AGENT_ROLES,
  LANG_EN,
  NATL_ADMIN_ROLES,
  PAGE_TRANSITIONS_ENTER_TIME,
  REGISTRAR_ROLES,
  SYS_ADMIN_ROLES
} from '@client/utils/constants'
import { createNamesMap } from '@client/utils/data-formatting'
import { formattedDuration } from '@client/utils/date-formatting'
import { getUserLocation, IUserDetails } from '@client/utils/userUtils'
import { InProgress } from '@client/views/FieldAgentHome/InProgress'
import { SentForReview } from '@client/views/FieldAgentHome/SentForReview'
import {
  LoadingIndicator,
  IOnlineStatusProps,
  withOnlineStatus
} from '@client/views/OfficeHome/LoadingIndicator'
import { EVENT_STATUS } from '@client/views/OfficeHome/OfficeHome'
import { getLanguage } from '@opencrvs/client/src/i18n/selectors'
import { IStoreState } from '@opencrvs/client/src/store'
import { FloatingActionButton } from '@opencrvs/components/lib/buttons'
import {
  DeclarationsOrangeAmber,
  PlusTransparentWhite
} from '@opencrvs/components/lib/icons'
import {
  GridTable,
  ISearchInputProps,
  Loader
} from '@opencrvs/components/lib/interface'
import { HomeContent } from '@opencrvs/components/lib/layout'
import {
  GQLBirthEventSearchSet,
  GQLDeathEventSearchSet,
  GQLEventSearchSet,
  GQLHumanName,
  GQLQuery,
  GQLEventSearchResultSet
} from '@opencrvs/gateway/src/graphql/schema'
import moment from 'moment'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { Redirect, RouteComponentProps } from 'react-router'
import { getJurisdictionLocationIdFromUserDetails } from '@client/views/SysAdmin/Performance/utils'
import { OPERATIONAL_REPORT_SECTION } from '@client/views/SysAdmin/Performance/OperationalReport'
import { Navigation } from '@client/components/interface/Navigation'

const FABContainer = styled.div`
  position: fixed;
  right: 40px;
  bottom: 55px;
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`
export const BodyContainer = styled.div`
  margin-left: 0px;
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-left: 265px;
  }
`
const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors};
  ${({ theme }) => theme.fonts.reg16};
  text-align: center;
  margin-top: 100px;
`
const ZeroUpdatesContainer = styled.div`
  padding-top: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`
const ZeroUpdatesText = styled.span`
  padding-top: 10px;
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.h2};
`
const AllUpdatesText = styled.span`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.reg18};
`
interface IBaseFieldAgentHomeProps {
  theme: ITheme
  language: string
  userDetails: IUserDetails | null
  tabId: string
  draftDeclarations: IDeclaration[]
  goToEvents: typeof goToEventsAction
  draftCount: string
  goToFieldAgentHomeTab: typeof goToFieldAgentHomeTabAction
  goToDeclarationRecordAudit: typeof goToDeclarationRecordAudit
  declarationsReadyToSend: IDeclaration[]
  updateFieldAgentDeclaredDeclarations: typeof updateFieldAgentDeclaredDeclarations
}

interface IFieldAgentHomeState {
  requireUpdatesPage: number
}

interface IMatchParams {
  tabId: string
}

type FieldAgentHomeProps = IBaseFieldAgentHomeProps &
  IOnlineStatusProps &
  IntlShapeProps &
  ISearchInputProps &
  RouteComponentProps<IMatchParams>

interface IFieldAgentHomeState {
  width: number
  requireUpdatesPage: number
}

const TAB_ID = {
  inProgress: FIELD_AGENT_HOME_TAB_IN_PROGRESS,
  sentForReview: FIELD_AGENT_HOME_TAB_SENT_FOR_REVIEW,
  requireUpdates: FIELD_AGENT_HOME_TAB_REQUIRE_UPDATES
}

class FieldAgentHomeView extends React.Component<
  FieldAgentHomeProps,
  IFieldAgentHomeState
> {
  pageSize = 10
  showPaginated = false
  constructor(props: FieldAgentHomeProps) {
    super(props)
    this.state = {
      width: window.innerWidth,
      requireUpdatesPage: 1
    }
  }

  syncWorkqueue() {
    this.props.updateFieldAgentDeclaredDeclarations()
  }

  componentDidMount() {
    setTimeout(() => this.syncWorkqueue(), PAGE_TRANSITIONS_ENTER_TIME)
    window.addEventListener('resize', this.recordWindowWidth)
  }

  componentDidUpdate(
    prevProps: IBaseFieldAgentHomeProps,
    prevState: IFieldAgentHomeState
  ) {
    if (prevProps.tabId !== this.props.tabId) {
      this.setState({
        requireUpdatesPage: 1
      })
    }
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.recordWindowWidth)
  }

  recordWindowWidth = () => {
    this.setState({ width: window.innerWidth })
  }

  onPageChange = (newPageNumber: number) => {
    if (this.props.match.params.tabId === TAB_ID.requireUpdates) {
      this.setState({ requireUpdatesPage: newPageNumber })
    }
  }

  getRejectedColumns = () => {
    if (this.state.width > this.props.theme.grid.breakpoints.lg) {
      return [
        {
          label: this.props.intl.formatMessage(constantsMessages.type),
          width: 20,
          key: 'event'
        },
        {
          label: this.props.intl.formatMessage(constantsMessages.name),
          width: 40,
          key: 'name',
          color: this.props.theme.colors.supportingCopy
        },
        {
          label: this.props.intl.formatMessage(
            constantsMessages.sentForUpdatesOn
          ),
          width: 40,
          key: 'daysOfRejection'
        }
      ]
    } else {
      return [
        {
          label: this.props.intl.formatMessage(constantsMessages.type),
          width: 30,
          key: 'event'
        },
        {
          label: this.props.intl.formatMessage(constantsMessages.name),
          width: 70,
          key: 'name',
          color: this.props.theme.colors.supportingCopy
        }
      ]
    }
  }

  transformRejectedContent = (data: GQLQuery) => {
    if (!data.searchEvents || !data.searchEvents.results) {
      return []
    }

    return data.searchEvents.results.map((reg: GQLEventSearchSet | null) => {
      const { intl } = this.props
      const registrationSearchSet = reg as GQLEventSearchSet
      let names
      if (
        registrationSearchSet.registration &&
        registrationSearchSet.type === 'Birth'
      ) {
        const birthReg = reg as GQLBirthEventSearchSet
        names = birthReg && (birthReg.childName as GQLHumanName[])
      } else {
        const deathReg = reg as GQLDeathEventSearchSet
        names = deathReg && (deathReg.deceasedName as GQLHumanName[])
      }
      moment.locale(this.props.intl.locale)
      const rejectedArray =
        registrationSearchSet &&
        registrationSearchSet.operationHistories &&
        registrationSearchSet.operationHistories.filter((item) => {
          return item && item.operationType === 'REJECTED'
        })
      const daysOfRejection =
        rejectedArray &&
        rejectedArray[0] &&
        formattedDuration(moment(rejectedArray[0].operatedOn))
      const event = registrationSearchSet.type as string
      return {
        id: registrationSearchSet.id,
        event:
          (event &&
            intl.formatMessage(
              dynamicConstantsMessages[event.toLowerCase()]
            )) ||
          '',
        name:
          (createNamesMap(names)[this.props.intl.locale] as string) ||
          (createNamesMap(names)[LANG_EN] as string),
        daysOfRejection: this.props.intl.formatMessage(
          constantsMessages.rejectedDays,
          {
            text: daysOfRejection
          }
        ),
        rowClickHandler: [
          {
            label: 'rowClickHandler',
            handler: () =>
              this.props.goToDeclarationRecordAudit(
                'rejectTab',
                registrationSearchSet.id
              )
          }
        ]
      }
    })
  }

  render() {
    const {
      draftDeclarations,
      userDetails,
      match,
      intl,
      declarationsReadyToSend
    } = this.props

    const tabId = match.params.tabId || TAB_ID.sentForReview
    const fieldAgentLocationId = userDetails && getUserLocation(userDetails).id
    const jurisdictionLocationId =
      userDetails && getJurisdictionLocationIdFromUserDetails(userDetails)
    const role = userDetails && userDetails.role

    return (
      <>
        {role && FIELD_AGENT_ROLES.includes(role) && (
          <>
            <Header />
            <Navigation />
            <BodyContainer>
              {tabId === TAB_ID.inProgress && (
                <InProgress
                  draftDeclarations={draftDeclarations}
                  showPaginated={this.showPaginated}
                />
              )}
              {tabId === TAB_ID.sentForReview && (
                <SentForReview
                  declarationsReadyToSend={declarationsReadyToSend}
                  showPaginated={this.showPaginated}
                />
              )}
              {tabId === TAB_ID.requireUpdates && (
                <Query
                  query={SEARCH_DECLARATIONS_USER_WISE} // TODO can this be changed to use SEARCH_EVENTS
                  variables={{
                    userId: userDetails!.practitionerId,
                    status: [EVENT_STATUS.REJECTED],
                    locationIds: fieldAgentLocationId
                      ? [fieldAgentLocationId]
                      : [],
                    count: this.showPaginated
                      ? this.pageSize
                      : this.pageSize * this.state.requireUpdatesPage,
                    skip: this.showPaginated
                      ? (this.state.requireUpdatesPage - 1) * this.pageSize
                      : 0
                  }}
                >
                  {({
                    loading,
                    error,
                    data
                  }: {
                    loading: any
                    data?: any
                    error?: any
                  }) => {
                    if (loading) {
                      return (
                        <Loader
                          id="require_updates_loader"
                          marginPercent={20}
                          loadingText={intl.formatMessage(
                            messages.requireUpdatesLoading
                          )}
                        />
                      )
                    }
                    if (error) {
                      return (
                        <ErrorText id="require_updates_loading_error">
                          {intl.formatMessage(
                            errorMessages.fieldAgentQueryError
                          )}
                        </ErrorText>
                      )
                    }
                    return (
                      <>
                        {data && data.searchEvents?.totalItems > 0 && (
                          <HomeContent id="require_updates_list">
                            <GridTable
                              content={this.transformRejectedContent(data)}
                              columns={this.getRejectedColumns()}
                              noResultText={EMPTY_STRING}
                              onPageChange={(currentPage: number) => {
                                this.onPageChange(currentPage)
                              }}
                              pageSize={this.pageSize}
                              totalItems={
                                data.searchEvents &&
                                data.searchEvents.totalItems
                              }
                              currentPage={this.state.requireUpdatesPage}
                              clickable={this.props.isOnline}
                              showPaginated={this.showPaginated}
                              loading={loading}
                              loadMoreText={intl.formatMessage(
                                constantsMessages.loadMore
                              )}
                            />
                            <LoadingIndicator
                              loading={loading}
                              hasError={error}
                            />
                          </HomeContent>
                        )}
                        {data && data.searchEvents?.totalItems === 0 && (
                          <ZeroUpdatesContainer>
                            <DeclarationsOrangeAmber />
                            <ZeroUpdatesText>
                              {intl.formatMessage(messages.zeroUpdatesText)}
                            </ZeroUpdatesText>
                            <AllUpdatesText>
                              {intl.formatMessage(messages.allUpdatesText)}
                            </AllUpdatesText>
                          </ZeroUpdatesContainer>
                        )}
                      </>
                    )
                  }}
                </Query>
              )}
              <FABContainer>
                <FloatingActionButton
                  id="new_event_declaration"
                  onClick={this.props.goToEvents}
                  icon={() => <PlusTransparentWhite />}
                />
              </FABContainer>
            </BodyContainer>
          </>
        )}
        {role && NATL_ADMIN_ROLES.includes(role) && (
          <Redirect to={PERFORMANCE_HOME} />
        )}
        {role && SYS_ADMIN_ROLES.includes(role) && (
          <Redirect
            to={{
              pathname: OPERATIONAL_REPORT,
              search:
                '?locationId=' +
                jurisdictionLocationId +
                '&sectionId=' +
                OPERATIONAL_REPORT_SECTION.OPERATIONAL +
                '&timeStart=' +
                moment().subtract(1, 'years').toDate().toISOString() +
                '&timeEnd=' +
                moment().toDate().toISOString()
            }}
          />
        )}
        {role && REGISTRAR_ROLES.includes(role) && (
          <Redirect to={REGISTRAR_HOME} />
        )}
      </>
    )
  }
}

const mapStateToProps = (
  state: IStoreState,
  props: RouteComponentProps<{ tabId: string }>
) => {
  const { match } = props

  return {
    language: getLanguage(state),
    userDetails: getUserDetails(state),
    tabId: (match && match.params && match.params.tabId) || 'progress',
    draftDeclarations:
      (state.declarationsState.declarations &&
        state.declarationsState.declarations.filter(
          (declaration: IDeclaration) =>
            declaration.submissionStatus ===
            SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
        )) ||
      [],
    declarationsReadyToSend: (
      (state.declarationsState.declarations &&
        state.declarationsState.declarations.filter(
          (declaration: IDeclaration) =>
            declaration.submissionStatus !==
            SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
        )) ||
      []
    ).reverse()
  }
}

export const FieldAgentHome = connect(mapStateToProps, {
  goToEvents: goToEventsAction,
  goToFieldAgentHomeTab: goToFieldAgentHomeTabAction,
  goToDeclarationRecordAudit,
  updateFieldAgentDeclaredDeclarations
})(injectIntl(withTheme(withOnlineStatus(FieldAgentHomeView))))
