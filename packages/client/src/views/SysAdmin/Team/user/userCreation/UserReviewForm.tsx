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
import { SimpleDocumentUploader } from '@client/components/form/DocumentUploadfield/SimpleDocumentUploader'
import {
  FIELD_GROUP_TITLE,
  IAttachmentValue,
  IFormField,
  IFormFieldValue,
  IFormSection,
  IFormSectionData,
  LOCATION_SEARCH_INPUT,
  SIMPLE_DOCUMENT_UPLOADER
} from '@client/forms'
import { createOrUpdateUserMutation } from '@client/forms/user/mutation/mutations'
import {
  getVisibleSectionGroupsBasedOnConditions,
  getConditionalActionsForField
} from '@client/forms/utils'
import {
  buttonMessages as messages,
  userMessages,
  buttonMessages
} from '@client/i18n/messages'
import {
  goBack,
  goToCreateUserSection,
  goToTeamUserList,
  goToUserReviewForm
} from '@client/navigation'
import { IOfflineData } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import { draftToGqlTransformer } from '@client/transformer'
import {
  modifyUserFormData,
  submitUserFormData
} from '@client/user/userReducer'
import {
  Action,
  FormTitle
} from '@client/views/SysAdmin/Team/user/userCreation/UserForm'
import {
  PrimaryButton,
  SuccessButton,
  ICON_ALIGNMENT,
  LinkButton
} from '@opencrvs/components/lib/buttons'
import { IDynamicValues } from '@opencrvs/components/lib/common-types'
import {
  ActionPageLight,
  ISearchLocation
} from '@opencrvs/components/lib/interface'
import ApolloClient from 'apollo-client'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { RouteComponentProps } from 'react-router'
import { messages as sysAdminMessages } from '@client/i18n/messages/views/sysAdmin'
import { Check } from '@opencrvs/components/lib/icons'
import { getUserDetails } from '@client/profile/profileSelectors'
import { IUserDetails } from '@client/utils/userUtils'
import {
  ListViewSimplified,
  ListViewItemSimplified,
  IListViewItemSimplifiedProps
} from '@opencrvs/components/lib/interface/ListViewSimplified/ListViewSimplified'
import styled from 'styled-components'

export interface IUserReviewFormProps {
  userId?: string
  section: IFormSection
  formData: IFormSectionData
  client: ApolloClient<unknown>
}

interface IDispatchProps {
  goToCreateUserSection: typeof goToCreateUserSection
  goToUserReviewForm: typeof goToUserReviewForm
  submitForm: (userFormSection: IFormSection) => void
  userFormSection: IFormSection
  offlineCountryConfiguration: IOfflineData
  goBack: typeof goBack
  goToTeamUserList: typeof goToTeamUserList
  modify: (values: IFormSectionData) => void
  userDetails: IUserDetails | null
}

interface ISectionData {
  title: string
  items: IListViewItemSimplifiedProps[]
}

type IFullProps = IUserReviewFormProps &
  IntlShapeProps &
  RouteComponentProps<{ userId?: string }>

const Container = styled.div`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 24px;
  }
`

const Title = styled.div`
  ${({ theme }) => theme.fonts.h2};
  margin-bottom: 16px;
`
const Label = styled.span`
  ${({ theme }) => theme.fonts.bold16};
  width: 100%;
`

const DocumentUploaderContainer = styled.div`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding-right: 8px;
  }
`

const Value = styled.span`
  ${({ theme }) => theme.fonts.reg16}
`

class UserReviewFormComponent extends React.Component<
  IFullProps & IDispatchProps
