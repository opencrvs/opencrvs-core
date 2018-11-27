import * as React from 'react'
import { SectionDrawer } from '@opencrvs/components/lib/interface'
import styled from 'styled-components'
import { IDraft } from 'src/drafts'
import { connect } from 'react-redux'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import { IStoreState } from 'src/store'
import { getRegisterForm } from 'src/forms/register/selectors'
import { EditConfirmation } from './EditConfirmation'
import { getConditionalActionsForField } from 'src/forms/utils'
import { TickLarge, CrossLarge } from '@opencrvs/components/lib/icons'
import { findIndex, filter } from 'lodash'
import {
  PrimaryButton,
  IconAction,
  ICON_ALIGNMENT
} from '@opencrvs/components/lib/buttons'
import {
  IForm,
  IFormSection,
  IFormField,
  IFormFieldValue,
  LIST,
  PARAGRAPH
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
  EditLink: {
    id: 'review.edit.modal.editButton',
    defaultMessage: 'Edit',
    description: 'Edit link text'
  },
  ValueNext: {
    id: 'register.form.next',
    defaultMessage: 'Next',
    description: 'Next button text'
  },
  ValueRegister: {
    id: 'review.button.register',
    defaultMessage: 'REGISTER',
    description: 'Register button text'
  },
  ValueReject: {
    id: 'review.button.reject',
    defaultMessage: 'Reject Application',
    description: 'Reject application button text'
  }
})

const DrawerContainer = styled.div`
  margin-bottom: 11px;
  font-family: ${({ theme }) => theme.fonts.boldFont};
`
const SectionRow = styled.p`
  padding: 0 24px;
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
    background: ${({ theme }) => theme.colors.rejecttionColor};
    padding: 15px 15px 10px;
    border-radius: 2px;
  }
  h3 {
    font-family: ${({ theme }) => theme.fonts.boldFont};
    margin-left: 70px;
    color: ${({ theme }) => theme.colors.rejectTextColor};
    text-decoration: underline;
    font-size: 16px;
  }
  &:disabled {
    div:first-of-type {
      background: ${({ theme }) => theme.colors.disabledButton};
    }
    path {
      stroke: ${({ theme }) => theme.colors.black};
    }
    h3 {
      color: ${({ theme }) => theme.colors.disabledButtonText};
    }
  }
`
const RegisterApplication = styled(PrimaryButton)`
  font-weight: bold;
  div {
    position: relative !important;
    margin-right: 20px;
    top: 2px;
  }
  &:disabled {
    background: ${({ theme }) => theme.colors.disabledButton};
  }
`

interface IProps {
  draft: IDraft
  registerForm: IForm
  RegisterClickEvent?: () => void
  RejectApplicationClickEvent?: () => void
  SubmitClickEvent?: () => void
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
      expanded: index === 0 ? true : false,
      visited: index === 0 ? true : false
    })
  })
  return sectionExpansionConfig
}

class ReviewSectionComp extends React.Component<FullProps, State> {
  constructor(props: FullProps) {
    super(props)

    this.state = {
      displayEditDialog: false,
      allSectionVisited: false,
      sectionExpansionConfig: getSectionExpansionConfig(props.registerForm)
    }
  }

  linkClickHandler = () => {
    this.setState(prevState => ({
      displayEditDialog: !prevState.displayEditDialog
    }))
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

      tempState.allSectionVisited = unVisitedSection === 0 ? true : false
      console.log(tempState)
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

  render() {
    const {
      intl,
      draft,
      registerForm,
      RegisterClickEvent,
      RejectApplicationClickEvent
    } = this.props

    const formSections = getViewableSection(registerForm)

    const isVisibleField = (field: IFormField, section: IFormSection) => {
      const conditionalActions = getConditionalActionsForField(
        field,
        draft.data[section.id] || {}
      )
      return !conditionalActions.includes('hide')
    }

    const isViewOnly = (field: IFormField) => {
      return [LIST, PARAGRAPH].find(type => type === field.type)
    }

    const renderValue = (value: IFormFieldValue) => {
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

    return (
      <>
        {formSections.map((section: IFormSection, index: number) => {
          const isLastItem = index === formSections.length - 1
          return (
            <DrawerContainer key={section.id}>
              <SectionDrawer
                title={intl.formatMessage(section.title)}
                expandable={this.state.sectionExpansionConfig[index].visited}
                linkText={intl.formatMessage(messages.EditLink)}
                linkClickHandler={this.linkClickHandler}
                expansionButtonHandler={() => {
                  this.expansionButtonHandler(index)
                }}
                isExpanded={this.state.sectionExpansionConfig[index].expanded}
              >
                {section.fields
                  .filter(
                    field =>
                      isVisibleField(field, section) && !isViewOnly(field)
                  )
                  .map((field: IFormField, key: number) => {
                    return (
                      <SectionRow key={key}>
                        <SectionLabel>
                          {intl.formatMessage(field.label)}
                        </SectionLabel>
                        <SectionValue>
                          {draft.data[section.id]
                            ? renderValue(draft.data[section.id][field.name])
                            : ''}
                        </SectionValue>
                      </SectionRow>
                    )
                  })}
                {!isLastItem && (
                  <NextButton onClick={this.nextClickHandler}>
                    {intl.formatMessage(messages.ValueNext)}
                  </NextButton>
                )}
              </SectionDrawer>
            </DrawerContainer>
          )
        })}

        <ButtonContainer>
          <RegisterApplication
            icon={() => <TickLarge />}
            align={ICON_ALIGNMENT.LEFT}
            onClick={RegisterClickEvent}
            disabled={!this.state.allSectionVisited}
          >
            {intl.formatMessage(messages.ValueRegister)}
          </RegisterApplication>
        </ButtonContainer>

        <ButtonContainer>
          <RejectApplication
            title={intl.formatMessage(messages.ValueReject)}
            icon={() => <CrossLarge />}
            onClick={RejectApplicationClickEvent}
            disabled={!this.state.allSectionVisited}
          />
        </ButtonContainer>

        <EditConfirmation
          show={this.state.displayEditDialog}
          handleClose={this.linkClickHandler}
          handleEdit={this.linkClickHandler}
        />
      </>
    )
  }
}

export const ReviewSection = connect(
  (state: IStoreState) => ({
    registerForm: getRegisterForm(state)
  }),
  {}
)(injectIntl(ReviewSectionComp))
