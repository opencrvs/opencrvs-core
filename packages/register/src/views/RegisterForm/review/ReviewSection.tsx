import * as React from 'react'
import { SectionDrawer } from '@opencrvs/components/lib/interface'
import styled from 'styled-components'
import { IDraft } from 'src/drafts'
import { connect } from 'react-redux'
import { IStoreState } from 'src/store'
import { getRegisterForm } from 'src/forms/register/application-selectors'
import { EditConfirmation } from './EditConfirmation'
import { getConditionalActionsForField } from 'src/forms/utils'
import {
  TickLarge,
  CrossLarge,
  Delete,
  DraftSimple
} from '@opencrvs/components/lib/icons'
import { findIndex, filter, flatten, isArray } from 'lodash'
import { getValidationErrorsForForm } from 'src/forms/validation'
import { goToTab } from 'src/navigation'
import { DocumentViewer } from '@opencrvs/components/lib/interface'
import { ISelectOption as SelectComponentOptions } from '@opencrvs/components/lib/forms'
import { documentsSection } from 'src/forms/register/fieldDefinitions/birth/documents-section'
import { getScope } from 'src/profile/profileSelectors'
import { Scope } from 'src/utils/authUtils'
import { getOfflineState } from 'src/offline/selectors'
import {
  IOfflineDataState,
  OFFLINE_LOCATIONS_KEY,
  OFFLINE_FACILITIES_KEY,
  ILocation
} from 'src/offline/reducer'
import { getLanguage } from 'src/i18n/selectors'
import {
  defineMessages,
  InjectedIntlProps,
  injectIntl,
  InjectedIntl
} from 'react-intl'
import {
  PrimaryButton,
  Button,
  IconAction,
  ICON_ALIGNMENT
} from '@opencrvs/components/lib/buttons'
import {
  IForm,
  IFormSection,
  IFormField,
  IFileValue,
  IFormFieldValue,
  LIST,
  PARAGRAPH,
  SELECT_WITH_OPTIONS,
  SELECT_WITH_DYNAMIC_OPTIONS,
  ISelectOption,
  IDynamicOptions,
  IFormSectionData,
  WARNING
} from 'src/forms'

const messages = defineMessages({
  valueYes: {
    id: 'register.form.valueYes',
    defaultMessage: 'Yes',
    description: 'Label for "Yes" answer'
  },
  valueNo: {
    id: 'register.form.valueNo',
    defaultMessage: 'No',
    description: 'Label for "No" answer'
  },
  editLink: {
    id: 'review.edit.modal.editButton',
    defaultMessage: 'Edit',
    description: 'Edit link text'
  },
  valueNext: {
    id: 'register.form.next',
    defaultMessage: 'Next',
    description: 'Next button text'
  },
  valueRegister: {
    id: 'review.button.register',
    defaultMessage: 'REGISTER',
    description: 'Register button text'
  },
  valueReject: {
    id: 'review.button.reject',
    defaultMessage: 'Reject Application',
    description: 'Reject application button text'
  },
  requiredField: {
    id: 'register.form.required',
    defaultMessage: 'This field is required',
    description: 'Message when a field doesnt have a value'
  },
  documentViewerTitle: {
    id: 'review.documentViewer.title',
    defaultMessage: 'Supporting Documents',
    description: 'Document Viewer Title'
  },
  documentViewerTagline: {
    id: 'review.documentViewer.tagline',
    defaultMessage: 'Select to Preview',
    description: 'Document Viewer Tagline'
  },
  valueSendForReview: {
    id: 'register.form.submit',
    defaultMessage: 'SEND FOR REVIEW',
    description: 'Submit Button Text'
  },
  valueSaveAsDraft: {
    id: 'register.form.saveDraft',
    defaultMessage: 'Save as draft',
    description: 'Save as draft Button Text'
  },
  deleteApplicationBtnTxt: {
    id: 'review.form.deleteApplication',
    defaultMessage: 'Delete Application',
    description: 'Delete application Button Text'
  }
})

