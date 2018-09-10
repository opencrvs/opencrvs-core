import * as React from 'react'
import { connect } from 'react-redux'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'

import { Box } from '@opencrvs/components/lib/interface'
import { PrimaryButton, Button } from '@opencrvs/components/lib/buttons'

import styled from 'src/styled-components'

import { birthParentForm } from 'src/forms/birth-parent'
import { IFormSection, IFormField } from 'src/forms'

import { IDraft } from 'src/drafts'
import { getValidationErrorsForForm } from 'src/forms/validation'
import { goToTab } from 'src/navigation'

const FormAction = styled.div`
  display: flex;
  justify-content: center;
`

const FormPrimaryButton = styled(PrimaryButton)`
  box-shadow: 0 0 13px 0 rgba(0, 0, 0, 0.27);
`

export const messages = defineMessages({
  submit: {
    id: 'register.form.submit',
    defaultMessage: 'Submit',
    description: 'Submit button'
  },
  informationMissing: {
    id: 'register.form.informationMissing',
    defaultMessage: 'Information missing',
    description: 'Message when a field doesnt have a value'
  }
})
type DispatchProps = {
  goToTab: typeof goToTab
}
type Props = {
  draft: IDraft
  onSubmit: () => void
}

const PreviewSectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.lightFont};
  color: ${({ theme }) => theme.colors.copy};
`
const PreviewBox = styled(Box)`
  margin-bottom: 30px;
`

const List = styled.ul`
  padding: 0;
`

const ListItem = styled.li`
  display: flex;
  padding-top: 10px;
  padding-bottom: 2px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.background};
`

const ListItemLabel = styled.div`
  flex-basis: 50%;
  font-size: 16px;
  font-family: ${({ theme }) => theme.fonts.regularFont};
  color: ${({ theme }) => theme.colors.placeholder};
`
const ListItemValue = styled.div`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  color: ${({ theme }) => theme.colors.copy};
  font-size: 18px;
`
const InformationMissingLink = styled(Button)`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  color: ${({ theme }) => theme.colors.danger};
  font-size: 16px;
  text-decoration: underline;
  padding: 0;
`

class PreviewSectionForm extends React.Component<
  Props & DispatchProps & InjectedIntlProps
> {
  render() {
    const { intl, draft } = this.props

    const formSections = birthParentForm.sections.filter(
      ({ viewType }) => viewType === 'form'
    )

    return (
      <>
        {formSections.map((section: IFormSection, i) => {
          const errors = getValidationErrorsForForm(
            section.fields,
            draft.data[section.id] || {}
          )

          return (
            <PreviewBox key={section.id}>
              <PreviewSectionTitle>
                {intl.formatMessage(section.title)}
              </PreviewSectionTitle>
              <List>
                {section.fields.map((field: IFormField) => {
                  const validationErrors = errors[field.name]

                  const value = draft.data[section.id]
                    ? draft.data[section.id][field.name]
                    : null

                  const informationMissing =
                    validationErrors.length > 0 || value === null

                  return (
                    <ListItem key={field.name}>
                      <ListItemLabel>
                        {intl.formatMessage(field.label)}
                      </ListItemLabel>
                      <ListItemValue>
                        {informationMissing ? (
                          <InformationMissingLink
                            onClick={() =>
                              this.props.goToTab(
                                draft.id,
                                section.id,
                                field.name
                              )
                            }
                          >
                            {intl.formatMessage(messages.informationMissing)}
                          </InformationMissingLink>
                        ) : (
                          value
                        )}
                      </ListItemValue>
                    </ListItem>
                  )
                })}
              </List>

              {i === formSections.length - 1 && (
                <FormAction>
                  <FormPrimaryButton
                    onClick={this.props.onSubmit}
                    id="submit_form"
                  >
                    {intl.formatMessage(messages.submit)}
                  </FormPrimaryButton>
                </FormAction>
              )}
            </PreviewBox>
          )
        })}
      </>
    )
  }
}

export const PreviewSection = connect<Props, DispatchProps>(null, {
  goToTab
})(injectIntl<Props>(PreviewSectionForm))
