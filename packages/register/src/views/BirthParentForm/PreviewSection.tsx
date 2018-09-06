import * as React from 'react'

import { Box } from '@opencrvs/components/lib/interface'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'

import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'

import styled from '../../styled-components'

import { birthParentForm } from '../../forms/birth-parent'
import { IFormSection, IFormField } from '../../forms'

import { IDraft } from '../../drafts'

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
  }
})

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

class PreviewSectionForm extends React.Component<Props & InjectedIntlProps> {
  render() {
    const { intl, draft } = this.props

    const formSections = birthParentForm.sections.filter(
      ({ viewType }) => viewType === 'form'
    )

    return (
      <>
        {formSections.map((section: IFormSection, i) => (
          <PreviewBox key={section.id}>
            <PreviewSectionTitle>
              {intl.formatMessage(section.title)}
            </PreviewSectionTitle>
            <List>
              {section.fields.map((field: IFormField) => (
                <ListItem key={field.name}>
                  <ListItemLabel>
                    {intl.formatMessage(field.label)}
                  </ListItemLabel>
                  <ListItemValue>
                    {draft.data[section.id] &&
                      draft.data[section.id][field.name]}
                  </ListItemValue>
                </ListItem>
              ))}
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
        ))}
      </>
    )
  }
}

export const PreviewSection = injectIntl<Props>(PreviewSectionForm)
