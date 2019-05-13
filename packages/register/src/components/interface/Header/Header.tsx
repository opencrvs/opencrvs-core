import * as React from 'react'
import {
  AppHeader,
  ExpandingMenu,
  SearchTool,
  ISearchType
} from '@opencrvs/components/lib/interface'
import {
  Hamburger,
  SearchDark,
  ApplicationBlack,
  ApplicationBlue,
  StatsBlack,
  StatsBlue,
  SettingsBlack,
  SettingsBlue,
  HelpBlack,
  HelpBlue,
  LogoutBlack,
  LogoutBlue,
  TrackingID,
  BRN,
  Phone
} from '@opencrvs/components/lib/icons'
import { LogoutConfirmation } from 'src/components/LogoutConfirmation'
import { storage } from 'src/storage'
import { SCREEN_LOCK } from 'src/components/ProtectedPage'
import { connect } from 'react-redux'
import { getUserDetails } from 'src/profile/profileSelectors'
import { IUserDetails } from '../../../utils/userUtils'
import { redirectToAuthentication } from 'src/profile/profileActions'
import { IStoreState } from 'src/store'
import { GQLHumanName } from '@opencrvs/gateway/src/graphql/schema'
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl'
import { goToHome, goToPerformance, goToSearchResult } from 'src/navigation'
import { ProfileMenu } from 'src/components/ProfileMenu'
import { TRACKING_ID_TEXT, BRN_DRN_TEXT, PHONE_TEXT } from 'src/utils/constants'

type IProps = InjectedIntlProps & {
  userDetails: IUserDetails
  redirectToAuthentication: typeof redirectToAuthentication
  language: string
  goToSearchResult: typeof goToSearchResult
}
interface IState {
  showMenu: boolean
  showLogoutModal: boolean
}

const messages = defineMessages({
  FIELD_AGENT: {
    id: 'register.home.header.FIELD_AGENT',
    defaultMessage: 'Field Agent',
    description: 'The description for FIELD_AGENT role'
  },
  REGISTRATION_CLERK: {
    id: 'register.home.header.REGISTRATION_CLERK',
    defaultMessage: 'Registration Clerk',
    description: 'The description for REGISTRATION_CLERK role'
  },
  LOCAL_REGISTRAR: {
    id: 'register.home.header.LOCAL_REGISTRAR',
    defaultMessage: 'Registrar',
    description: 'The description for LOCAL_REGISTRAR role'
  },
  DISTRICT_REGISTRAR: {
    id: 'register.home.header.DISTRICT_REGISTRAR',
    defaultMessage: 'District Registrar',
    description: 'The description for DISTRICT_REGISTRAR role'
  },
  STATE_REGISTRAR: {
    id: 'register.home.header.STATE_REGISTRAR',
    defaultMessage: 'State Registrar',
    description: 'The description for STATE_REGISTRAR role'
  },
  NATIONAL_REGISTRAR: {
    id: 'register.home.header.NATIONAL_REGISTRAR',
    defaultMessage: 'National Registrar',
    description: 'The description for NATIONAL_REGISTRAR role'
  },
  TYPE_TRACKING_ID: {
    id: 'register.home.header.searchType.trackingId',
    defaultMessage: 'Tracking ID',
    description: 'Search menu tracking id type'
  },
  TYPE_BRN_DRN: {
    id: 'register.home.header.searchType.brn_drn',
    defaultMessage: 'BRN/DRN',
    description: 'Search menu brn drn type'
  },
  TYPE_PHONE: {
    id: 'register.home.header.searchType.phone',
    defaultMessage: 'Phone No.',
    description: 'Search menu phone no type'
  },
  PLACE_HOLDER_TRACKING_ID: {
    id: 'register.home.header.searchType.placeHolder.trackingId',
    defaultMessage: 'Enter Tracking ID',
    description: 'Search menu tracking id place holder'
  },
  PLACE_HOLDER_BRN_DRN: {
    id: 'register.home.header.searchType.placeHolder.brn_drn',
    defaultMessage: 'Enter BRN/DRN',
    description: 'Search menu brn drn place holder'
  },
  PLACE_HOLDER_PHONE: {
    id: 'register.home.header.searchType.placeHolder.phone',
    defaultMessage: 'Enter Phone No.',
    description: 'Search menu phone no place holder'
  }
})

