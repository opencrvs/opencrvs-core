import * as React from 'react'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'

import { Hamburger, ArrowBack } from '@opencrvs/components/lib/icons'
import { ButtonIcon, PrimaryButton } from '@opencrvs/components/lib/buttons'

import styled from '../styled-components'

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

const MenuButton = styled(PrimaryButton)`
  height: 100%;
  background: ${({ theme }) => theme.colors.primary};
  padding: 0 30px;
  text-transform: uppercase;
  font-size: 14px;
  letter-spacing: 2px;
  color: ${({ theme }) => theme.colors.white};
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

class TopMenuComponent extends React.Component<InjectedIntlProps> {
  render() {
    const { intl } = this.props
    return (
      <TopMenuContainer>
        <BackButtonContainer>
          <BackButton icon={() => <ArrowBack />} />
          <BackButtonText>{intl.formatMessage(messages.back)}</BackButtonText>
        </BackButtonContainer>
        <MenuButton icon={() => <Hamburger />}>
          {intl.formatMessage(messages.menu)}
        </MenuButton>
      </TopMenuContainer>
    )
  }
}

export const TopMenu = injectIntl<{}>(TopMenuComponent)
