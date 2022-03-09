/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import {
  ICON_ALIGNMENT,
  PrimaryButton,
  TertiaryButton
} from '@opencrvs/components/lib/buttons'
import { IRadioOption as RadioComponentOption } from '@opencrvs/components/lib/forms'
import { ErrorText } from '@opencrvs/components/lib/forms/ErrorText'
import { BackArrow } from '@opencrvs/components/lib/icons'
import { EventTopBar, RadioButton } from '@opencrvs/components/lib/interface'
import { BodyContent, Container } from '@opencrvs/components/lib/layout'
import {
  deleteDeclaration,
  IDeclaration,
  modifyDeclaration
} from '@client/declarations'
import {
  BirthSection,
  DeathSection,
  Event,
  IFormSection,
  IFormSectionData,
  FieldValueMap
} from '@client/forms'
import {
  getBirthSection,
  getDeathSection
} from '@client/forms/register/declaration-selectors'
import { buttonMessages } from '@client/i18n/messages'
import { constantsMessages } from '@client/i18n/messages/constants'
import { formMessages } from '@client/i18n/messages/views/selectInformant'
import {
  goBack,
  goToBirthContactPoint,
  goToBirthRegistrationAsParent,
  goToDeathContactPoint,
  goToDeathRegistration,
  goToHome
} from '@client/navigation'
import { IStoreState } from '@client/store'
import styled from '@client/styledComponents'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import { replaceInitialValues } from '@client/views/RegisterForm/RegisterForm'
import { getInformantSection } from './SelectInformantSection'
import { FormFieldGenerator } from '@client/components/form'
import { getValidationErrorsForForm } from '@client/forms/validation'

const Title = styled.h4`
  ${({ theme }) => theme.fonts.h2};
  margin-top: 16px;
  margin-bottom: 24px;
`
const Actions = styled.div`
  padding-bottom: 24px;
  & > div {
    margin-bottom: 16px;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding-bottom: 16px;
  }
`

const ErrorWrapper = styled.div`
  margin-top: -50px;
  margin-bottom: 16px;
`

export interface IInformantField {
  id: string
  option: RadioComponentOption
  disabled: boolean
}

interface IMatchProps {
  declarationId: string
}

type IFullProps = {
  declaration: IDeclaration
  modifyDeclaration: typeof modifyDeclaration
  deleteDeclaration: typeof deleteDeclaration
  goBack: typeof goBack
  goToHome: typeof goToHome
  goToBirthContactPoint: typeof goToBirthContactPoint
  goToDeathContactPoint: typeof goToDeathContactPoint
  goToBirthRegistrationAsParent: typeof goToBirthRegistrationAsParent
  goToDeathRegistration: typeof goToDeathRegistration
  registrationSection: IFormSection
  informantsSection: IFormSection
} & IntlShapeProps &
  RouteComponentProps<IMatchProps>

interface IState {
  informant: string
  touched: boolean
  showError: boolean
}

function getGroupWithInitialValues(
  section: IFormSection,
  declaration: IDeclaration
) {
  const group = section.groups[0]

  return {
    ...group,
    fields: replaceInitialValues(
      group.fields,
      declaration?.data[section.id] || {},
      declaration?.data
    )
  }
}

export class SelectInformantView extends React.Component<IFullProps, IState> {
  constructor(props: IFullProps) {
    super(props)
    const { informantsSection, registrationSection } = props
    this.state = {
      informant:
        (this.props.declaration &&
          this.props.declaration.data &&
          this.props.declaration.data[registrationSection.id] &&
          (this.props.declaration.data[registrationSection.id]
            .presentAtBirthRegistration as string)) ||
        (this.props.declaration &&
          this.props.declaration.data &&
          this.props.declaration.data[informantsSection.id] &&
          (this.props.declaration.data[informantsSection.id]
            .informantsRelationToDeceased as string)) ||
        '',
      touched: false,
      showError: false
    }
  }
  section = getInformantSection(
    this.props.location.pathname.includes(Event.BIRTH)
      ? Event.BIRTH
      : Event.DEATH
  )
  group = getGroupWithInitialValues(this.section, this.props.declaration)
  componentDidMount() {
    this.group = {
      ...this.group,
      fields: replaceInitialValues(
        this.group.fields,
        this.props.declaration?.data[this.section.id] || {},
        this.props.declaration?.data
      )
    }
  }