const DrawerContainer = styled.div`
  margin-bottom: 11px;
  font-family: ${({ theme }) => theme.fonts.boldFont};
`
const SectionRow = styled.p`
  padding: 0 24px;
  &:last-child {
    margin-bottom: 25px;
  }
`
const SectionLabel = styled.label`
  color: ${({ theme }) => theme.colors.placeholder};
  margin-right: 5px;
  &::after {
    content: ':';
  }
`
const SectionValue = styled.span`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.secondary};
`
const NextButton = styled(PrimaryButton)`
  margin: 15px 25px 30px;
  font-weight: bold;
`
const ButtonContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.inputBackground};
  padding: 25px;
  margin-bottom: 2px;
`
const RejectApplication = styled(IconAction)`
  background-color: transparent;
  box-shadow: none;
  min-height: auto;
  padding: 0px;
  width: auto;
  div:first-of-type {
    background: ${({ theme }) => theme.colors.rejectionIconColor};
    padding: 15px 15px 10px;
    border-radius: 2px;
  }
  h3 {
    font-family: ${({ theme }) => theme.fonts.boldFont};
    margin-left: 70px;
    color: ${({ theme }) => theme.colors.secondary};
    text-decoration: underline;
    font-size: 16px;
  }
  &:disabled {
    div:first-of-type {
      background: ${({ theme }) => theme.colors.disabledButton};
    }
    g {
      fill: ${({ theme }) => theme.colors.disabled};
    }
    h3 {
      color: ${({ theme }) => theme.colors.disabled};
    }
  }
`
const RegisterApplication = styled(PrimaryButton)`
  font-weight: bold;
  padding: 15px 35px 15px 20px;
  div {
    position: relative !important;
    margin-right: 20px;
    top: 2px;
  }
  &:disabled {
    background: ${({ theme }) => theme.colors.disabledButton};
    path {
      stroke: ${({ theme }) => theme.colors.disabled};
    }
  }
`
const RequiredFieldLink = styled(Button)`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  color: ${({ theme }) => theme.colors.danger};
  text-decoration: underline;
  padding: 0;
  text-align: left;
`
const Row = styled.div`
  display: flex;
  flex: 1;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    flex-direction: column;
  }
`
const Column = styled.div`
  width: 50%;
  margin: 0px 15px;

  &:first-child {
    margin-left: 0px;
  }
  &:last-child {
    margin-right: 0px;
  }

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin: 0px;
    width: 100%;
  }
`
const ResponsiveDocumentViewer = styled.div.attrs<{ isRegisterScope: boolean }>(
  {}
)`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: ${({ isRegisterScope }) => (isRegisterScope ? 'block' : 'none')};
    margin-bottom: 11px;
  }
`
const DButtonContainer = styled(ButtonContainer)`
  background: transparent;
`
const DeleteApplication = styled.a`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  color: ${({ theme }) => theme.colors.danger};
  text-decoration: underline;
  cursor: pointer;
  svg {
    margin-right: 15px;
  }
`
const SaveDraftText = styled.span`
  font-family: ${({ theme }) => theme.fonts.boldFont};
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 14px;
  text-decoration: underline;
  letter-spacing: 0px;
  margin-left: 14px;
`

const DraftButtonContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.inputBackground};
  min-height: 83px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding-left: 25px;
  cursor: pointer;
`
interface IProps {
  draft: IDraft
  registerForm: { [key: string]: IForm }
  tabRoute: string
  registerClickEvent?: () => void
  rejectApplicationClickEvent?: () => void
  submitClickEvent?: () => void
  saveDraftClickEvent?: () => void
  deleteApplicationClickEvent?: () => void
  goToTab: typeof goToTab
  scope: Scope
  offlineResources: IOfflineDataState
  language: string
}

interface ISectionExpansion {
  id: string
  expanded: boolean
  visited: boolean
}

type State = {
  displayEditDialog: boolean
  allSectionVisited: boolean
  sectionExpansionConfig: ISectionExpansion[]
  editClickedSectionId: string
}

type FullProps = IProps & InjectedIntlProps

const getViewableSection = (registerForm: IForm): IFormSection[] => {
  return registerForm.sections.filter(
    ({ id, viewType }) => id !== 'documents' && viewType === 'form'
  )
}

