import * as React from 'react'

import { defineMessages } from 'react-intl'

import { ArrowWithGradient } from '@opencrvs/components/lib/icons'
import { Action, ActionList } from '@opencrvs/components/lib/buttons'

import { ViewHeader } from '../../components/ViewHeader'

export const messages = defineMessages({})

export class SelectInformant extends React.Component {
  render() {
    return (
      <>
        <ViewHeader
          breadcrump="New birth registration"
          title="Who is the informant?"
          description="Tell us who is providing the details, and check what information is needed to submit the form."
        />
        <ActionList>
          <Action
            title="Parent"
            description="Required: Details of the child, mother and informant. Optional: Details of the father."
            icon={() => <ArrowWithGradient />}
          />
          <Action
            title="Someone else"
            description="Required: Details of the child and informant. Optional: Details of the mother/father."
            icon={() => <ArrowWithGradient />}
          />
          <Action
            title="Self (18+)"
            description="Required: Details of the individual and informant. Optional: Details of the mother/father."
            icon={() => <ArrowWithGradient />}
          />
        </ActionList>
      </>
    )
  }
}
