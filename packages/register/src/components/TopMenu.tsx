import * as React from 'react'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'

import { ArrowBack } from '@opencrvs/components/lib/icons'
import { ButtonIcon, PrimaryButton } from '@opencrvs/components/lib/buttons'

import styled from '../styled-components'
import { goBack as goBackAction } from 'src/navigation'
import { getLanguages } from 'src/i18n/selectors'
import { IStoreState } from 'src/store'
import { IntlState } from 'src/i18n/reducer'
import { changeLanguage as changeLanguageAction } from 'src/i18n/actions'
import { HamburgerMenu } from './HamburgerMenu'

const messages = defineMessages({
  back: {
    id: 'menu.back',
    defaultMessage: 'Back',
    description: 'Back button in the menu'
  },
  menu: {
    id: 'menu.menu',
    defaultMessage: 'Menu',
    description: 'Menu'
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
  /* stylelint-disable */
  ${ButtonIcon} {
    /* stylelint-enable */
    margin-left: 0em;
  }
`

const BackButtonText = styled.span`
  font-family: ${({ theme }) => theme.fonts.boldFont};
  text-transform: uppercase;
  font-size: 14px;
  letter-spacing: 2px;
  margin-left: 14px;
`

type Props = {
  hideBackButton?: true | false | undefined | null
  goBack: typeof goBackAction
  changeLanguage: typeof changeLanguageAction
  languages: IntlState['languages']
}

class TopMenuComponent extends React.Component<Props & InjectedIntlProps> {
  menuItems = [
    {
      title: 'Change Language',
      key: 'change-language',
      isSubMenu: true,
      menuItems: Object.keys(this.props.languages).map((lang: any) => ({
        title: lang,
        key: lang,
        onClick: this.props.changeLanguage.bind(null, { language: lang })
      }))
    },
    {
      title: 'Log out',
      key: 'logout'
    }
  ]

  render() {
    const { intl, goBack, hideBackButton } = this.props

    return (
      <TopMenuContainer>
        {!hideBackButton && (
          <BackButtonContainer onClick={goBack}>
            <BackButton icon={() => <ArrowBack />} />
            <BackButtonText>{intl.formatMessage(messages.back)}</BackButtonText>
          </BackButtonContainer>
        )}
        <HamburgerMenu menuItems={this.menuItems} />
      </TopMenuContainer>
    )
  }
}

export const TopMenu = connect(
  (state: IStoreState) => ({
    languages: getLanguages(state)
  }),
  { goBack: goBackAction, changeLanguage: changeLanguageAction }
)(injectIntl<Props>(TopMenuComponent))
