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
import styled from 'styled-components'
import { Hamburger } from './Hamburger'
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
import { Event } from '@client/utils/gateway'
import { UserDetails } from '@client/utils/userUtils'
import { Button } from '@opencrvs/components/lib/Button'

import { AppHeader, IDomProps } from '@opencrvs/components/lib/AppHeader'
import {
  SearchTool,
  ISearchType,
  INavigationType
} from '@opencrvs/components/lib/SearchTool'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
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
import { getRegisterForm } from '@client/forms/register/declaration-selectors'

type IStateProps = {
  userDetails: UserDetails | null
  fieldNames: string[]
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
  INTEGRATION,
  VSEXPORTS
}

const Search = styled(SearchTool)`
  margin-right: 45px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin: 0;
  }
`

const HeaderCenter = styled.div`
  height: 40px;
  gap: 12px;
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

  getMobileHeaderActionProps(activeMenuItem: ACTIVE_MENU_ITEM) {
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
            icon: () => <Icon name="Activity" size="medium" color="primary" />,
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
              icon: () => (
                <Icon name="MagnifyingGlass" size="medium" color="primary" />
              ),
              handler: () =>
                this.props.changeTeamLocation && this.props.changeTeamLocation()
            },
            {
              icon: () => (
                <Icon name="UserPlus" size="medium" color="primary" />
              ),
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
        this.props.userDetails?.systemRole &&
        SYS_ADMIN_ROLES.includes(this.props.userDetails?.systemRole)
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
              icon: () => (
                <Icon name="UserPlus" size="medium" color="primary" />
              ),
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
      this.props.userDetails?.systemRole &&
      USERS_WITHOUT_SEARCH.includes(this.props.userDetails?.systemRole)
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
              icon: () => (
                <Icon name="MagnifyingGlass" size="medium" color="primary" />
              ),
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
    const role = this.props.userDetails && this.props.userDetails.systemRole
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
    const { intl, searchText, selectedSearchType, language, fieldNames } = props

    const searchTypeList: ISearchType[] = [
      {
        label: intl.formatMessage(constantsMessages.trackingId),
        value: TRACKING_ID_TEXT,
        icon: <Icon name="Target" size="small" />,
        placeHolderText: intl.formatMessage(messages.placeHolderTrackingId),
        isDefault: true
      },
      {
        label: intl.formatMessage(messages.typeRN),
        value: BRN_DRN_TEXT,
        icon: <Icon name="Medal" size="small" />,
        placeHolderText: intl.formatMessage(messages.placeHolderBrnDrn)
      },
      {
        label: intl.formatMessage(messages.typeName),
        value: NAME_TEXT,
        icon: <Icon name="User" size="small" />,
        placeHolderText: intl.formatMessage(messages.placeholderName)
      }
    ]

    if (fieldNames.includes('registrationPhone')) {
      searchTypeList.splice(3, 0, {
        label: intl.formatMessage(messages.typePhone),
        value: PHONE_TEXT,
        icon: <Icon name="Phone" size="small" />,
        placeHolderText: intl.formatMessage(messages.placeHolderPhone)
      })
    }
    if (
      fieldNames.includes('iD') ||
      fieldNames.includes('deceasedID') ||
      fieldNames.includes('informantID')
    ) {
      searchTypeList.splice(2, 0, {
        label: intl.formatMessage(messages.nationalId),
        value: NATIONAL_ID_TEXT,
        icon: <Icon name="IdentificationCard" size="small" />,
        placeHolderText: intl.formatMessage(messages.placeHolderNationalId)
      })
    }

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
          FIELD_AGENT_ROLES.includes(
            this.props.userDetails?.systemRole as string
          )
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
    if (userDetails && userDetails.systemRole) {
      if (NATL_ADMIN_ROLES.includes(userDetails.systemRole)) {
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
    if (userDetails && userDetails.systemRole) {
      if (NATL_ADMIN_ROLES.includes(userDetails.systemRole)) {
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
    const { className, intl, activeMenuItem } = this.props

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
          : activeMenuItem === ACTIVE_MENU_ITEM.VSEXPORTS
          ? constantsMessages.vsExportTitle
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
              this.props.userDetails?.systemRole &&
              USERS_WITHOUT_SEARCH.includes(this.props.userDetails?.systemRole)
            ) && (
              <HeaderCenter>
                <Button
                  type="iconPrimary"
                  size="medium"
                  key="newEvent"
                  id="header_new_event"
                  onClick={this.props.goToEvents}
                >
                  <Icon name="Plus" size="medium" />
                </Button>

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
      (NATL_ADMIN_ROLES.includes(
        this.props.userDetails?.systemRole as string
      ) ||
        SYS_ADMIN_ROLES.includes(this.props.userDetails?.systemRole as string))
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

    const mobileHeaderActionProps =
      this.getMobileHeaderActionProps(activeMenuItem)

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
      : window.location.href.includes('vsexports')
      ? ACTIVE_MENU_ITEM.VSEXPORTS
      : ACTIVE_MENU_ITEM.DECLARATIONS,
    language: store.i18n.language,
    userDetails: getUserDetails(store),
    fieldNames: Object.values(getRegisterForm(store))
      .flatMap((form) => form.sections)
      .flatMap((section) => section.groups)
      .flatMap((group) => group.fields)
      .map((field) => field.name)
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
)(injectIntl(withRouter(HeaderComp)))

/** @deprecated since the introduction of `<Frame>` */
export const MarginedHeader = styled(Header)`
  margin-left: 282px;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-left: 0;
  }
`
