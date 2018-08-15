import * as React from 'react'

import { defineMessages } from 'react-intl'

import { ArrowWithGradient } from '@opencrvs/components/lib/icons'
import { Action, ActionList } from '@opencrvs/components/lib/buttons'

import { ViewHeader } from '../../components/ViewHeader'

export const messages = defineMessages({})

export class SelectVitalEvent extends React.Component {
  render() {
    return (
      <>
        <ViewHeader
          title="Register a new vital event"
          description="Start by selecting the event you want to register."
        />
        <ActionList>
          <Action title="Birth" icon={() => <ArrowWithGradient />} />
          <Action title="Death" icon={() => <ArrowWithGradient />} />
        </ActionList>
      </>
    )
  }
}
