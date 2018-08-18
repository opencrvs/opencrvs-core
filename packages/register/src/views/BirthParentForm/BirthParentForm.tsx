import * as React from 'react'
import { withRouter, RouteComponentProps, Route } from 'react-router'
import { connect } from 'react-redux'
import { defineMessages } from 'react-intl'

import { Tab, Tabs, Box } from '@opencrvs/components/lib/interface'

import { ViewHeader } from '../../components/ViewHeader'
import { goToBirthRegistration } from '../../navigation/navigationActions'
import styled from '../../styled-components'
import { InputField } from '@opencrvs/components/lib/forms'
import { birthParentFields } from '@opencrvs/register/src/forms/birth-parent'

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
      <FormSectionTitle>{title}</FormSectionTitle>
      {children}
    </FormSectionWrapper>
  )
}

class BirthParentFormView extends React.Component<
  {
    goToBirthRegistration: typeof goToBirthRegistration
  } & RouteComponentProps<{}>
> {
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
        <FormContainer>
          <Route
            exact
            path={`${this.props.match.url}`}
            component={() => {
              return (
                <Box>
                  <FormSection title="Child's details">
                    {birthParentFields.map(field => {
                      return (
                        <FormItem key={name}>
                          <InputField
                            id={field.name}
                            type={field.type}
                            label={field.label}
                          />
                        </FormItem>
                      )
                    })}
                  </FormSection>
                </Box>
              )
            }}
          />
          <Route
            path={`${this.props.match.url}/mother`}
            component={() => {
              return (
                <Box>
                  <h1>moro</h1>
                  <InputField id="test" />
                </Box>
              )
            }}
          />
        </FormContainer>
      </>
    )
  }
}

export const BirthParentForm = withRouter(
  connect(null, { goToBirthRegistration })(BirthParentFormView)
)
