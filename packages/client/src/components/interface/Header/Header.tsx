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
import {
  goBack,
  goForward,
  goToEvents as goToEventsAction,
  goToHome,
  goToPerformanceHome,
  goToSearch,
  goToSearchResult,
  goToSettings,
  goToTeamSearch,
  goToTeamUserList
} from '@client/navigation'
import { redirectToAuthentication } from '@client/profile/profileActions'
import { getUserDetails } from '@client/profile/profileSelectors'
import { storage } from '@client/storage'
import { IStoreState } from '@client/store'
import { withTheme } from '@client/styledComponents'
import {
  BRN_DRN_TEXT,
  FIELD_AGENT_ROLES,
  NAME_TEXT,
  NATL_ADMIN_ROLES,
  PHONE_TEXT,
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
  Activity
} from '@opencrvs/components/lib/icons'
import {
  AppHeader,
  ExpandingMenu,
  ISearchType,
  SearchTool
} from '@opencrvs/components/lib/interface'
import { ITheme } from '@opencrvs/components/lib/theme'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import styled, { ThemeConsumer } from 'styled-components'
import { getJurisdictionLocationIdFromUserDetails } from '@client/views/SysAdmin/Performance/utils'
import { Navigation } from '@client/components/interface/Navigation'
import { Avatar } from '@client/components/Avatar'
import { RouteComponentProps, withRouter } from 'react-router'
import {
  HOME,
  PERFORMANCE_HOME,
  REGISTRAR_HOME
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
  goToHomeAction: typeof goToHome
  goToPerformanceHomeAction: typeof goToPerformanceHome

  goToTeamSearchAction: typeof goToTeamSearch
  goToTeamUserListAction: typeof goToTeamUserList
}

interface IProps extends RouteComponentProps {
  theme: ITheme
  activeMenuItem: ACTIVE_MENU_ITEM
  title?: string
  searchText?: string
  selectedSearchType?: string
  mobileSearchBar?: boolean
  enableMenuSelection?: boolean
  mapPinClickHandler?: () => void
  mapPerformanceClickHandler?: () => void
}

type IFullProps = IntlShapeProps &
  IStateProps &
  IDispatchProps &
  IProps &
  React.HTMLAttributes<HTMLDivElement>

interface IState {
  showMenu: boolean
  showLogoutModal: boolean
}

enum ACTIVE_MENU_ITEM {
  DECLARATIONS,
  CONFIG,
  PERFORMANCE,
  TEAM,
  USERS
}

const StyledPrimaryButton = styled(PrimaryButton)`
  width: 40px;
  height: 40px;
  border-radius: 100%;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
  &:hover {
    background: ${({ theme }) => theme.colors.indigoDark};
  }
  &:focus {
    background: ${({ theme }) => theme.colors.yellow};
  }
  &:active {
    background: ${({ theme }) => theme.colors.indigoDark};
  }
`