const getSectionExpansionConfig = (
  registerForm: IForm
): ISectionExpansion[] => {
  const sections = getViewableSection(registerForm)
  const sectionExpansionConfig: ISectionExpansion[] = []
  sections.map((section: IFormSection, index: number) => {
    sectionExpansionConfig.push({
      id: section.id,
      expanded: index === 0,
      visited: index === 0
    })
  })
  return sectionExpansionConfig
}

function renderSelectLabel(
  value: IFormFieldValue,
  options: ISelectOption[],
  intl: InjectedIntl
) {
  const selectedOption = options.find(option => option.value === value)
  return selectedOption ? intl.formatMessage(selectedOption.label) : value
}

export function renderSelectDynamicLabel(
  value: IFormFieldValue,
  options: IDynamicOptions,
  draftData: IFormSectionData,
  intl: InjectedIntl,
  resources: IOfflineDataState,
  language: string
) {
  if (!options.resource) {
    const dependency = options.dependency
      ? draftData[options.dependency]
      : false
    const selectedOption = dependency
      ? options.options &&
        options.options[dependency.toString()].find(
          option => option.value === value
        )
      : false
    return selectedOption ? intl.formatMessage(selectedOption.label) : value
  } else {
    if (options.resource) {
      let locations: ILocation[]
      if (options.resource === 'locations') {
        locations = resources[OFFLINE_LOCATIONS_KEY] as ILocation[]
      } else {
        locations = resources[OFFLINE_FACILITIES_KEY] as ILocation[]
      }

      const selectedLocation = locations.filter((location: ILocation) => {
        return location.id === value
      })[0]
      if (selectedLocation) {
        if (language === 'en') {
          return selectedLocation.name
        } else {
          return selectedLocation.nameBn
        }
      } else {
        return false
      }
    } else {
      return false
    }
  }
}

const renderValue = (
  draft: IDraft,
  section: IFormSection,
  field: IFormField,
  intl: InjectedIntl,
  offlineResources: IOfflineDataState,
  language: string
) => {
  const value: IFormFieldValue = draft.data[section.id]
    ? draft.data[section.id][field.name]
    : ''
  if (field.type === SELECT_WITH_OPTIONS && field.options) {
    return renderSelectLabel(value, field.options, intl)
  }
  if (field.type === SELECT_WITH_DYNAMIC_OPTIONS && field.dynamicOptions) {
    const draftData = draft.data[section.id]
    return renderSelectDynamicLabel(
      value,
      field.dynamicOptions,
      draftData,
      intl,
      offlineResources,
      language
    )
  }
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'boolean') {
    return value
      ? intl.formatMessage(messages.valueYes)
      : intl.formatMessage(messages.valueNo)
  }
  return value
}

const getErrorsOnFieldsBySection = (
  formSections: IFormSection[],
  draft: IDraft
) => {
  return formSections.reduce((sections, section: IFormSection) => {
    const errors = getValidationErrorsForForm(
      section.fields,
      draft.data[section.id] || {}
    )

    return {
      ...sections,
      [section.id]: section.fields.reduce((fields, field) => {
        // REFACTOR
        const validationErrors = errors[field.name]

        const value = draft.data[section.id]
          ? draft.data[section.id][field.name]
          : null

        const informationMissing =
          validationErrors.length > 0 || value === null ? validationErrors : []

        return { ...fields, [field.name]: informationMissing }
      }, {})
    }
  }, {})
}

type ImageMeta = {
  title: string
  description: string
}
type FullIFileValue = IFileValue & ImageMeta

const prepDocumentOption = (draft: IDraft): SelectComponentOptions[] => {
  const draftItemName = documentsSection.id
  const documentviewerOptions: SelectComponentOptions[] = []

  const uploadedDocuments =
    draft.data[draftItemName] &&
    isArray(draft.data[draftItemName].image_uploader)
      ? (draft.data[draftItemName].image_uploader as FullIFileValue[])
      : []

  uploadedDocuments.map(document => {
    const label = document.title + ' ' + document.description
    documentviewerOptions.push({
      value: document.data,
      label
    })
  })

  return documentviewerOptions
}