> {
  transformSectionData = () => {
    const { intl, userFormSection } = this.props
    const sections: ISectionData[] = []
    getVisibleSectionGroupsBasedOnConditions(
      userFormSection,
      this.props.formData
    ).forEach((group) => {
      group.fields.forEach((field: IFormField, idx) => {
        if (field && field.type === FIELD_GROUP_TITLE) {
          sections.push({ title: intl.formatMessage(field.label), items: [] })
        } else if (field && sections.length > 0) {
          if (field.name === 'username' && !this.getValue(field)) return
          const label =
            field.type === SIMPLE_DOCUMENT_UPLOADER ? (
              <DocumentUploaderContainer>
                <SimpleDocumentUploader
                  label={intl.formatMessage(field.label)}
                  disableDeleteInPreview={true}
                  name={field.name}
                  onComplete={(file) => {
                    this.props.modify({
                      ...this.props.formData,
                      [field.name]: file
                    })
                  }}
                  files={
                    this.props.formData[
                      field.name
                    ] as unknown as IAttachmentValue
                  }
                />
              </DocumentUploaderContainer>
            ) : (
              intl.formatMessage(field.label)
            )
          if (
            !getConditionalActionsForField(field, this.props.formData).includes(
              'hide'
            )
          ) {
            sections[sections.length - 1].items.push({
              label: <Label>{label}</Label>,
              value: <Value id={`value_${idx}`}>{this.getValue(field)}</Value>,
              actions:
                !(
                  field.name === 'registrationOffice' &&
                  this.props.userDetails?.role !== 'NATIONAL_SYSTEM_ADMIN'
                ) && !field.readonly ? (
                  <LinkButton
                    id={`btn_change_${field.name}`}
                    onClick={() => {
                      this.props.userId
                        ? this.props.goToUserReviewForm(
                            this.props.userId,
                            userFormSection.id,
                            group.id,
                            field.name
                          )
                        : this.props.goToCreateUserSection(
                            userFormSection.id,
                            group.id,
                            field.name
                          )
                    }}
                  >
                    {intl.formatMessage(messages.change)}
                  </LinkButton>
                ) : (
                  <></>
                )
            })
          }
        }
      })
    })

    return sections
  }

  getValue = (field: IFormField) => {
    const { intl, formData } = this.props

    if (field.type === LOCATION_SEARCH_INPUT) {
      const offlineLocations =
        this.props.offlineCountryConfiguration[field.searchableResource]

      const locationId = formData[field.name] as string
      return offlineLocations[locationId] && offlineLocations[locationId].name
    }

    return formData[field.name]
      ? typeof formData[field.name] !== 'object'
        ? field.name === 'role'
          ? intl.formatMessage(userMessages[formData.role as string])
          : field.name === 'type'
          ? intl.formatMessage(userMessages[formData.type as string])
          : String(formData[field.name])
        : (formData[field.name] as IDynamicValues).label
      : ''
  }

  render() {
    const {
      intl,
      section,
      userId,
      userFormSection,
      formData,
      goToTeamUserList,
      userDetails,
      offlineCountryConfiguration
    } = this.props
    let title: string
    let actionComponent: JSX.Element
    const locationId = formData['registrationOffice']
    const locationDetails =
      offlineCountryConfiguration['locations'][`${locationId}`] ||
      offlineCountryConfiguration['facilities'][`${locationId}`] ||
      offlineCountryConfiguration['offices'][`${locationId}`]
    if (userId) {
      title = intl.formatMessage(sysAdminMessages.editUserDetailsTitle)
      actionComponent = (
        <SuccessButton
          id="submit-edit-user-form"
          disabled={
            this.props.formData.role === 'LOCAL_REGISTRAR' &&
            !this.props.formData.signature
          }
          onClick={() => this.props.submitForm(userFormSection)}
          icon={() => <Check />}
          align={ICON_ALIGNMENT.LEFT}
        >
          {intl.formatMessage(buttonMessages.confirm)}
        </SuccessButton>
      )
    } else {
      title = intl.formatMessage(section.title)
      actionComponent = (
        <PrimaryButton
          id="submit_user_form"
          disabled={
            this.props.formData.role === 'LOCAL_REGISTRAR' &&
            !this.props.formData.signature
          }
          onClick={() => this.props.submitForm(userFormSection)}
        >
          {intl.formatMessage(messages.createUser)}
        </PrimaryButton>
      )
    }
    return (
      <ActionPageLight
        title={title}
        goBack={this.props.goBack}
        goHome={() => {
          if (locationDetails) {
            goToTeamUserList({
              id: locationDetails.id,
              searchableText: locationDetails.name,
              displayLabel: locationDetails.name
            })
          } else if (userDetails?.primaryOffice?.id) {
            goToTeamUserList({
              id: userDetails.primaryOffice.id,
              searchableText: '',
              displayLabel: ''
            })
          }
        }}
      >
        {!this.props.userId && (
          <FormTitle id={`${section.id}_title`}>
            {intl.formatMessage(section.name)}
          </FormTitle>
        )}
        <Container>
          {this.transformSectionData().map((sec, index) => {
            return (
              <>
                {sec.title && <Title>{sec.title}</Title>}
                <ListViewSimplified>
                  {sec.items.map((item, index) => {
                    return (
                      <ListViewItemSimplified
                        key={index}
                        label={item.label}
                        value={item.value}
                        actions={item.actions}
                      />
                    )
                  })}
                </ListViewSimplified>
              </>
            )
          })}
          <Action>{actionComponent}</Action>
        </Container>
      </ActionPageLight>
    )
  }
}

const mapDispatchToProps = (dispatch: Dispatch, props: IFullProps) => {
  return {
    goToCreateUserSection: (sec: string, group: string, fieldName?: string) =>
      dispatch(goToCreateUserSection(sec, group, fieldName)),
    goToUserReviewForm: (
      userId: string,
      sec: string,
      group: string,
      fieldName?: string
    ) => dispatch(goToUserReviewForm(userId, sec, group, fieldName)),
    goBack: () => dispatch(goBack()),
    goToTeamUserList: (selectedLocation: ISearchLocation) =>
      dispatch(goToTeamUserList(selectedLocation)),
    modify: (values: IFormSectionData) => dispatch(modifyUserFormData(values)),
    submitForm: (userFormSection: IFormSection) => {
      const variables = draftToGqlTransformer(
        { sections: [userFormSection] },
        { user: props.formData }
      )
      if (variables.user._fhirID) {
        variables.user.id = variables.user._fhirID
        delete variables.user._fhirID
      }

      if (variables.user.signature) {
        delete variables.user.signature.name
        delete variables.user.signature.__typename //to fix updating registrar bug
      }

      dispatch(
        submitUserFormData(
          props.client,
          createOrUpdateUserMutation,
          variables,
          props.formData.registrationOffice as string,
          Boolean(props.match.params.userId) // to detect if update or create
        )
      )
    }
  }
}
export const UserReviewForm = connect((store: IStoreState) => {
  return {
    userFormSection: store.userForm.userForm!.sections[0],
    offlineCountryConfiguration: getOfflineData(store),
    userDetails: getUserDetails(store)
  }
}, mapDispatchToProps)(
  injectIntl<'intl', IFullProps & IDispatchProps>(UserReviewFormComponent)
)
