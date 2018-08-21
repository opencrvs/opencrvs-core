import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { connect } from 'react-redux'
import { defineMessages } from 'react-intl'

import styled from '../../styled-components'

import { goToTab as goToTabAction } from '../../navigation/navigationActions'
import { birthParentForm } from '../../forms/birth-parent'
import { IForm } from '../../forms'
import { Form, FormTabs, ViewHeaderWithTabs } from '../../components/form'

export const messages = defineMessages({})

const FormContainer = styled.div`
  padding: 35px 25px;
`

function getActiveTabId(form: IForm, viewParams: { tab?: string }) {
  return viewParams.tab || form.sections[0].id
}

class BirthParentFormView extends React.Component<
  {
    goToTab: typeof goToTabAction
  } & RouteComponentProps<{ tab: string }>
> {
  render() {
    const { match, goToTab } = this.props

    const activeTabId = getActiveTabId(birthParentForm, this.props.match.params)
    const activeTab = birthParentForm.sections.find(
      ({ id }) => id === activeTabId
    )

    if (!activeTab) {
      throw new Error(`Configuration for tab "${match.params.tab}" missing!`)
    }

    return (
      <>
        <ViewHeaderWithTabs
          breadcrump="Informant: Parent"
          title="New Birth Registration"
        >
          <FormTabs
            sections={birthParentForm.sections}
            activeTabId={activeTabId}
            onTabClick={goToTab}
          />
        </ViewHeaderWithTabs>
        <FormContainer>
          <Form title={activeTab.title} fields={activeTab.fields} />
        </FormContainer>
      </>
    )
  }
}

export const BirthParentForm = connect(null, { goToTab: goToTabAction })(
  BirthParentFormView
)