class ReviewSectionComp extends React.Component<FullProps, State> {
  constructor(props: FullProps) {
    super(props)

    const event = this.props.draft.event

    this.state = {
      displayEditDialog: false,
      allSectionVisited: false,
      editClickedSectionId: '',
      sectionExpansionConfig: getSectionExpansionConfig(
        props.registerForm[event]
      )
    }
  }

  toggleDisplayDialog = () => {
    this.setState(prevState => ({
      displayEditDialog: !prevState.displayEditDialog
    }))
  }

  editLinkClickHandler = (sectionId: string) => {
    this.setState(() => ({
      editClickedSectionId: sectionId
    }))
    this.toggleDisplayDialog()
  }

  nextClickHandler = () => {
    let index = findIndex(this.state.sectionExpansionConfig, { expanded: true })

    this.setState(prevState => {
      const tempState = Object.create(prevState)

      tempState.sectionExpansionConfig[index].expanded = !prevState
        .sectionExpansionConfig[index].expanded
      tempState.sectionExpansionConfig[index + 1].visited = true

      index = index === prevState.sectionExpansionConfig.length - 1 ? -1 : index

      tempState.sectionExpansionConfig[index + 1].expanded = !prevState
        .sectionExpansionConfig[index + 1].expanded

      const unVisitedSection = filter(this.state.sectionExpansionConfig, {
        visited: false
      }).length

      tempState.allSectionVisited = unVisitedSection === 0
      return tempState
    })
  }

  expansionButtonHandler = (index: number) => {
    const expandedSection = findIndex(this.state.sectionExpansionConfig, {
      expanded: true
    })

    this.setState(prevState => {
      prevState.sectionExpansionConfig[index].expanded = !prevState
        .sectionExpansionConfig[index].expanded

      if (index !== expandedSection && expandedSection > -1) {
        prevState.sectionExpansionConfig[expandedSection].expanded = false
      }

      return prevState
    })
  }

  userHasRegisterScope() {
    return this.props.scope && this.props.scope.includes('register')
  }