class HeaderComp extends React.Component<IProps, IState> {
  state = { showMenu: false, showLogoutModal: false }

  hamburger = () => {
    const { userDetails, language, intl } = this.props

    let name = ''
    if (userDetails && userDetails.name) {
      const nameObj = userDetails.name.find(
        (storedName: GQLHumanName) => storedName.use === language
      ) as GQLHumanName
      name = `${String(nameObj.firstNames)} ${String(nameObj.familyName)}`
    }

    const role =
      userDetails && userDetails.role
        ? intl.formatMessage(messages[userDetails.role])
        : ''

    const menuItems = [
      {
        icon: <ApplicationBlack />,
        iconHover: <ApplicationBlue />,
        label: 'Applications',
        onClick: goToHome
      },
      {
        icon: <StatsBlack />,
        iconHover: <StatsBlue />,
        label: 'Performance',
        onClick: goToPerformance
      },
      {
        icon: <SettingsBlack />,
        iconHover: <SettingsBlue />,
        label: 'Settings',
        onClick: () => alert('Settings')
      },
      {
        icon: <HelpBlack />,
        iconHover: <HelpBlue />,
        label: 'Help',
        onClick: () => alert('Help!')
      },
      {
        icon: <LogoutBlack />,
        iconHover: <LogoutBlue />,
        label: 'Logout',
        secondary: true,
        onClick: this.toggleLogoutModal
      }
    ]
    const userInfo = { name, role }

    return (
      <>
        <Hamburger />
        <ExpandingMenu
          menuItems={menuItems}
          userDetails={userInfo}
          showMenu={this.state.showMenu}
          menuCollapse={() => false}
        />
      </>
    )
  }

  logout = () => {
    storage.removeItem(SCREEN_LOCK)
    this.props.redirectToAuthentication()
  }

  toggleLogoutModal = () => {
    this.setState(state => ({
      showLogoutModal: !state.showLogoutModal,
      showMenu: false
    }))
  }

  toggleMenu = () => {
    this.setState(prevState => ({ showMenu: !prevState.showMenu }))
  }

  render() {
    const { intl } = this.props
    const menuItems = [
      {
        key: 'application',
        title: 'Application',
        onClick: goToHome,
        selected: true
      },
      {
        key: 'performance',
        title: 'Performance',
        onClick: goToPerformance,
        selected: false
      }
    ]

    const searchTypeList: ISearchType[] = [
      {
        label: intl.formatMessage(messages.TYPE_TRACKING_ID),
        value: TRACKING_ID_TEXT,
        icon: <TrackingID />,
        placeHolderText: intl.formatMessage(messages.PLACE_HOLDER_TRACKING_ID),
        isDefault: true
      },
      {
        label: intl.formatMessage(messages.TYPE_BRN_DRN),
        value: BRN_DRN_TEXT,
        icon: <BRN />,
        placeHolderText: intl.formatMessage(messages.PLACE_HOLDER_BRN_DRN)
      },
      {
        label: intl.formatMessage(messages.TYPE_PHONE),
        value: PHONE_TEXT,
        icon: <Phone />,
        placeHolderText: intl.formatMessage(messages.PLACE_HOLDER_PHONE)
      }
    ]

    const rightMenu = [
      {
        element: (
          <SearchTool
            key="searchMenu"
            searchTypeList={searchTypeList}
            searchHandler={this.props.goToSearchResult}
          />
        )
      },
      {
        element: <ProfileMenu key="profileMenu" />
      }
    ]

    return (
      <>
        <AppHeader
          menuItems={menuItems}
          id="register_app_header"
          desktopRightMenu={rightMenu}
          left={{
            icon: () => this.hamburger(),
            handler: this.toggleMenu
          }}
          title="Mobile header"
          right={{
            icon: () => <SearchDark />,
            handler: () => {
              alert('sdfsdf')
            }
          }}
        />
        <LogoutConfirmation
          show={this.state.showLogoutModal}
          handleClose={this.toggleLogoutModal}
          handleYes={this.logout}
        />
      </>
    )
  }
}

export const Header = connect(
  (store: IStoreState) => ({
    language: store.i18n.language,
    userDetails: getUserDetails(store)
  }),
  {
    redirectToAuthentication,
    goToSearchResult
  }
)(injectIntl<IProps>(HeaderComp))
