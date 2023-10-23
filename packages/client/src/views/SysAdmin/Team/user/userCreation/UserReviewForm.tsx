/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { SimpleDocumentUploader } from '@client/components/form/DocumentUploadfield/SimpleDocumentUploader'
import {
  DIVIDER,
  FIELD_GROUP_TITLE,
  IAttachmentValue,
  IFormField,
  IFormSection,
  IFormSectionData,
  LOCATION_SEARCH_INPUT,
  SIMPLE_DOCUMENT_UPLOADER,
  SUBSECTION_HEADER
} from '@client/forms'
import { createOrUpdateUserMutation } from '@client/forms/user/mutation/mutations'
import {
  getVisibleSectionGroupsBasedOnConditions,
  getConditionalActionsForField,
  getListOfLocations
} from '@client/forms/utils'
import {
  buttonMessages as messages,
  userMessages,
  buttonMessages,
  constantsMessages
} from '@client/i18n/messages'
import {
  goBack,
  goToCreateUserSection,
  goToTeamUserList,
  goToUserReviewForm
} from '@client/navigation'
import { ILocation, IOfflineData } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import { draftToGqlTransformer } from '@client/transformer'
import {
  modifyUserFormData,
  submitUserFormData
} from '@client/user/userReducer'
import { Action } from '@client/views/SysAdmin/Team/user/userCreation/UserForm'
import {
  PrimaryButton,
  SuccessButton,
  ICON_ALIGNMENT
} from '@opencrvs/components/lib/buttons'
import { IDynamicValues } from '@opencrvs/components/lib/common-types'
import { ActionPageLight } from '@opencrvs/components/lib/ActionPageLight'
import { ApolloClient } from '@apollo/client'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { RouteComponentProps } from 'react-router'
import { messages as sysAdminMessages } from '@client/i18n/messages/views/sysAdmin'
import { Check } from '@opencrvs/components/lib/icons'
import { getUserDetails } from '@client/profile/profileSelectors'
import { UserDetails } from '@client/utils/userUtils'
import {
  ListViewSimplified,
  ListViewItemSimplified,
  IListViewItemSimplifiedProps
} from '@opencrvs/components/lib/ListViewSimplified'
import styled from 'styled-components'
import { Content } from '@opencrvs/components/lib/Content'
import { getUserRoleIntlKey } from '@client/views/SysAdmin/Team/utils'
import { Link } from '@opencrvs/components'

interface IUserReviewFormProps {
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
  userDetails: UserDetails | null
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
    let nameJoined = false,
      fieldValue = ''
    const sections: ISectionData[] = []
    getVisibleSectionGroupsBasedOnConditions(
      userFormSection,
      this.props.formData
    ).forEach((group) => {
      group.fields.forEach((field: IFormField, idx) => {
        if (field.hideValueInPreview) {
          return
        } else if (field.type === SUBSECTION_HEADER || field.type === DIVIDER) {
          return
        } else if (field && field.type === FIELD_GROUP_TITLE) {
          sections.push({ title: intl.formatMessage(field.label), items: [] })
        } else if (field && sections.length > 0) {
          if (field.name === 'username' && !this.getValue(field)) return
          let label =
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
                  allowedDocType={field.allowedDocType}
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
            fieldValue = this.getValue(field)

            if (['firstNamesEng', 'familyNameEng'].includes(field.name)) {
              if (nameJoined) return
              label = intl.formatMessage(constantsMessages.name)
              fieldValue = this.getName(group.fields)
              nameJoined = true
            }

            sections[sections.length - 1].items.push({
              label: <Label>{label}</Label>,
              value: <Value id={`value_${idx}`}>{fieldValue}</Value>,
              actions:
                !(
                  field.name === 'registrationOffice' &&
                  this.props.userDetails?.systemRole !== 'NATIONAL_SYSTEM_ADMIN'
                ) && !field.readonly ? (
                  <Link
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
                  </Link>
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
      const offlineLocations = field.searchableResource.reduce(
        (locations, resource) => {
          return {
            ...locations,
            ...getListOfLocations(
              this.props.offlineCountryConfiguration,
              resource
            )
          }
        },
        {}
      ) as { [key: string]: ILocation }

      const locationId = formData[field.name] as string
      return offlineLocations[locationId] && offlineLocations[locationId].name
    }

    return formData[field.name]
      ? typeof formData[field.name] !== 'object'
        ? field.name === 'systemRole'
          ? intl.formatMessage(userMessages[formData.systemRole as string])
          : field.name === 'role'
          ? intl.formatMessage({
              id: getUserRoleIntlKey(formData.role as string)
            })
          : String(formData[field.name])
        : (formData[field.name] as IDynamicValues).label
      : ''
  }

  getName = (fields: IFormField[]) => {
    const firstNamesEngField = fields.find(
      (field) => field.name === 'firstNamesEng'
    ) as IFormField
    const familyNameEngField = fields.find(
      (field) => field.name === 'familyNameEng'
    ) as IFormField

    return `${this.getValue(firstNamesEngField)} ${this.getValue(
      familyNameEngField
    )}`
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
    let title: string | undefined
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
            (this.props.formData.systemRole === 'LOCAL_REGISTRAR' ||
              this.props.formData.systemRole === 'NATIONAL_REGISTRAR') &&
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
      title = section.title && intl.formatMessage(section.title)
      actionComponent = (
        <PrimaryButton
          id="submit_user_form"
          disabled={
            (this.props.formData.systemRole === 'LOCAL_REGISTRAR' ||
              this.props.formData.systemRole === 'NATIONAL_REGISTRAR') &&
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
        goHome={() =>
          locationDetails
            ? goToTeamUserList(locationDetails.id)
            : userDetails?.primaryOffice?.id &&
              goToTeamUserList(userDetails.primaryOffice.id)
        }
        hideBackground={true}
      >
        <Content title={intl.formatMessage(section.name)} showTitleOnMobile>
          <Container>
            {this.transformSectionData().map((sec, index) => {
              return (
                <React.Fragment key={index}>
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
                </React.Fragment>
              )
            })}
            <Action>{actionComponent}</Action>
          </Container>
        </Content>
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
    goToTeamUserList: (id: string) => dispatch(goToTeamUserList(id)),
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
