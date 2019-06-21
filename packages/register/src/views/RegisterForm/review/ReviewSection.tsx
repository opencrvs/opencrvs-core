import * as React from 'react'
import {
  SectionDrawer,
  DocumentViewer,
  IDocumentViewerOptions
} from '@opencrvs/components/lib/interface'
import styled from '@register/styledComponents'
import { IApplication } from '@register/applications'
import { connect } from 'react-redux'
import { IStoreState } from '@register/store'
import { getRegisterForm } from '@register/forms/register/application-selectors'
import { EditConfirmation } from '@register/views/RegisterForm/review/EditConfirmation'
import {
  getConditionalActionsForField,
  getFieldLabel
} from '@register/forms/utils'
import {
  TickLarge,
  CrossLarge,
  Delete,
  DraftSimple
} from '@opencrvs/components/lib/icons'
import { Link } from '@opencrvs/components/lib/typography'
import { findIndex, filter, flatten, isArray } from 'lodash'
import { getValidationErrorsForForm } from '@register/forms/validation'
import { goToPage } from '@register/navigation'

import { ISelectOption as SelectComponentOptions } from '@opencrvs/components/lib/forms'
import { documentsSection } from '@register/forms/register/fieldDefinitions/birth/documents-section'
import { getScope } from '@register/profile/profileSelectors'
import { Scope } from '@register/utils/authUtils'
import { getOfflineState } from '@register/offline/selectors'
import {
  IOfflineDataState,
  OFFLINE_LOCATIONS_KEY,
  OFFLINE_FACILITIES_KEY,
  ILocation
} from '@register/offline/reducer'
import { getLanguage } from '@register/i18n/selectors'
import {
  defineMessages,
  InjectedIntlProps,
  injectIntl,
  InjectedIntl,
  FormattedMessage
} from 'react-intl'
import {
  PrimaryButton,
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
  WARNING,
  DATE,
  FIELD_WITH_DYNAMIC_DEFINITIONS,
  IDynamicFormField
} from '@register/forms'
import { formatLongDate } from '@register/utils/date-formatting'

import { REJECTED } from '@register/utils/constants'

const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
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
  ${({ theme }) => theme.fonts.bodyBoldStyle};
`
const SectionRow = styled.p`
  padding: 0 24px;
  &:last-child {
    margin-bottom: 25px;
  }
`
const SectionLabel = styled.label`
  ${({ theme }) => theme.fonts.bodyBoldStyle};
  color: ${({ theme }) => theme.colors.copy};
  margin-right: 5px;
  &::after {
    content: ':';
  }
`
const SectionValue = styled.span`
  ${({ theme }) => theme.fonts.bodyStyle};
  color: ${({ theme }) => theme.colors.copy};
`
const NextButton = styled(PrimaryButton)`
  margin: 15px 25px 30px;
`
const ButtonContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
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
    background: ${({ theme }) => theme.colors.warning};
    padding: 15px 15px 10px;
    border-radius: 2px;
  }
  h3 {
    ${({ theme }) => theme.fonts.bodyBoldStyle};
    margin-left: 70px;
    color: ${({ theme }) => theme.colors.secondary};
    text-decoration: underline;
  }
  &:disabled {
    div:first-of-type {
      background: ${({ theme }) => theme.colors.disabled};
    }
    g {
      fill: ${({ theme }) => theme.colors.disabled};
    }
    h3 {
      color: ${({ theme }) => theme.colors.disabled};
    }
  }
`

const RequiredFieldLink = styled(Link)`
  color: ${({ theme }) => theme.colors.error};
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
  ${({ theme }) => theme.fonts.bodyStyle};
  color: ${({ theme }) => theme.colors.error};
  text-decoration: underline;
  cursor: pointer;
  svg {
    margin-right: 15px;
  }
`
const SaveDraftText = styled.span`
  ${({ theme }) => theme.fonts.bodyBoldStyle};
  color: ${({ theme }) => theme.colors.secondary};
  text-decoration: underline;
  margin-left: 14px;
`

const DraftButtonContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  min-height: 83px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding-left: 25px;
  cursor: pointer;
`
interface IProps {
  draft: IApplication
  registerForm: { [key: string]: IForm }
  pageRoute: string
  registerClickEvent?: () => void
  rejectApplicationClickEvent?: () => void
  submitClickEvent?: () => void
  saveDraftClickEvent?: () => void
  deleteApplicationClickEvent?: () => void
  goToPage: typeof goToPage
  scope: Scope | null
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
      let selectedLocation: ILocation
      const locationId = value as string
      if (options.resource === 'locations') {
        selectedLocation = resources[OFFLINE_LOCATIONS_KEY][locationId]
      } else {
        selectedLocation = resources[OFFLINE_FACILITIES_KEY][locationId]
      }

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
  draft: IApplication,
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

  if (field.type === DATE && value && typeof value === 'string') {
    return formatLongDate(value)
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
  draft: IApplication
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

const prepDocumentOption = (draft: IApplication): IDocumentViewerOptions => {
  const draftItemName = documentsSection.id
  const documentOptions: SelectComponentOptions[] = []
  const selectOptions: SelectComponentOptions[] = []

  const uploadedDocuments =
    draft.data[draftItemName] &&
    isArray(draft.data[draftItemName].imageUploader)
      ? (draft.data[draftItemName].imageUploader as FullIFileValue[])
      : []

  uploadedDocuments.map(document => {
    const label = document.title + ' ' + document.description
    documentOptions.push({
      value: document.data,
      label
    })
    selectOptions.push({
      value: label,
      label
    })
  })
  return {
    selectOptions,
    documentOptions
  }
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
    if (this.props.scope) {
      return this.props.scope && this.props.scope.includes('register')
    } else {
      return false
    }
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
      pageRoute,
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
      // @ts-ignore
      Object.values(errorsOnFields).map(Object.values)
      // @ts-ignore
    ).filter(errors => errors.length > 0).length

    const isRejected =
      this.props.draft.registrationStatus &&
      this.props.draft.registrationStatus === REJECTED

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
                          // @ts-ignore
                          errorsOnFields[section.id][field.name]

                        return (
                          <SectionRow key={key}>
                            <SectionLabel>
                              {field.type === FIELD_WITH_DYNAMIC_DEFINITIONS &&
                              field.dynamicDefinitions.label &&
                              draft.data[section.id]
                                ? intl.formatMessage(getFieldLabel(
                                    field as IDynamicFormField,
                                    draft.data[section.id]
                                  ) as FormattedMessage.MessageDescriptor)
                                : intl.formatMessage(field.label)}
                            </SectionLabel>
                            <SectionValue>
                              {errorsOnField.length > 0 ? (
                                <RequiredFieldLink
                                  onClick={() => {
                                    this.props.goToPage(
                                      pageRoute,
                                      draft.id,
                                      section.id,
                                      draft.event.toLowerCase(),
                                      field.name
                                    )
                                  }}
                                >
                                  {intl.formatMessage(
                                    errorsOnField[0].message,
                                    errorsOnField[0].props
                                  )}
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
                <PrimaryButton
                  id="registerApplicationBtn"
                  icon={() => <TickLarge />}
                  align={ICON_ALIGNMENT.LEFT}
                  onClick={registerClickEvent}
                  disabled={!this.state.allSectionVisited}
                >
                  {intl.formatMessage(messages.valueRegister)}
                </PrimaryButton>
              </ButtonContainer>
            )}

            {!!rejectApplicationClickEvent && !isRejected && (
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
                <PrimaryButton
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
                </PrimaryButton>
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
                this.props.goToPage(
                  pageRoute,
                  draft.id,
                  this.state.editClickedSectionId,
                  draft.event.toLowerCase()
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
  { goToPage }
)(injectIntl(ReviewSectionComp))