const SearchBox = styled.div`
  position: static;
  width: 664px;
  height: 40px;
  left: calc(50% - 624px / 2 + 24px);
  top: calc(50% - 40px / 2);
  background: ${({ theme }) => theme.colors.grey200};
  box-sizing: border-box;
  border-radius: 40px;
  margin: 0px 80px 0px 12px;
  &:hover {
    outline: 1px solid ${({ theme }) => theme.colors.grey600};
  }

  &:focus-within {
    outline: 1px solid ${({ theme }) => theme.colors.grey600};
    background: ${({ theme }) => theme.colors.white};
  }
  &:active {
    outline: 1px solid ${({ theme }) => theme.colors.grey600};
  }
  &:focus-within input {
    background: ${({ theme }) => theme.colors.white};
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.xl}px) {
    width: 100%;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    width: 100%;
    margin: auto;
  }
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
            <Navigation
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
    if (activeMenuItem === ACTIVE_MENU_ITEM.PERFORMANCE) {
      return {
        mobileLeft: {
          icon: () => this.hamburger(),
          handler: this.toggleMenu
        },
        mobileRight: {
          icon: () => <Activity stroke={theme.colors.primary} />,
          handler: () =>
            this.props.mapPerformanceClickHandler &&
            this.props.mapPerformanceClickHandler()
        }
      }
    } else if (
      this.props.userDetails?.role &&
      USERS_WITHOUT_SEARCH.includes(this.props.userDetails?.role)
    ) {
      return {
        mobileLeft: {
          icon: () => this.hamburger(),
          handler: this.toggleMenu
        }
      }
    } else if (activeMenuItem === ACTIVE_MENU_ITEM.USERS) {
      if (this.props.mapPinClickHandler) {
        return {
          mobileLeft: {
            icon: () => this.hamburger(),
            handler: this.toggleMenu
          },
          mobileRight: {
            icon: () => <Location inverse />,
            handler: () =>
              this.props.mapPinClickHandler && this.props.mapPinClickHandler()
          }
        }
      } else {
        return {
          mobileLeft: {
            icon: () => this.hamburger(),
            handler: this.toggleMenu
          }
        }
      }
    } else {
      if (this.props.mobileSearchBar) {
        return {
          mobileLeft: {
            icon: () => <ArrowBack />,
            handler: () => window.history.back()
          },
          mobileBody: this.renderSearchInput(this.props, true)
        }
      } else {
        return {
          mobileLeft: {
            icon: () => this.hamburger(),
            handler: this.toggleMenu
          },
          mobileRight: {
            icon: () => <SearchDark />,
            handler: () => this.props.goToSearch()
          }
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
        invertIcon: <TrackingID color="#4972BB" />,
        placeHolderText: intl.formatMessage(messages.placeHolderTrackingId),
        isDefault: true
      },
      {
        label: intl.formatMessage(messages.typeBrnDrn),
        value: BRN_DRN_TEXT,
        icon: <BRN />,
        invertIcon: <BRN color="#4972BB" />,
        placeHolderText: intl.formatMessage(messages.placeHolderBrnDrn)
      },
      {
        label: intl.formatMessage(messages.typePhone),
        value: PHONE_TEXT,
        icon: <Phone />,
        invertIcon: <Phone color="#4972BB" />,
        placeHolderText: intl.formatMessage(messages.placeHolderPhone)
      },
      {
        label: intl.formatMessage(messages.typeName),
        value: NAME_TEXT,
        icon: <User />,
        invertIcon: <User color="#4972BB" />,
        placeHolderText: intl.formatMessage(messages.placeholderName)
      }
    ]

    return (
      <SearchBox>
        <SearchTool
          key="searchMenu"
          language={language}
          searchText={searchText}
          selectedSearchType={selectedSearchType}
          searchTypeList={searchTypeList}
          searchHandler={(text, type) =>
            props.goToSearchResult(text, type, isMobile)
          }
        />
      </SearchBox>
    )
  }

  goToTeamView(props: IFullProps) {
    const { userDetails, goToTeamUserListAction, goToTeamSearchAction } = props
    if (userDetails && userDetails.role) {
      if (NATL_ADMIN_ROLES.includes(userDetails.role)) {
        return goToTeamSearchAction()
      } else {
        return goToTeamUserListAction({
          id: (userDetails.primaryOffice && userDetails.primaryOffice.id) || '',
          searchableText:
            (userDetails.primaryOffice && userDetails.primaryOffice.name) || '',
          displayLabel:
            (userDetails.primaryOffice && userDetails.primaryOffice.name) || ''
        })
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
    const { intl, activeMenuItem, theme } = this.props

    const title =
      this.props.title ||
      intl.formatMessage(
        activeMenuItem === ACTIVE_MENU_ITEM.PERFORMANCE
          ? constantsMessages.performanceTitle
          : activeMenuItem === ACTIVE_MENU_ITEM.TEAM ||
            activeMenuItem === ACTIVE_MENU_ITEM.USERS
          ? messages.teamTitle
          : activeMenuItem === ACTIVE_MENU_ITEM.CONFIG
          ? constantsMessages.configTitle
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
      : window.location.href.includes('team')
      ? ACTIVE_MENU_ITEM.TEAM
      : window.location.href.includes('config')
      ? ACTIVE_MENU_ITEM.CONFIG
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
    goToHomeAction: goToHome,
    goToPerformanceHomeAction: goToPerformanceHome,

    goToTeamSearchAction: goToTeamSearch,
    goToTeamUserListAction: goToTeamUserList
  }
)(injectIntl(withTheme(withRouter(HeaderComp))))
