import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { connect } from 'react-redux'

import { Box, Header } from '@opencrvs/components/lib/interface'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { ArrowForward } from '@opencrvs/components/lib/icons'

import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'

import styled from '../../styled-components'

import { goToTab as goToTabAction } from '../../navigation/navigationActions'
import { birthParentForm } from '../../forms/birth-parent'
import { IForm, IFormSection } from '../../forms'
import { Form, FormTabs, ViewHeaderWithTabs } from '../../components/form'
import { IStoreState } from '@opencrvs/register/src/store'
import { IDraft } from '@opencrvs/register/src/drafts'

const FormAction = styled.div`
  display: flex;
  justify-content: center;
`

const FormPrimaryButton = styled(PrimaryButton)`
  box-shadow: 0 0 13px 0 rgba(0, 0, 0, 0.27);
`

export const messages = defineMessages({
  newBirthRegistration: {
    id: 'register.form.newBirthRegistration',
    defaultMessage: 'New birth declaration',
    description: 'The message that appears for new birth registrations'
  },
  saveDraft: {
    id: 'register.form.saveDraft',
    defaultMessage: 'Save draft',
    description: 'Save draft button'
  },
  preview: {
    id: 'register.form.preview',
    defaultMessage: 'Preview',
    description: 'Preview button'
  },
  next: {
    id: 'register.form.next',
    defaultMessage: 'Next',
    description: 'Next button'
  }
})

const FormContainer = styled.div`
  padding: 35px 25px;
  padding-bottom: 0;
  z-index: 1;
`

const FormViewContainer = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
`

const ViewFooter = styled(Header)`
  flex-grow: 1;
  margin-top: -50px;
  padding-top: 100px;
  padding-bottom: 40px;
  /* stylelint-disable */
  ${FormPrimaryButton} {
    /* stylelint-enable */
    width: 270px;
    justify-content: center;
  }
  /* stylelint-disable */
  ${FormAction} {
    /* stylelint-enable */
    margin-bottom: 1em;
  }
`

function getActiveSectionId(form: IForm, viewParams: { tabId?: string }) {
  return viewParams.tabId || form.sections[0].id
}

function getNextSection(sections: IFormSection[], fromSection: IFormSection) {
  const currentIndex = sections.indexOf(fromSection)

  if (currentIndex === sections.length - 1) {
    return null
  }

  return sections[currentIndex + 1]
}

type Props = {
  goToTab: typeof goToTabAction
  draft: IDraft
  activeSection: IFormSection
} & InjectedIntlProps

class BirthParentFormView extends React.Component<Props> {
  render() {
    const { goToTab, intl, activeSection, draft } = this.props
    const nextTab = getNextSection(birthParentForm.sections, activeSection)

    return (
      <FormViewContainer>
        <ViewHeaderWithTabs
          breadcrumb="Informant: Parent"
          id="informant_parent_view"
          title={intl.formatMessage(messages.newBirthRegistration)}
        >
          <FormTabs
            sections={birthParentForm.sections}
            activeTabId={activeSection.id}
            onTabClick={(tabId: string) => goToTab(draft.id, tabId)}
          />
        </ViewHeaderWithTabs>
        <FormContainer>
          <Box>
            <Form
              id={activeSection.id}
              title={intl.formatMessage(activeSection.title)}
              onChange={console.log.bind(console, 'onChange')}
              fields={activeSection.fields}
            />
            <FormAction>
              {nextTab && (
                <FormPrimaryButton
                  onClick={() => goToTab(draft.id, nextTab.id)}
                  id="next_tab"
                  icon={() => <ArrowForward />}
                >
                  {intl.formatMessage(messages.next)}
                </FormPrimaryButton>
              )}
            </FormAction>
          </Box>
        </FormContainer>
        <ViewFooter>
          <FormAction>
            <FormPrimaryButton id="save_draft">
              {intl.formatMessage(messages.saveDraft)}
            </FormPrimaryButton>
          </FormAction>
        </ViewFooter>
      </FormViewContainer>
    )
  }
}

function mapStateToProps(
  state: IStoreState,
  props: Props & RouteComponentProps<{ tabId: string; draftId: string }>
) {
  const { match } = props

  const activeTabId = getActiveSectionId(birthParentForm, match.params)

  const activeSection = birthParentForm.sections.find(
    ({ id }) => id === activeTabId
  )

  const draft = state.drafts.drafts.find(
    ({ id }) => id === parseInt(match.params.draftId, 10)
  )

  if (!draft) {
    throw new Error(`Draft "${match.params.draftId}" missing!`)
  }

  if (!activeSection) {
    throw new Error(`Configuration for tab "${match.params.tabId}" missing!`)
  }

  return {
    activeSection,
    draft
  }
}

export const BirthParentForm = connect(mapStateToProps, {
  goToTab: goToTabAction
})(injectIntl(BirthParentFormView))
