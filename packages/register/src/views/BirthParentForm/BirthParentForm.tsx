import * as React from 'react'
import { connect } from 'react-redux'
import { defineMessages } from 'react-intl'

import { Tab, Tabs } from '@opencrvs/components/lib/interface'

import { ViewHeader } from '../../components/ViewHeader'
import { goToBirthRegistration } from '../../navigation/navigationActions'
import styled from '../../styled-components'

export const messages = defineMessages({})

const ViewHeaderWithTabs = styled(ViewHeader)`
  padding-bottom: 0;
  ${Tabs} {
    overflow-x: auto;
    width: 100%;
  }
`

class BirthParentFormView extends React.Component<{
  goToBirthRegistration: typeof goToBirthRegistration
}> {
  render() {
    return (
      <>
        <ViewHeaderWithTabs
          breadcrump="Informant: Parent"
          title="New Birth Registration"
        >
          <Tabs>
            <Tab active>Child</Tab>
            <Tab>Mother</Tab>
            <Tab>Father</Tab>
            <Tab>Informant</Tab>
            <Tab>Registration</Tab>
          </Tabs>
        </ViewHeaderWithTabs>
      </>
    )
  }
}

export const BirthParentForm = connect(null, { goToBirthRegistration })(
  BirthParentFormView
)
