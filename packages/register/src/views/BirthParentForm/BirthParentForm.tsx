import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { connect } from 'react-redux'
import { defineMessages } from 'react-intl'
import { withFormik } from 'formik'

import { Tab, Tabs, Box } from '@opencrvs/components/lib/interface'
import { InputField } from '@opencrvs/components/lib/forms'

import { ViewHeader } from '../../components/ViewHeader'
import { goToTab as goToTabAction } from '../../navigation/navigationActions'
import styled from '../../styled-components'
import { birthParentForm } from '../../forms/birth-parent'
import { IFormField, IForm } from '@opencrvs/register/src/forms'

export const messages = defineMessages({})

const FormContainer = styled.div`
  padding: 35px 25px;
`

const ViewHeaderWithTabs = styled(ViewHeader)`
  padding-bottom: 0;
  ${Tabs} {
    overflow-x: auto;
    width: 100%;
  }
`

const FormItem = styled.div`
  margin-bottom: 2em;
`

const FormSectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.lightFont};
`

const FormSection = ({
  handleSubmit,
  fields,
  title
}: {
  handleSubmit: () => void
  fields: IFormField[]
  title: string
}) => {
  return (
    <Box>
      <section>
        <FormSectionTitle id="form_section_title">{title}</FormSectionTitle>
        <form onSubmit={handleSubmit}>
          {fields.map(field => {
            return (
              <FormItem key={`${field.name}`}>
                <InputField
                  id={field.name}
                  type={field.type}
                  label={field.label}
                />
              </FormItem>
            )
          })}
        </form>
      </section>
    </Box>
  )
}

const Form = withFormik<{ fields: IFormField[]; title: string }, any>({
  handleSubmit: values => {
    console.log(values)
  }
})(FormSection)

function getActiveTabId(form: IForm, viewParams: { tab?: string }) {
  return viewParams.tab || form.sections[0].id
}

interface IFormTabProps {
  form: IForm
  activeTabId: string
  onTabClick: (tabId: string) => void
}

function FormTabs({ form, activeTabId, onTabClick }: IFormTabProps) {
  return (
    <Tabs>
      {form.sections.map(({ name, id }) => (
        <Tab
          id={`tab_${id}`}
          onClick={() => onTabClick(id)}
          key={id}
          active={activeTabId === id}
        >
          {name}
        </Tab>
      ))}
    </Tabs>
  )
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
            form={birthParentForm}
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