  modifyDeclaration = (
    sectionData: IFormSectionData,
    activeSection: IFormSection
  ) => {
    const informant = (
      sectionData[activeSection.groups[0].fields[0].name] as IFormSectionData
    )?.value

    const nestedFieldValue = (
      (sectionData[activeSection.groups[0].fields[0].name] as IFormSectionData)
        ?.nestedFields as IFormSectionData
    )?.otherRelationship

    const nestedField = nestedFieldValue
      ? ({
          otherRelationship: nestedFieldValue
        } as FieldValueMap)
      : {}

    const informantValue = nestedFieldValue ? nestedFieldValue : informant

    const event = this.props.location.pathname.includes(Event.BIRTH)
      ? Event.BIRTH
      : Event.DEATH
    const { declaration, registrationSection, informantsSection } = this.props
    const newDeclaration = {
      ...declaration,
      data: {
        ...declaration?.data
      }
    }
    if (event === Event.BIRTH) {
      newDeclaration.data[registrationSection.id] = {
        ...declaration?.data[registrationSection.id],
        ...{
          presentAtBirthRegistration: informantValue,
          informant: {
            value: informant,
            nestedFields: nestedField
          }
        }
      }
    } else {
      newDeclaration.data[informantsSection.id] = {
        ...declaration.data[informantsSection.id],
        ...{
          // Need to empty those because next screen will fill this up
          // TODO: currently contact point is the informant,
          // need to define the difference between informant and contact point on death schema
          relationship: informantValue
        }
      }
      newDeclaration.data[registrationSection.id] = {
        ...declaration?.data[registrationSection.id],
        ...{
          relationship: {
            value: informant,
            nestedFields: nestedField
          }
        }
      }
    }
    this.props.modifyDeclaration(newDeclaration)
  }

  handleContinue = () => {
    const errors = getValidationErrorsForForm(
      this.group.fields,
      this.props.declaration.data[this.section.id] || {}
    )

    let hasError = false
    this.group.fields.forEach((field) => {
      const fieldErrors = errors[field.name].errors
      const nestedFieldErrors = errors[field.name].nestedFields

      if (fieldErrors.length > 0) {
        hasError = true
      }

      if (field.nestedFields) {
        Object.values(field.nestedFields).forEach((nestedFields) => {
          nestedFields.forEach((nestedField) => {
            if (
              nestedFieldErrors[nestedField.name] &&
              nestedFieldErrors[nestedField.name].length > 0
            ) {
              hasError = true
            }
          })
        })
      }
    })
    if (hasError) {
      this.setState({
        ...this.state,
        showError: true
      })
      return
    } else {
      const event = this.props.location.pathname.includes(Event.BIRTH)
        ? Event.BIRTH
        : Event.DEATH
      event === Event.BIRTH
        ? this.props.goToBirthRegistrationAsParent(
            this.props.match.params.declarationId
          )
        : this.props.goToDeathRegistration(
            this.props.match.params.declarationId
          )
    }
  }
  render() {
    const { intl } = this.props
    const event = this.props.location.pathname.includes(Event.BIRTH)
      ? Event.BIRTH
      : Event.DEATH

    let titleMessage
    switch (event) {
      case Event.BIRTH:
        titleMessage = constantsMessages.newBirthRegistration
        break
      case Event.DEATH:
        titleMessage = constantsMessages.newDeathRegistration
        break
      default:
        titleMessage = constantsMessages.newBirthRegistration
    }

    return (
      <Container>
        <EventTopBar
          title={intl.formatMessage(titleMessage)}
          goHome={() => {
            this.props.deleteDeclaration(this.props.declaration)
            this.props.goToHome()
          }}
        />

        <BodyContent id="select_informant_view">
          <TertiaryButton
            align={ICON_ALIGNMENT.LEFT}
            icon={() => <BackArrow />}
            onClick={this.props.goBack}
          >
            {intl.formatMessage(buttonMessages.back)}
          </TertiaryButton>

          <Title>
            {event === Event.BIRTH
              ? intl.formatMessage(formMessages.birthInformantTitle)
              : intl.formatMessage(formMessages.deathInformantTitle)}
          </Title>
          <Actions id="select_parent_informant">
            <FormFieldGenerator
              id={this.group.id}
              onChange={(values) => {
                this.modifyDeclaration(values, this.section)
              }}
              setAllFieldsDirty={false}
              fields={this.group.fields}
              draftData={this.props.declaration?.data}
            />
          </Actions>
          {this.state.showError && (
            <ErrorWrapper>
              <ErrorText id="error_text">
                {event === Event.BIRTH
                  ? intl.formatMessage(formMessages.birthErrorMessage)
                  : intl.formatMessage(formMessages.deathErrorMessage)}
              </ErrorText>
            </ErrorWrapper>
          )}
          <PrimaryButton id="continue" onClick={this.handleContinue}>
            {intl.formatMessage(buttonMessages.continueButton)}
          </PrimaryButton>
        </BodyContent>
      </Container>
    )
  }
}

const mapStateToProps = (
  store: IStoreState,
  props: RouteComponentProps<{ declarationId: string }>
) => {
  const { match } = props
  return {
    registrationSection: getBirthSection(store, BirthSection.Registration),
    informantsSection: getDeathSection(store, DeathSection.Informants),
    declaration: store.declarationsState.declarations.find(
      ({ id }) => id === match.params.declarationId
    )!
  }
}

export const SelectInformant = withRouter(
  connect(mapStateToProps, {
    goBack,
    goToHome,
    goToBirthContactPoint,
    goToDeathContactPoint,
    goToBirthRegistrationAsParent,
    goToDeathRegistration,
    modifyDeclaration,
    deleteDeclaration
  })(injectIntl(SelectInformantView))
)