  render() {
    const {
      intl,
      draft,
      registerForm,
      registerClickEvent,
      rejectApplicationClickEvent,
      submitClickEvent,
      saveDraftClickEvent,
      deleteApplicationClickEvent,
      offlineResources,
      language,
      tabRoute,
      draft: { event }
    } = this.props

    const formSections = getViewableSection(registerForm[event])

    const errorsOnFields = getErrorsOnFieldsBySection(formSections, draft)

    const isVisibleField = (field: IFormField, section: IFormSection) => {
      const conditionalActions = getConditionalActionsForField(
        field,
        draft.data[section.id] || {},
        offlineResources
      )
      return !conditionalActions.includes('hide')
    }
    const isViewOnly = (field: IFormField) => {
      return [LIST, PARAGRAPH, WARNING].find(type => type === field.type)
    }

    const numberOfErrors = flatten(
      Object.values(errorsOnFields).map(Object.values)
    ).filter(errors => errors.length > 0).length
    return (
      <>
        <Row>
          <Column>
            {formSections.map((section: IFormSection, index: number) => {
              const isLastItem = index === formSections.length - 1
              return (
                <DrawerContainer
                  key={section.id}
                  id={`SectionDrawer_${section.id}`}
                >
                  <SectionDrawer
                    title={intl.formatMessage(section.title)}
                    expandable={
                      this.state.sectionExpansionConfig[index].visited
                    }
                    linkText={intl.formatMessage(messages.editLink)}
                    linkClickHandler={() => {
                      this.editLinkClickHandler(section.id)
                    }}
                    expansionButtonHandler={() => {
                      this.expansionButtonHandler(index)
                    }}
                    isExpanded={
                      this.state.sectionExpansionConfig[index].expanded
                    }
                    visited={this.state.sectionExpansionConfig[index].visited}
                  >
                    {section.fields
                      .filter(
                        field =>
                          isVisibleField(field, section) && !isViewOnly(field)
                      )
                      .map((field: IFormField, key: number) => {
                        const errorsOnField =
                          errorsOnFields[section.id][field.name]

                        return (
                          <SectionRow key={key}>
                            <SectionLabel>
                              {intl.formatMessage(field.label)}
                            </SectionLabel>
                            <SectionValue>
                              {errorsOnField.length > 0 ? (
                                <RequiredFieldLink
                                  onClick={() => {
                                    this.props.goToTab(
                                      tabRoute,
                                      draft.id,
                                      section.id,
                                      field.name
                                    )
                                  }}
                                >
                                  {intl.formatMessage(errorsOnField[0].message)}
                                </RequiredFieldLink>
                              ) : (
                                renderValue(
                                  draft,
                                  section,
                                  field,
                                  intl,
                                  offlineResources,
                                  language
                                )
                              )}
                            </SectionValue>
                          </SectionRow>
                        )
                      })}
                    {!isLastItem && (
                      <NextButton
                        id={`next_button_${section.id}`}
                        onClick={this.nextClickHandler}
                      >
                        {intl.formatMessage(messages.valueNext)}
                      </NextButton>
                    )}
                  </SectionDrawer>
                </DrawerContainer>
              )
            })}
          </Column>
          <Column>
            <ResponsiveDocumentViewer
              isRegisterScope={this.userHasRegisterScope()}
            >
              <DocumentViewer
                title={intl.formatMessage(messages.documentViewerTitle)}
                tagline={intl.formatMessage(messages.documentViewerTagline)}
                options={prepDocumentOption(draft)}
              />
            </ResponsiveDocumentViewer>
          </Column>
        </Row>
        <Row>
          <Column>
            {!!registerClickEvent && (
              <ButtonContainer>
                <RegisterApplication
                  id="registerApplicationBtn"
                  icon={() => <TickLarge />}
                  align={ICON_ALIGNMENT.LEFT}
                  onClick={registerClickEvent}
                  disabled={!this.state.allSectionVisited}
                >
                  {intl.formatMessage(messages.valueRegister)}
                </RegisterApplication>
              </ButtonContainer>
            )}

            {!!rejectApplicationClickEvent && (
              <ButtonContainer>
                <RejectApplication
                  id="rejectApplicationBtn"
                  title={intl.formatMessage(messages.valueReject)}
                  icon={() => <CrossLarge />}
                  onClick={rejectApplicationClickEvent}
                  disabled={!this.state.allSectionVisited}
                />
              </ButtonContainer>
            )}

            {!!submitClickEvent && (
              <ButtonContainer>
                <RegisterApplication
                  id="submit_form"
                  icon={() => <TickLarge />}
                  align={ICON_ALIGNMENT.LEFT}
                  onClick={submitClickEvent}
                  disabled={numberOfErrors > 0 || !this.state.allSectionVisited}
                >
                  {intl.formatMessage(
                    this.userHasRegisterScope()
                      ? messages.valueRegister
                      : messages.valueSendForReview
                  )}
                </RegisterApplication>
              </ButtonContainer>
            )}

            {!!saveDraftClickEvent && (
              <DraftButtonContainer
                onClick={saveDraftClickEvent}
                id="save-draft"
              >
                <DraftSimple />
                <SaveDraftText>
                  {intl.formatMessage(messages.valueSaveAsDraft)}
                </SaveDraftText>
              </DraftButtonContainer>
            )}

            <EditConfirmation
              show={this.state.displayEditDialog}
              handleClose={this.toggleDisplayDialog}
              handleEdit={() => {
                this.props.goToTab(
                  tabRoute,
                  draft.id,
                  this.state.editClickedSectionId
                )
              }}
            />
          </Column>
        </Row>
        {deleteApplicationClickEvent && (
          <DButtonContainer>
            <DeleteApplication
              onClick={deleteApplicationClickEvent}
              id="delete-application"
            >
              <Delete />
              {intl.formatMessage(messages.deleteApplicationBtnTxt)}
            </DeleteApplication>
          </DButtonContainer>
        )}
      </>
    )
  }
}

export const ReviewSection = connect(
  (state: IStoreState) => ({
    registerForm: getRegisterForm(state),
    scope: getScope(state),
    offlineResources: getOfflineState(state),
    language: getLanguage(state)
  }),
  { goToTab }
)(injectIntl(ReviewSectionComp))
