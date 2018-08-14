import * as React from 'react'

import { defineMessages } from 'react-intl'
// import { InjectedIntlProps, defineMessages } from 'react-intl'
// import { InjectedFormProps } from 'redux-form'

import { HamburgerIcon } from '@opencrvs/components/lib/icons/Hamburger'
import { ArrowBackIcon } from '@opencrvs/components/lib/icons/ArrowBack'

import { Button, ButtonIcon } from '@opencrvs/components/lib/buttons/Button'

import styled from '../styled-components'

export const messages = defineMessages({})

const TopMenuContainer = styled.div`
  height: 90px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const MenuButton = styled(Button)`
  height: 100%;
  padding: 0 ${({ theme }) => theme.grid.margin}px;
  background: #4c68c1;
  text-transform: uppercase;
  font-size: 14px;
  letter-spacing: 2px;
  color: #fff;
`

const BackButtonContainer = styled.div`
  cursor: pointer;
  margin-left: ${({ theme }) => theme.grid.margin}px;
`

const BackButton = styled(Button)`
  width: 69px;
  height: 42px;
  background: ${({ theme }) => theme.colors.primary};
  justify-content: center;
  border-radius: 21px;

  ${ButtonIcon} {
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

export class TopMenu extends React.Component {
  render() {
    return (
      <TopMenuContainer>
        <BackButtonContainer>
          <BackButton icon={() => <ArrowBackIcon />} />
          <BackButtonText>Back</BackButtonText>
        </BackButtonContainer>
        <MenuButton icon={() => <HamburgerIcon />}>Menu</MenuButton>
      </TopMenuContainer>
    )
  }
}
