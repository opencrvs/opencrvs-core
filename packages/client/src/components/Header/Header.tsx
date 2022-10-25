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
import { constantsMessages, userMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/header'
// import { Icon } from '@opencrvs/components/lib/Icon'
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
import { getIndividualNameObj, IUserDetails } from '@client/utils/userUtils'
import { CircleButton, PrimaryButton } from '@opencrvs/components/lib/buttons'
import {
  ArrowBack,
  BackArrowDeepBlue,
  ForwardArrowDeepBlue,
  BRN,
  Location,
  Phone,
  Plus,
  SearchDark,
  TrackingID,
  User,
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
import { ExpandingMenu } from '@opencrvs/components/lib/ExpandingMenu'
import { ITheme } from '@opencrvs/components/lib/theme'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import styled, { ThemeConsumer } from 'styled-components'
import { getJurisdictionLocationIdFromUserDetails } from '@client/views/SysAdmin/Performance/utils'
import { FixedNavigation } from '@client/components/interface/Navigation'
import { Avatar } from '@client/components/Avatar'
import { RouteComponentProps, withRouter } from 'react-router'
import {
  HOME,
  PERFORMANCE_HOME,
  REGISTRAR_HOME,
  TEAM_USER_LIST
} from '@client/navigation/routes'

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
}

type IFullProps = IntlShapeProps &
  IStateProps &
  IDispatchProps &
  IProps &
  IDomProps

interface IState {
  showMenu: boolean
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
  FORM
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
const HeaderLeft = styled.div`
  height: 40px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
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
      showMenu: false,
      showLogoutModal: false
    }
  }

  hamburger = () => {
    const { userDetails, language, intl } = this.props
    let name = ''
    if (userDetails && userDetails.name) {
      const nameObj = getIndividualNameObj(userDetails.name, language)
      name = nameObj
        ? `${String(nameObj.firstNames)} ${String(nameObj.familyName)}`
        : ''
    }

    const role =
      userDetails && userDetails.role
        ? intl.formatMessage(userMessages[userDetails.role])
        : ''

    const avatar = <Avatar name={name} avatar={userDetails?.avatar} />

    const userInfo = { name, role, avatar }

    return (
      <>
        <ExpandingMenu
          showMenu={this.state.showMenu}
          menuCollapse={() => this.toggleMenu()}
          navigation={() => (
            <FixedNavigation
              navigationWidth={320}
              menuCollapse={() => this.toggleMenu()}
              userInfo={userInfo}
            />
          )}
        />
      </>
    )
  }

  getMobileHeaderActionProps(activeMenuItem: ACTIVE_MENU_ITEM, theme: ITheme) {
    const locationId = new URLSearchParams(this.props.location.search).get(
      'locationId'
    )
    if (activeMenuItem === ACTIVE_MENU_ITEM.PERFORMANCE) {
      return {
        mobileLeft: [
          {
            icon: () => this.hamburger(),
            handler: this.toggleMenu
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
              icon: () => this.hamburger(),
              handler: this.toggleMenu
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
              icon: () => this.hamburger(),
              handler: this.toggleMenu
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
              icon: () => this.hamburger(),
              handler: this.toggleMenu
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
            icon: () => this.hamburger(),
            handler: this.toggleMenu
          }
        ]
      }
    } else {
      if (this.props.mobileSearchBar) {
        return {
          mobileLeft: [
            {
              icon: () => <ArrowBack />,
              handler: () => window.history.back()
            }
          ],
          mobileBody: this.renderSearchInput(this.props, true)
        }
      } else {
        return {
          mobileLeft: [
            {
              icon: () => this.hamburger(),
              handler: this.toggleMenu
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
      (FIELD_AGENT_ROLES.includes(role as string) && location.includes(HOME)) ||
      (NATL_ADMIN_ROLES.includes(role as string) &&
        location.includes(PERFORMANCE_HOME)) ||
      (SYS_ADMIN_ROLES.includes(role as string) &&
        location.includes(PERFORMANCE_HOME)) ||
      (REGISTRAR_ROLES.includes(role as string) &&
        location.includes(REGISTRAR_HOME))
    ) {
      return true
    } else {
      return false
    }
  }

  toggleMenu = () => {
    this.setState((prevState) => ({ showMenu: !prevState.showMenu }))
  }

  renderSearchInput(props: IFullProps, isMobile?: boolean) {
    const { intl, searchText, selectedSearchType, language } = props

    const searchTypeList: ISearchType[] = [
      {
        label: intl.formatMessage(constantsMessages.trackingId),
        value: TRACKING_ID_TEXT,
        icon: <TrackingID />,
        invertIcon: <TrackingID />,
        placeHolderText: intl.formatMessage(messages.placeHolderTrackingId),
        isDefault: true
      },
      {
        label: intl.formatMessage(messages.typeBrnDrn),
        value: BRN_DRN_TEXT,
        icon: <BRN />,
        invertIcon: <BRN />,
        placeHolderText: intl.formatMessage(messages.placeHolderBrnDrn)
      },
      {
        label: intl.formatMessage(messages.nationalId),
        value: NATIONAL_ID_TEXT,
        icon: <User />,
        invertIcon: <User />,
        placeHolderText: intl.formatMessage(messages.placeHolderNationalId)
      },
      {
        label: intl.formatMessage(messages.typePhone),
        value: PHONE_TEXT,
        icon: <Phone />,
        invertIcon: <Phone />,
        placeHolderText: intl.formatMessage(messages.placeHolderPhone)
      },
      {
        label: intl.formatMessage(messages.typeName),
        value: NAME_TEXT,
        icon: <User />,
        invertIcon: <User />,
        placeHolderText: intl.formatMessage(messages.placeholderName)
      }
    ]
    const navigationList: INavigationType[] = [
      {
        label: intl.formatMessage(messages.advancedSearch),
        id: ADVANCED_SEARCH_TEXT,
        onClick: () => this.props.goToAdvancedSearch()
      }
    ]

    return (
      <Search
        key="searchMenu"
        language={language}
        searchText={searchText}
        selectedSearchType={selectedSearchType}
        searchTypeList={searchTypeList}
        navigationList={navigationList}
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
            goToPerformanceHomeAction(undefined, undefined, locationId)) ||
          goToPerformanceHomeAction()
        )
      }
    }
  }

  arrowNavigator() {
    return (
      <HeaderLeft>
        <CircleButton
          id="header-go-back-button"
          disabled={
            (this.props.history.action === 'POP' ||
              this.props.history.action === 'REPLACE') &&
            this.isLandingPage()
          }
          onClick={() => this.props.goBack()}
        >
          <BackArrowDeepBlue />
        </CircleButton>
        <CircleButton
          disabled={
            this.props.history.action === 'PUSH' ||
            this.props.history.action === 'REPLACE'
          }
          onClick={() => this.props.goForward()}
        >
          <ForwardArrowDeepBlue />
        </CircleButton>
      </HeaderLeft>
    )
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
          : constantsMessages.declarationTitle
      )

    let rightMenu = [
      {
        element: this.arrowNavigator()
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
          element: this.arrowNavigator()
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

    return (
      <AppHeader
        id="register_app_header"
        desktopRightMenu={rightMenu}
        className={className}
        title={title}
        {...mobileHeaderActionProps}
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
    goToAdvancedSearch: goToAdvancedSearch
  }
)(injectIntl(withTheme(withRouter(HeaderComp))))

/** @deprecated since the introduction of `<Frame>` */
export const MarginedHeader = styled(Header)`
  margin-left: 249px;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-left: 0;
  }
`
