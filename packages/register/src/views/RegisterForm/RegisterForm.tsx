import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { connect } from 'react-redux'
import { Box, Header } from '@opencrvs/components/lib/interface'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { ArrowForward } from '@opencrvs/components/lib/icons'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import styled from '../../styled-components'
import { goToTab as goToTabAction } from '../../navigation/navigationActions'
import { IForm, IFormSection, IFormField, IFormSectionData } from '../../forms'
import { Form, FormTabs, ViewHeaderWithTabs } from '../../components/form'
import { IStoreState } from '../../store'
import { IDraft, modifyDraft } from '../../drafts'
import {
  addFathersDetails,
  removeFathersDetails,
  addFatherCurrentAddress,
  removeFatherCurrentAddress
} from '../../forms/register/reducer'
import { getRegisterForm } from '../../forms/register/selectors'

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
  const currentIndex = sections.findIndex(
    (section: IFormSection) => section.id === fromSection.id
  )

  if (currentIndex === sections.length - 1) {
    return null
  }

  return sections[currentIndex + 1]
}

type DispatchProps = {
  goToTab: typeof goToTabAction
  modifyDraft: typeof modifyDraft
  addFathersDetails: typeof addFathersDetails
  removeFathersDetails: typeof removeFathersDetails
  addFatherCurrentAddress: typeof addFatherCurrentAddress
  removeFatherCurrentAddress: typeof addFatherCurrentAddress
}

type Props = {
  draft: IDraft
  activeSection: IFormSection
  registerForm: IForm
}

class RegisterFormView extends React.Component<
  Props & DispatchProps & InjectedIntlProps
> {
  modifyFathersDynamicFields = (sectionData: IFormSectionData) => {
    if (sectionData.fathersDetailsExist === '1') {
      this.props.addFathersDetails()
      if (sectionData.addressSameAsMother === '0') {
        this.props.addFatherCurrentAddress()
      } else if (sectionData.addressSameAsMother === '1') {
        this.props.removeFatherCurrentAddress()
      }
    } else {
      this.props.removeFathersDetails()
    }
  }
  modifyDynamicFields = (id: string, sectionData: IFormSectionData) => {
    if (id === 'father') {
      this.modifyFathersDynamicFields(sectionData)
    }
  }

  modifyDraft = (sectionData: IFormSectionData) => {
    const { activeSection, draft } = this.props
    this.props.modifyDraft({
      ...draft,
      data: {
        ...draft.data,
        [activeSection.id]: sectionData
      }
    })
    this.modifyDynamicFields(activeSection.id, sectionData)
  }
  render() {
    const { goToTab, intl, activeSection, draft, registerForm } = this.props

    const nextSection = getNextSection(registerForm.sections, activeSection)

    return (
      <FormViewContainer>
        <ViewHeaderWithTabs
          breadcrumb="Informant: Parent"
          id="informant_parent_view"
          title={intl.formatMessage(messages.newBirthRegistration)}
        >
          <FormTabs
            sections={registerForm.sections}
            activeTabId={activeSection.id}
            onTabClick={(tabId: string) => goToTab(draft.id, tabId)}
          />
        </ViewHeaderWithTabs>
        <FormContainer>
          <Box>
            <Form
              id={activeSection.id}
              onChange={this.modifyDraft}
              title={intl.formatMessage(activeSection.title)}
              fields={activeSection.fields}
            />
            <FormAction>
              {nextSection && (
                <FormPrimaryButton
                  onClick={() => goToTab(draft.id, nextSection.id)}
                  id="next_section"
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

function replaceInitialValues(fields: IFormField[], sectionValues: object) {
  return fields.map(field => ({
    ...field,
    initialValue: sectionValues[field.name] || field.initialValue
  }))
}

function mapStateToProps(
  state: IStoreState,
  props: Props & RouteComponentProps<{ tabId: string; draftId: string }>
) {
  const { match } = props
  const registerForm = getRegisterForm(state)
  const activeSectionId = getActiveSectionId(registerForm, match.params)

  const activeSection = registerForm.sections.find(
    ({ id }) => id === activeSectionId
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
    registerForm,
    activeSection: {
      ...activeSection,
      fields: replaceInitialValues(
        activeSection.fields,
        draft.data[activeSectionId] || {}
      )
    },
    draft
  }
}

export const RegisterForm = connect<Props, DispatchProps>(mapStateToProps, {
  modifyDraft,
  addFathersDetails,
  removeFathersDetails,
  addFatherCurrentAddress,
  removeFatherCurrentAddress,
  goToTab: goToTabAction
})(injectIntl<Props>(RegisterFormView))
