import * as React from 'react'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { Scope } from '@register/utils/authUtils'
import { ArrowBack } from '@opencrvs/components/lib/icons'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { getScope } from '@register/profile/profileSelectors'
import styled from '@register/styledComponents'
import {
  goBack as goBackAction,
  goToHome as goToHomeAction,
  goToPerformance as goToPerformanceAction
} from '@register/navigation'
import { redirectToAuthentication } from '@register/profile/profileActions'
import { getLanguages } from '@register/i18n/selectors'
import { IStoreState } from '@register/store'
import { IntlState } from '@register/i18n/reducer'
import { changeLanguage as changeLanguageAction } from '@register/i18n/actions'
import { HamburgerMenu } from '@opencrvs/components/lib/interface'

const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  back: {
    id: 'menu.back',
    defaultMessage: 'Back',
    description: 'Back button in the menu'
  },
  menu: {
    id: 'menu.menu',
    defaultMessage: 'Menu',
    description: 'Menu'
  },
  homepage: {
    id: 'menu.items.homepage',
    defaultMessage: 'Homepage',
    description: 'Menu item homepage'
  },
  performance: {
    id: 'menu.items.performance',
    defaultMessage: 'Performance',
    description: 'Menu item performance'
  },
  register: {
    id: 'menu.items.register',
    defaultMessage: 'Register',
    description: 'Menu item register'
  },
  drafts: {
    id: 'menu.items.drafts',
    defaultMessage: 'Drafts',
    description: 'Menu item drafts'
  },
  settings: {
    id: 'menu.items.settings',
    defaultMessage: 'Settings',
    description: 'Menu item settings'
  },
  logout: {
    id: 'menu.items.logout',
    defaultMessage: 'Log out',
    description: 'Menu item logout'
  },
  changeLanguage: {
    id: 'menu.items.changeLanguage',
    defaultMessage: 'Change Language',
    description: 'Menu item changeLanguage'
  },
  english: {
    id: 'menu.items.changeLanguage.english',
    defaultMessage: 'English',
    description: 'Menu item english'
  },
  bengali: {
    id: 'menu.items.changeLanguage.bengali',
    defaultMessage: 'Bengali',
    description: 'Menu item bengali'
  }
})

const TopMenuContainer = styled.div`
  height: 90px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const BackButtonContainer = styled.div`
  cursor: pointer;
  margin-left: ${({ theme }) => theme.grid.margin}px;
`

const BackButton = styled(PrimaryButton)`
  width: 69px;
  height: 42px;
  background: ${({ theme }) => theme.colors.primary};
  justify-content: center;
  border-radius: 21px;
`

const BackButtonText = styled.span`
  ${({ theme }) => theme.fonts.bodyBoldStyle};
  text-transform: uppercase;
  margin-left: 14px;
`

type Props = {
  hideBackButton?: true | false | undefined | null
  goBack: typeof goBackAction
  goToHome: typeof goToHomeAction
  goToPerformance: typeof goToPerformanceAction
  changeLanguage: typeof changeLanguageAction
  redirectToAuthentication: typeof redirectToAuthentication
  languages: IntlState['languages']
  userScope: Scope | null
}

interface IState {
  showLogoutModal: boolean
}
type IFullProps = Props & InjectedIntlProps

class TopMenuComponent extends React.Component<IFullProps, IState> {
  goToPerformance = () => {
    this.props.goToPerformance()
  }
  goToHome = () => {
    this.props.goToHome()
  }
  render() {
    const { intl, goBack, hideBackButton, userScope } = this.props

    const menuItems = [
      {
        title: intl.formatMessage(messages.changeLanguage),
        key: 'change-language',
        isSubMenu: true,
        menuItems: [
          {
            title: 'English',
            key: 'english',
            onClick: this.props.changeLanguage.bind(null, { language: 'en' })
          },
          {
            title: 'বাংলা',
            key: 'bengali',
            onClick: this.props.changeLanguage.bind(null, { language: 'bn' })
          }
        ]
      },
      {
        title: intl.formatMessage(messages.homepage),
        key: 'homepage',
        onClick: this.goToHome
      },
      {
        title: intl.formatMessage(messages.logout),
        key: 'logout',
        onClick: this.props.redirectToAuthentication
      }
    ]
    if ((userScope && userScope.indexOf('performance')) !== -1) {
      menuItems
        .splice(2, 0, {
          title: intl.formatMessage(messages.performance),
          key: 'performance',
          onClick: this.goToPerformance
        })
        .join()
    }

    return (
      <TopMenuContainer>
        {!hideBackButton && (
          <BackButtonContainer onClick={goBack}>
            <BackButton icon={() => <ArrowBack />} />
            <BackButtonText>{intl.formatMessage(messages.back)}</BackButtonText>
          </BackButtonContainer>
        )}
        <HamburgerMenu
          menuItems={menuItems}
          menuTitle={intl.formatMessage(messages.menu)}
        />
      </TopMenuContainer>
    )
  }
}

export const TopMenu = connect(
  (state: IStoreState) => ({
    languages: getLanguages(state),
    userScope: getScope(state),
    language: state.i18n.language
  }),
  {
    goToHome: goToHomeAction,
    goToPerformance: goToPerformanceAction,
    goBack: goBackAction,
    changeLanguage: changeLanguageAction,
    redirectToAuthentication
  }
)(injectIntl<IFullProps>(TopMenuComponent))
