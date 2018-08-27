import * as React from 'react'
import { defineMessages } from 'react-intl'

import { Hamburger, ArrowBack } from '@opencrvs/components/lib/icons'
import { ButtonIcon, PrimaryButton } from '@opencrvs/components/lib/buttons'

import styled from '../styled-components'

export const messages = defineMessages({})

const TopMenuContainer = styled.div`
  height: 90px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const MenuButton = styled(PrimaryButton)`
  height: 100%;
  padding: 0 ${({ theme }) => theme.grid.margin}px;
  background: ${({ theme }) => theme.colors.primary};
  text-transform: uppercase;
  font-size: 14px;
  letter-spacing: 2px;
  color: $white;
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

export class TopMenu extends React.Component {
  render() {
    return (
      <TopMenuContainer>
        <BackButtonContainer>
          <BackButton icon={() => <ArrowBack />} />
          <BackButtonText>Back</BackButtonText>
        </BackButtonContainer>
        <MenuButton icon={() => <Hamburger />}>Menu</MenuButton>
      </TopMenuContainer>
    )
  }
}
