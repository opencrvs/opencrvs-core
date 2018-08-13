import * as React from 'react'
import styled from 'styled-components'
import { defineMessages } from 'react-intl'
// import { InjectedIntlProps, defineMessages } from 'react-intl'
// import { InjectedFormProps } from 'redux-form'

import { Header } from '@opencrvs/components/lib/Header'
import { HamburgerIcon } from '@opencrvs/components/lib/icons/Hamburger'
import { ArrowBackIcon } from '@opencrvs/components/lib/icons/ArrowBack'
import { ArrowWithGradientIcon } from '@opencrvs/components/lib/icons/ArrowWithGradient'
import {
  Button,
  ButtonIcon,
  IButtonProps
} from '@opencrvs/components/lib/buttons/Button'
export const messages = defineMessages({})

const TopMenu = styled.div`
  height: 90px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const MenuButton = styled(Button)`
  height: 100%;
  padding: 0 25px;
  background: #4c68c1;
  text-transform: uppercase;
  font-size: 14px;
  color: #fff;
  letter-spacing: 2px;
`

const BackButton = styled(Button).attrs<IButtonProps>({})`
  width: 69px;
  height: 42px;
  margin-left: 25px;
  background: ${({ theme }) => theme.colors.primary};
  justify-content: center;
  border-radius: 21px;
  /* TODO 1. */
  ${ButtonIcon} {
    margin-left: 0em;
  }
`

const ViewTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.lightFont};
  margin: 0;
`
const ViewDescription = styled.p`
  font-family: ${({ theme }) => theme.fonts.lightFont};
  margin: 0;
  margin-top: 5px;
`
const ViewHeading = styled.div`
  padding: 26px;
`

const StretchedHeader = styled(Header)`
  justify-content: flex-end;

  /* Maybe global style? */
  display: flex;
  flex-direction: column;
  /* padding: 25px; */
  padding-bottom: 50px;
`
const Actions = styled.div`
  z-index: 1;
  margin-top: -50px;
  position: relative;
  padding: 0 25px;
`

const Action = styled(Button).attrs<IButtonProps>({})`
  height: 96px;
  padding: 0 2em; /* ? */
  background: #fff;

  color: #fff;
  width: 100%;
  text-align: left;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 10px;
`
const ActionTitle = styled.h3`
  color: #526dc3;
  font-family: ${({ theme }) => theme.fonts.lightFont};
  font-size: 24px;
  margin: 0;
`

export class Home extends React.Component<{}> {
  render() {
    return (
      <div>
        <StretchedHeader>
          <TopMenu>
            {/* TODO */}
            {/* tslint:disable-next-line jsx-no-lambda */}
            <BackButton icon={() => <ArrowBackIcon />} />
            {/* tslint:disable-next-line jsx-no-lambda */}
            <MenuButton icon={() => <HamburgerIcon />}>Menu</MenuButton>
          </TopMenu>
          <ViewHeading>
            <ViewTitle>Register a new vital event</ViewTitle>
            <ViewDescription>
              Start by selecting the event you want to register.
            </ViewDescription>
          </ViewHeading>
        </StretchedHeader>
        <Actions>
          {/* tslint:disable-next-line jsx-no-lambda */}
          <Action icon={() => <ArrowWithGradientIcon />}>
            <ActionTitle>Birth</ActionTitle>
          </Action>
          {/* tslint:disable-next-line jsx-no-lambda */}
          <Action icon={() => <ArrowWithGradientIcon />}>
            <ActionTitle>Death</ActionTitle>
          </Action>
        </Actions>
      </div>
    )
  }
}
