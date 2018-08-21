import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { connect } from 'react-redux'
import { defineMessages } from 'react-intl'
import { withFormik } from 'formik'

import { Tab, Tabs, Box } from '@opencrvs/components/lib/interface'
import { InputField } from '@opencrvs/components/lib/forms'

import { ViewHeader } from '../../components/ViewHeader'
import { goToTab } from '../../navigation/navigationActions'
import styled from '../../styled-components'
import { birthParentForm } from '../../forms/birth-parent'
import { IFormField, IFormTab } from '@opencrvs/register/src/forms'

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

const FormSectionWrapper = styled.section``

const FormSectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.lightFont};
`

interface IFormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
}

const FormSection = ({ title, children }: IFormSectionProps) => {
  return (
    <FormSectionWrapper>
      <FormSectionTitle id="form_section_title">{title}</FormSectionTitle>
      {children}
    </FormSectionWrapper>
  )
}

const ChildsDetails = ({
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
      <FormSection title={title}>
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
      </FormSection>
    </Box>
  )
}

const Form = withFormik<{ fields: any[]; title: string }, any>({
  handleSubmit: values => {
    console.log(values)
  }
})(ChildsDetails)

function getActiveTabId(form: any, viewParams: { tab?: string }) {
  return viewParams.tab || form.tabs[0].id
}

function FormTab({ tab }: { tab: IFormTab }) {
  return <Form title={tab.title} fields={tab.fields} />
}

class BirthParentFormView extends React.Component<
  {
    goToTab: typeof goToTab
  } & RouteComponentProps<{ tab: string }>
> {
  render() {
    const { match } = this.props

    const activeTabId = getActiveTabId(birthParentForm, this.props.match.params)

    const activeTab = birthParentForm.tabs.find(({ id }) => id === activeTabId)

    if (!activeTab) {
      throw new Error(`Configuration for tab "${match.params.tab}" missing!`)
    }

    return (
      <>
        <ViewHeaderWithTabs
          breadcrump="Informant: Parent"
          title="New Birth Registration"
        >
          <Tabs>
            {birthParentForm.tabs.map(({ name, id }) => (
              <Tab
                id={`tab_${id}`}
                onClick={() => this.props.goToTab(id)}
                key={id}
                active={activeTabId === id}
              >
                {name}
              </Tab>
            ))}
          </Tabs>
        </ViewHeaderWithTabs>
        <FormContainer>
          <FormTab tab={activeTab} />
        </FormContainer>
      </>
    )
  }
}

export const BirthParentForm = connect(null, { goToTab })(BirthParentFormView)
