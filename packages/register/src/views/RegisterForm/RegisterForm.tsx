import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { connect } from 'react-redux'
import * as Swipeable from 'react-swipeable'
import { Box, Modal } from '@opencrvs/components/lib/interface'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { ArrowForward } from '@opencrvs/components/lib/icons'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import styled from '../../styled-components'
import { goToTab as goToTabAction } from '../../navigation'
import { IForm, IFormSection, IFormField, IFormSectionData } from '../../forms'
import { Form, ViewHeaderWithTabs } from '../../components/form'
import { IStoreState } from '../../store'
import { IDraft, modifyDraft } from '../../drafts'
import { getRegisterForm } from '../../forms/register/selectors'
import {
  FooterAction,
  FooterPrimaryButton,
  ViewFooter
} from 'src/components/interface/footer'
import { PreviewSection } from './PreviewSection'
import { StickyFormTabs } from './StickyFormTabs'
import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'

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
  next: {
    id: 'register.form.next',
    defaultMessage: 'Next',
    description: 'Next button'
  },
  preview: {
    id: 'register.form.modal.preview',
    defaultMessage: 'Preview',
    description: 'Preview button on submit modal'
  },
  submitDescription: {
    id: 'register.form.modal.submitDescription',
    defaultMessage:
      'By clicking “Submit” you confirm that the informant has read and reviewed the information and understands that this information will be shared with Civil Registration authorities.',
    description: 'Submit description text on submit modal'
  },
  submitButton: {
    id: 'register.form.modal.submitButton',
    defaultMessage: 'Submit',
    description: 'Submit button on submit modal'
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

const PreviewButton = styled.a`
  text-decoration: underline;
  color: ${({ theme }) => theme.colors.primary};
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

function getPreviousSection(
  sections: IFormSection[],
  fromSection: IFormSection
) {
  const currentIndex = sections.findIndex(
    (section: IFormSection) => section.id === fromSection.id
  )

  if (currentIndex === 0) {
    return null
  }

  return sections[currentIndex - 1]
}

type DispatchProps = {
  goToTab: typeof goToTabAction
  modifyDraft: typeof modifyDraft
}

type Props = {
  draft: IDraft
  registerForm: IForm
  activeSection: IFormSection
  setAllFieldsDirty: boolean
}

type FullProps = Props &
  DispatchProps &
  InjectedIntlProps &
  RouteComponentProps<{}>

type State = {
  showSubmitModal: boolean
  selectedTabId: string
}

const POST_MUTATION = gql`
  mutation submitBirthRegistration($details: BirthRegistrationInput!) {
    createBirthRegistration(details: $details) {
      id
    }
  }
`

class RegisterFormView extends React.Component<FullProps, State> {
  constructor(props: FullProps) {
    super(props)
    this.state = {
      showSubmitModal: false,
      selectedTabId: ''
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
  }

  submitForm = () => {
    this.setState({ showSubmitModal: true })
  }

  toggleSubmitModalOpen = () => {
    this.setState((prevState: State) => ({
      showSubmitModal: !prevState.showSubmitModal
    }))
  }

  onSwiped = (
    draftId: number,
    selectedSection: IFormSection | null,
    goToTab: (draftId: number, tabId: string) => void
  ): void => {
    if (selectedSection) {
      goToTab(draftId, selectedSection.id)
    }
  }

  processSubmitData = () => {
    const { child, father, mother, registration } = this.props.draft.data
    const fatherPermanentAddress = father.permanentAddressSameAsMother
      ? mother
      : father
    const fatherCurrentAddress = father.addressSameAsMother ? mother : father

    const draftDetails = {
      child: {
        name: [
          {
            use: 'Bangla',
            firstNames: child.childFirstNames,
            familyName: child.childFamilyName
          },
          {
            use: 'English',
            firstNames: child.childFirstNamesEng,
            familyName: child.childFamilyNameEng
          }
        ],
        gender: child.childSex,
        birthDate: child.dateOfBirth
      },
      father: {
        identifier: [
          {
            id: father.fatherID,
            type: father.fatherIDType
          }
        ],
        name: [
          {
            use: 'Bangla',
            firstNames: father.fatherFirstNames,
            familyName: father.fatherFamilyName
          },
          {
            use: 'English',
            firstNames: father.fatherFirstNamesEng,
            familyName: father.fatherFamilyNameEng
          }
        ],
        birthDate: father.fatherDateOfBirth,
        dateOfMarriage: father.fatherDateOfMarriage,
        maritalStatus: father.maritalStatus,
        nationality: [father.nationality],
        educationalAttainment: father.motherEducationAttainment,
        address: [
          {
            use: 'English',
            type: 'PERMANENT',
            country: fatherPermanentAddress.countryPermanent,
            state: fatherPermanentAddress.statePermanent,
            district: fatherPermanentAddress.districtPermanent,
            postalCode: fatherPermanentAddress.postCodePermanent,
            line: [
              fatherPermanentAddress.addressLine1Permanent,
              fatherPermanentAddress.addressLine2Permanent,
              fatherPermanentAddress.addressLine3Options1Permanent,
              fatherPermanentAddress.addressLine4Permanent
            ]
          },
          {
            use: 'English',
            type: 'CURRENT',
            country: fatherCurrentAddress.country,
            state: fatherCurrentAddress.state,
            district: fatherCurrentAddress.district,
            postalCode: fatherCurrentAddress.postCode,
            line: [
              fatherCurrentAddress.addressLine1,
              fatherCurrentAddress.addressLine2,
              fatherCurrentAddress.addressLine3Options1,
              fatherCurrentAddress.addressLine4
            ]
          }
        ]
      },
      mother: {
        identifier: [
          {
            id: mother.motherID,
            type: mother.motherIDType
          }
        ],
        name: [
          {
            use: 'Bangla',
            firstNames: mother.motherFirstNames,
            familyName: mother.motherFamilyName
          },
          {
            use: 'English',
            firstNames: mother.motherFirstNamesEng,
            familyName: mother.motherFamilyNameEng
          }
        ],
        birthDate: mother.motherDateOfBirth,
        dateOfMarriage: mother.motherDateOfMarriage,
        maritalStatus: mother.maritalStatus,
        nationality: [mother.nationality],
        educationalAttainment: mother.motherEducationAttainment,
        address: [
          {
            use: 'English',
            type: 'PERMANENT',
            country: mother.countryPermanent,
            state: mother.statePermanent,
            district: mother.districtPermanent,
            postalCode: mother.postCodePermanent,
            line: [
              mother.addressLine1Permanent,
              mother.addressLine2Permanent,
              mother.addressLine3Options1Permanent,
              mother.addressLine4Permanent
            ]
          },
          {
            use: 'English',
            type: 'CURRENT',
            country: mother.country,
            state: mother.state,
            district: mother.district,
            postalCode: mother.postCode,
            line: [
              mother.addressLine1,
              mother.addressLine2,
              mother.addressLine3Options1,
              mother.addressLine4
            ]
          }
        ]
      },
      registration: {
        paperFormID: registration.paperFormNumber
      },
      birthLocation: {
        type: child.placeOfDelivery
      },
      birthOrder: child.orderOfBirth,
      attendantAtBirth: child.attendantAtBirth,
      birthType: child.typeOfBirth,
      weightAtBirth: child.weightAtBirth
    }

    return draftDetails
  }

  render() {
    const {
      goToTab,
      intl,
      activeSection,
      setAllFieldsDirty,
      draft,
      history,
      registerForm
    } = this.props

    const nextSection = getNextSection(registerForm.sections, activeSection)

    return (
      <FormViewContainer>
        <ViewHeaderWithTabs
          breadcrumb="Informant: Parent"
          id="informant_parent_view"
          title={intl.formatMessage(messages.newBirthRegistration)}
        >
          <StickyFormTabs
            sections={registerForm.sections}
            activeTabId={activeSection.id}
            onTabClick={(tabId: string) => goToTab(draft.id, tabId)}
          />
        </ViewHeaderWithTabs>
        <FormContainer>
          <Swipeable
            id="swipeable_block"
            trackMouse
            onSwipedLeft={() => this.onSwiped(draft.id, nextSection, goToTab)}
            onSwipedRight={() =>
              this.onSwiped(
                draft.id,
                getPreviousSection(registerForm.sections, activeSection),
                goToTab
              )
            }
          >
            {activeSection.viewType === 'preview' && (
              <PreviewSection draft={draft} onSubmit={this.submitForm} />
            )}
            {activeSection.viewType === 'form' && (
              <Box>
                <Form
                  id={activeSection.id}
                  onChange={this.modifyDraft}
                  setAllFieldsDirty={setAllFieldsDirty}
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
            )}
          </Swipeable>
        </FormContainer>
        <ViewFooter>
          <FooterAction>
            <FooterPrimaryButton
              id="save_draft"
              onClick={() => history.push('/saved')}
            >
              {intl.formatMessage(messages.saveDraft)}
            </FooterPrimaryButton>
          </FooterAction>
        </ViewFooter>
        <Mutation
          mutation={POST_MUTATION}
          variables={{ details: this.processSubmitData }}
        >
          {(submitBirthRegistration, { data }) => {
            if (data && data.id) {
              history.push('/saved')
            }

            return (
              <Modal
                title="Are you ready to submit?"
                actions={[
                  <PrimaryButton
                    key="submit"
                    id="submit_confirm"
                    onClick={() => history.push('/saved')}
                    // onClick={() => submitBirthRegistration()}
                  >
                    {intl.formatMessage(messages.submitButton)}
                  </PrimaryButton>,
                  <PreviewButton
                    key="preview"
                    onClick={() => {
                      this.toggleSubmitModalOpen()
                      document.documentElement.scrollTop = 0
                    }}
                  >
                    {intl.formatMessage(messages.preview)}
                  </PreviewButton>
                ]}
                show={this.state.showSubmitModal}
                handleClose={this.toggleSubmitModalOpen}
              >
                {intl.formatMessage(messages.submitDescription)}
              </Modal>
            )
          }}
        </Mutation>
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

  const visitedSections = registerForm.sections.filter(({ id }) =>
    Boolean(draft.data[id])
  )

  const rightMostVisited = visitedSections[visitedSections.length - 1]

  const setAllFieldsDirty =
    rightMostVisited &&
    registerForm.sections.indexOf(activeSection) <
      registerForm.sections.indexOf(rightMostVisited)

  const fields = replaceInitialValues(
    activeSection.fields,
    draft.data[activeSectionId] || {}
  )

  return {
    registerForm,
    setAllFieldsDirty,
    activeSection: {
      ...activeSection,
      fields
    },
    draft
  }
}

export const RegisterForm = connect<Props, DispatchProps>(mapStateToProps, {
  modifyDraft,
  goToTab: goToTabAction
})(injectIntl<FullProps>(RegisterFormView))
