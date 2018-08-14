import * as React from 'react'

import { defineMessages } from 'react-intl'

import { Header } from '@opencrvs/components/lib/Header'
import { ArrowWithGradientIcon } from '@opencrvs/components/lib/icons/ArrowWithGradient'
import { Action, ActionList } from '@opencrvs/components/lib/buttons/ActionList'

import styled from '../styled-components'
import { TopMenu } from '../components/TopMenu'
import { ViewHeading } from '../components/ViewHeading'

export const messages = defineMessages({})

const StretchedHeader = styled(Header)`
  justify-content: flex-end;
  padding-bottom: 50px;
`
const ActionListStyled = styled(ActionList)`
  margin-top: -50px;
`

export class Home extends React.Component {
  render() {
    return (
      <>
        <StretchedHeader>
          <TopMenu />
          <ViewHeading
            title="Register a new vital event"
            description="Start by selecting the event you want to register."
          />
        </StretchedHeader>
        <ActionListStyled>
          <Action title="Birth" icon={() => <ArrowWithGradientIcon />} />
          <Action title="Death" icon={() => <ArrowWithGradientIcon />} />
        </ActionListStyled>
      </>
    )
  }
}
