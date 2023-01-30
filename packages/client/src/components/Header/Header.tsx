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
import { ProfileMenu } from '@client/components/ProfileMenu'
import { SCREEN_LOCK } from '@client/components/ProtectedPage'
import { constantsMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/header'
import { Icon } from '@opencrvs/components/lib/Icon'
import {
  goBack,
  goForward,
  goToEvents as goToEventsAction,
  goToPerformanceHome,
  goToSearch,
  goToSearchResult,
  goToSettings,
  goToTeamSearch,
  goToTeamUserList,
  goToCreateNewUserWithLocationId,
  goToCreateNewUser,
  goToAdvancedSearch
} from '@client/navigation'
import { redirectToAuthentication } from '@client/profile/profileActions'
import { getUserDetails } from '@client/profile/profileSelectors'
import { storage } from '@client/storage'
import { IStoreState } from '@client/store'
import { withTheme } from '@client/styledComponents'
import {
  BRN_DRN_TEXT,
  NATIONAL_ID_TEXT,
  FIELD_AGENT_ROLES,
  NAME_TEXT,
  NATL_ADMIN_ROLES,
  PHONE_TEXT,
  ADVANCED_SEARCH_TEXT,
  REGISTRAR_ROLES,
  SYS_ADMIN_ROLES,
  TRACKING_ID_TEXT,
  PERFORMANCE_MANAGEMENT_ROLES
} from '@client/utils/constants'
import { IUserDetails } from '@client/utils/userUtils'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import {
  ArrowBack,
  Plus,
  SearchDark,
  Activity,
  SearchBlue,
  AddUser
} from '@opencrvs/components/lib/icons'
import { AppHeader, IDomProps } from '@opencrvs/components/lib/AppHeader'
import {
  SearchTool,
  ISearchType,
  INavigationType
} from '@opencrvs/components/lib/SearchTool'
import { ITheme } from '@opencrvs/components/lib/theme'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { getJurisdictionLocationIdFromUserDetails } from '@client/views/SysAdmin/Performance/utils'
import { RouteComponentProps, withRouter } from 'react-router'
import {
  HOME,
  PERFORMANCE_HOME,
  REGISTRAR_HOME,
  TEAM_USER_LIST
} from '@client/navigation/routes'
import { setAdvancedSearchParam } from '@client/search/advancedSearch/actions'
import { advancedSearchInitialState } from '@client/search/advancedSearch/reducer'
import { HistoryNavigator } from './HistoryNavigator'
import { Hamburger } from './Hamburger'
import { Event } from '@client/utils/gateway'

type IStateProps = {
  userDetails: IUserDetails | null
  language: string
}

type IDispatchProps = {
  redirectToAuthentication: typeof redirectToAuthentication
  goToSearchResult: typeof goToSearchResult
  goToEvents: typeof goToEventsAction
  goToSearch: typeof goToSearch
  goToSettings: typeof goToSettings
  goBack: typeof goBack
  goForward: typeof goForward
  goToPerformanceHomeAction: typeof goToPerformanceHome
  goToCreateNewUserWithLocationId: typeof goToCreateNewUserWithLocationId
  goToCreateNewUser: typeof goToCreateNewUser
  goToTeamSearchAction: typeof goToTeamSearch
  goToTeamUserListAction: typeof goToTeamUserList
  goToAdvancedSearch: typeof goToAdvancedSearch
  setAdvancedSearchParam: typeof setAdvancedSearchParam
}

interface IProps extends RouteComponentProps {
  theme: ITheme
  activeMenuItem: ACTIVE_MENU_ITEM
  title?: string
  searchText?: string
  selectedSearchType?: string
  mobileSearchBar?: boolean
  enableMenuSelection?: boolean
  changeTeamLocation?: () => void
  mapPerformanceClickHandler?: () => void
  /** Sets default mobile right actions */
  mobileRight?: {
    icon: () => React.ReactNode
    handler: () => void
  }[]
}

type IFullProps = IntlShapeProps &
  IStateProps &
  IDispatchProps &
  IProps &
  IDomProps

interface IState {
  showLogoutModal: boolean
}

enum ACTIVE_MENU_ITEM {
  DECLARATIONS,
  CONFIG,
  PERFORMANCE,
  TEAM,
  USERS,
  CERTIFICATE,
  APPLICATION,
  FORM,
  INTEGRATION
}

const StyledPrimaryButton = styled(PrimaryButton)`
  width: 40px;
  height: 40px;
  border-radius: 100%;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
  &:focus {
    background: ${({ theme }) => theme.colors.yellow};
  }
  &:active {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
`

const Search = styled(SearchTool)`
  position: static;
  left: calc(50% - 624px / 2 + 24px);
  top: calc(50% - 40px / 2);
  margin: 0px 80px 0px 12px;
`

const HeaderCenter = styled.div`
  padding: 8px 16px;
  height: 40px;
  display: flex;
  flex-direction: row;
  align-items: center;
  background: ${({ theme }) => theme.colors.white};
`
const HeaderRight = styled.div`
  height: 40px;
  background: ${({ theme }) => theme.colors.white};
`

const USERS_WITHOUT_SEARCH = SYS_ADMIN_ROLES.concat(
  NATL_ADMIN_ROLES,
  PERFORMANCE_MANAGEMENT_ROLES
)

class HeaderComp extends React.Component<IFullProps, IState> {
  constructor(props: IFullProps) {
    super(props)

    this.state = {
      showLogoutModal: false
    }
  }

  getMobileHeaderActionProps(activeMenuItem: ACTIVE_MENU_ITEM, theme: ITheme) {
    const locationId = new URLSearchParams(this.props.location.search).get(
      'locationId'
    )
    if (activeMenuItem === ACTIVE_MENU_ITEM.PERFORMANCE) {
      return {
        mobileLeft: [
          {
            icon: () => <Hamburger />,
            handler: () => {}
          }
        ],
        mobileRight: [
          {
            icon: () => <Activity stroke={theme.colors.primary} />,
            handler: () =>
              this.props.mapPerformanceClickHandler &&
              this.props.mapPerformanceClickHandler()
          }
        ]
      }
    } else if (activeMenuItem === ACTIVE_MENU_ITEM.USERS) {
      if (this.props.changeTeamLocation) {
        return {
          mobileLeft: [
            {
              icon: () => <Hamburger />,
              handler: () => {}
            }
          ],
          mobileRight: [
            {
              icon: () => <SearchBlue />,
              handler: () =>
                this.props.changeTeamLocation && this.props.changeTeamLocation()
            },
            {
              icon: () => <AddUser />,
              handler: () => {
                if (locationId) {
                  this.props.goToCreateNewUserWithLocationId(locationId)
                } else {
                  this.props.goToCreateNewUser()
                }
              }
            }
          ]
        }
      } else if (
        this.props.userDetails?.role &&
        SYS_ADMIN_ROLES.includes(this.props.userDetails?.role)
      ) {
        return {
          mobileLeft: [
            {
              icon: () => <Hamburger />,
              handler: () => {}
            }
          ],
          mobileRight: [
            {
              icon: () => <AddUser />,
              handler: () => {
                if (locationId) {
                  this.props.goToCreateNewUserWithLocationId(locationId)
                } else {
                  this.props.goToCreateNewUser()
                }
              }
            }
          ]
        }
      } else {
        return {
          mobileLeft: [
            {
              icon: () => <Hamburger />,
              handler: () => {}
            }
          ]
        }
      }
    } else if (
      this.props.userDetails?.role &&
      USERS_WITHOUT_SEARCH.includes(this.props.userDetails?.role)
    ) {
      return {
        mobileLeft: [
          {
            icon: () => <Hamburger />,
            handler: () => {}
          }
        ]
      }
    } else {
      if (this.props.mobileSearchBar) {
        return {
          mobileLeft: [
            {
              icon: () => <HistoryNavigator hideForward />,
              handler: () => {}
            }
          ],
          mobileBody: this.renderSearchInput(this.props, true)
        }
      } else {
        return {
          mobileLeft: [
            {
              icon: () => <Hamburger />,
              handler: () => {}
            }
          ],
          mobileRight: [
            {
              icon: () => <SearchDark />,
              handler: () => this.props.goToSearch()
            }
          ]
        }
      }
    }
  }

  logout = () => {
    storage.removeItem(SCREEN_LOCK)
    this.props.redirectToAuthentication()
  }

  isLandingPage = () => {
    const role = this.props.userDetails && this.props.userDetails.role
    const location = this.props.history.location.pathname
    if (
      (FIELD_AGENT_ROLES.includes(role as string) && HOME.includes(location)) ||
      (NATL_ADMIN_ROLES.includes(role as string) &&
        PERFORMANCE_HOME.includes(location)) ||
      (SYS_ADMIN_ROLES.includes(role as string) &&
        PERFORMANCE_HOME.includes(location)) ||
      (REGISTRAR_ROLES.includes(role as string) &&
        REGISTRAR_HOME.includes(location))
    ) {
      return true
    } else {
      return false
    }
  }

  renderSearchInput(props: IFullProps, isMobile?: boolean) {
    const { intl, searchText, selectedSearchType, language } = props

    const searchTypeList: ISearchType[] = [
      {
        label: intl.formatMessage(constantsMessages.trackingId),
        value: TRACKING_ID_TEXT,
        icon: <Icon name="Target" size="small" />,
        invertIcon: <Icon name="Target" size="small" />,
        placeHolderText: intl.formatMessage(messages.placeHolderTrackingId),
        isDefault: true
      },
      {
        label: intl.formatMessage(messages.typeBrnDrn),
        value: BRN_DRN_TEXT,
        icon: <Icon name="Medal" size="small" />,
        invertIcon: <Icon name="Medal" size="small" />,
        placeHolderText: intl.formatMessage(messages.placeHolderBrnDrn)
      },
      {
        label: intl.formatMessage(messages.nationalId),
        value: NATIONAL_ID_TEXT,
        icon: <Icon name="CreditCard" size="small" />,
        invertIcon: <Icon name="CreditCard" />,
        placeHolderText: intl.formatMessage(messages.placeHolderNationalId)
      },
      {
        label: intl.formatMessage(messages.typePhone),
        value: PHONE_TEXT,
        icon: <Icon name="Phone" size="small" />,
        invertIcon: <Icon name="Phone" size="small" />,
        placeHolderText: intl.formatMessage(messages.placeHolderPhone)
      },
      {
        label: intl.formatMessage(messages.typeName),
        value: NAME_TEXT,
        icon: <Icon name="User" size="small" />,
        invertIcon: <Icon name="User" size="small" />,
        placeHolderText: intl.formatMessage(messages.placeholderName)
      }
    ]
    const navigationList: INavigationType[] = [
      {
        label: intl.formatMessage(messages.advancedSearch),
        id: ADVANCED_SEARCH_TEXT,
        onClick: () => {
          this.props.setAdvancedSearchParam(advancedSearchInitialState)
          this.props.goToAdvancedSearch()
        }
      }
    ]

    return (
      <Search
        key="searchMenu"
        language={language}
        searchText={searchText}
        selectedSearchType={selectedSearchType}
        searchTypeList={searchTypeList}
        navigationList={
          FIELD_AGENT_ROLES.includes(this.props.userDetails?.role as string)
            ? undefined
            : navigationList
        }
        searchHandler={(text, type) =>
          props.goToSearchResult(text, type, isMobile)
        }
      />
    )
  }

  goToTeamView(props: IFullProps) {
    const { userDetails, goToTeamUserListAction, goToTeamSearchAction } = props
    if (userDetails && userDetails.role) {
      if (NATL_ADMIN_ROLES.includes(userDetails.role)) {
        return goToTeamSearchAction()
      } else {
        return goToTeamUserListAction(
          (userDetails.primaryOffice && userDetails.primaryOffice.id) || ''
        )
      }
    }
  }

  goToPerformanceView(props: IFullProps) {
    const { userDetails, goToPerformanceHomeAction } = props
    if (userDetails && userDetails.role) {
      if (NATL_ADMIN_ROLES.includes(userDetails.role)) {
        return goToPerformanceHomeAction()
      } else {
        const locationId = getJurisdictionLocationIdFromUserDetails(userDetails)
        return (
          (locationId &&
            goToPerformanceHomeAction(
              undefined,
              undefined,
              Event.Birth,
              locationId
            )) ||
          goToPerformanceHomeAction()
        )
      }
    }
  }

  render() {
    const { className, intl, activeMenuItem, theme } = this.props

    const title =
      this.props.title ||
      intl.formatMessage(
        activeMenuItem === ACTIVE_MENU_ITEM.PERFORMANCE
          ? constantsMessages.performanceTitle
          : activeMenuItem === ACTIVE_MENU_ITEM.TEAM ||
            activeMenuItem === ACTIVE_MENU_ITEM.USERS
          ? messages.teamTitle
          : activeMenuItem === ACTIVE_MENU_ITEM.CERTIFICATE
          ? constantsMessages.certificateTitle
          : activeMenuItem === ACTIVE_MENU_ITEM.APPLICATION
          ? constantsMessages.applicationTitle
          : activeMenuItem === ACTIVE_MENU_ITEM.FORM
          ? constantsMessages.formDeclarationTitle
          : activeMenuItem === ACTIVE_MENU_ITEM.INTEGRATION
          ? constantsMessages.integrationTitle
          : constantsMessages.declarationTitle
      )

    let rightMenu = [
      {
        element: <HistoryNavigator />
      },
      {
        element: (
          <>
            {!(
              this.props.userDetails?.role &&
              USERS_WITHOUT_SEARCH.includes(this.props.userDetails?.role)
            ) && (
              <HeaderCenter>
                <StyledPrimaryButton
                  key="newEvent"
                  id="header_new_event"
                  onClick={this.props.goToEvents}
                  icon={() => <Plus />}
                />

                {this.renderSearchInput(this.props)}
              </HeaderCenter>
            )}
          </>
        )
      },
      {
        element: (
          <HeaderRight>
            <ProfileMenu key="profileMenu" />
          </HeaderRight>
        )
      }
    ]

    if (
      activeMenuItem !== ACTIVE_MENU_ITEM.DECLARATIONS &&
      (NATL_ADMIN_ROLES.includes(this.props.userDetails?.role as string) ||
        SYS_ADMIN_ROLES.includes(this.props.userDetails?.role as string))
    ) {
      rightMenu = [
        {
          element: <HistoryNavigator />
        },
        {
          element: <ProfileMenu key="profileMenu" />
        }
      ]
    }

    const mobileHeaderActionProps = this.getMobileHeaderActionProps(
      activeMenuItem,
      theme
    )

    const mobileHeaderActionPropsWithDefaults = {
      mobileRight: this.props.mobileRight,
      ...mobileHeaderActionProps
    }

    return (
      <AppHeader
        id="register_app_header"
        desktopRightMenu={rightMenu}
        className={className}
        title={title}
        {...mobileHeaderActionPropsWithDefaults}
      />
    )
  }
}

export const Header = connect(
  (store: IStoreState) => ({
    activeMenuItem: window.location.href.includes('performance')
      ? ACTIVE_MENU_ITEM.PERFORMANCE
      : window.location.href.includes(TEAM_USER_LIST)
      ? ACTIVE_MENU_ITEM.USERS
      : window.location.href.includes('team')
      ? ACTIVE_MENU_ITEM.TEAM
      : window.location.href.includes('config/certificate')
      ? ACTIVE_MENU_ITEM.CERTIFICATE
      : window.location.href.includes('config/application')
      ? ACTIVE_MENU_ITEM.APPLICATION
      : window.location.href.includes('config/form')
      ? ACTIVE_MENU_ITEM.FORM
      : window.location.href.includes('config/integration')
      ? ACTIVE_MENU_ITEM.INTEGRATION
      : ACTIVE_MENU_ITEM.DECLARATIONS,
    language: store.i18n.language,
    userDetails: getUserDetails(store)
  }),
  {
    redirectToAuthentication,
    goToSearchResult,
    goToSearch,
    goToSettings,
    goBack,
    goForward,
    goToEvents: goToEventsAction,
    goToPerformanceHomeAction: goToPerformanceHome,
    goToCreateNewUserWithLocationId,
    goToCreateNewUser,
    goToTeamSearchAction: goToTeamSearch,
    goToTeamUserListAction: goToTeamUserList,
    goToAdvancedSearch: goToAdvancedSearch,
    setAdvancedSearchParam: setAdvancedSearchParam
  }
)(injectIntl(withTheme(withRouter(HeaderComp))))

/** @deprecated since the introduction of `<Frame>` */
export const MarginedHeader = styled(Header)`
  margin-left: 249px;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-left: 0;
  }
`
