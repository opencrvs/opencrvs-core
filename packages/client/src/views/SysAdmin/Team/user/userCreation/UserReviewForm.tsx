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
  generateCreateUserSectionUrl,
  generateUserReviewFormUrl
} from '@client/navigation'
import { ILocation, IOfflineData } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import { draftToGqlTransformer } from '@client/transformer'
import {
  clearUserFormData,
  modifyUserFormData,
  submitFail,
  submitSuccess
} from '@client/user/userReducer'
import { Action } from '@client/views/SysAdmin/Team/user/userCreation/UserForm'
import { SuccessButton, ICON_ALIGNMENT } from '@opencrvs/components/lib/buttons'
import { Button } from '@opencrvs/components/lib/Button'
import { IDynamicValues } from '@opencrvs/components/lib/common-types'
import { ActionPageLight } from '@opencrvs/components/lib/ActionPageLight'
import { ApolloClient, useMutation } from '@apollo/client'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect, useDispatch } from 'react-redux'
import { Dispatch } from 'redux'
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
import {
  RouteComponentProps,
  withRouter
} from '@client/components/WithRouterProps'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CreateOrUpdateUserMutation,
  CreateOrUpdateUserMutationVariables
} from '@client/utils/gateway'
import * as routes from '@client/navigation/routes'
import { stringify } from 'query-string'

interface IUserReviewFormProps {
  userId?: string
  section: IFormSection
  formData: IFormSectionData
  client: ApolloClient<unknown>
}

interface IDispatchProps {
  userFormSection: IFormSection
  offlineCountryConfiguration: IOfflineData
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

const SignatureImage = styled.img`
  max-width: 70%;
`

const Label = styled.span`
  ${({ theme }) => theme.fonts.bold16};
  width: 100%;
`

const Value = styled.span`
  ${({ theme }) => theme.fonts.reg16}
`

const UserReviewFormComponent = ({
  intl,
  userFormSection,
  userDetails,
  formData,
  offlineCountryConfiguration,
  userId,
  section
}: IFullProps & IDispatchProps) => {
  const navigate = useNavigate()

  const params = useParams()
  const dispatch = useDispatch()
  const locationId = formData['registrationOffice']

  const [createOrUpdateUser] = useMutation<
    CreateOrUpdateUserMutation,
    CreateOrUpdateUserMutationVariables
  >(createOrUpdateUserMutation, {
    onError(error, clientOptions) {
      dispatch(submitFail(error))
    },
    onCompleted() {
      dispatch(clearUserFormData)

      navigate({
        pathname: routes.TEAM_USER_LIST,
        search: stringify({
          locationId
        })
      })

      dispatch(submitSuccess(Boolean(params.userId)))
    }
  })

  const getValue = (field: IFormField) => {
    if (field.type === LOCATION_SEARCH_INPUT) {
      const offlineLocations = field.searchableResource.reduce(
        (locations, resource) => {
          return {
            ...locations,
            ...getListOfLocations(offlineCountryConfiguration, resource)
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

  const transformSectionData = () => {
    let nameJoined = false,
      fieldValue
    const sections: ISectionData[] = []
    getVisibleSectionGroupsBasedOnConditions(userFormSection, formData).forEach(
      (group) => {
        group.fields.forEach((field: IFormField, idx) => {
          if (field.hideValueInPreview) {
            return
          } else if (
            field.type === SUBSECTION_HEADER ||
            field.type === DIVIDER
          ) {
            return
          } else if (field && field.type === FIELD_GROUP_TITLE) {
            sections.push({ title: intl.formatMessage(field.label), items: [] })
          } else if (field && sections.length > 0) {
            if (field.name === 'username' && !getValue(field)) return
            let label = intl.formatMessage(field.label)
            if (
              !getConditionalActionsForField(
                field,
                formData,
                offlineCountryConfiguration,
                { user: formData },
                userDetails
              ).includes('hide')
            ) {
              fieldValue = getValue(field)

              if (['firstNamesEng', 'familyNameEng'].includes(field.name)) {
                if (nameJoined) return
                label = intl.formatMessage(constantsMessages.name)
                fieldValue = getName(group.fields)
                nameJoined = true
              }

              if (field.type === SIMPLE_DOCUMENT_UPLOADER) {
                fieldValue = (
                  <SignatureImage
                    src={
                      (formData[field.name] as IAttachmentValue | undefined)
                        ?.data
                    }
                  />
                )
              }

              sections[sections.length - 1].items.push({
                label: <Label>{label}</Label>,
                value: <Value id={`value_${idx}`}>{fieldValue}</Value>,
                actions:
                  !(
                    field.name === 'registrationOffice' &&
                    userDetails?.systemRole !== 'NATIONAL_SYSTEM_ADMIN'
                  ) && !field.readonly ? (
                    <Link
                      id={`btn_change_${field.name}`}
                      onClick={() => {
                        userId
                          ? navigate(
                              generateUserReviewFormUrl({
                                userId,
                                sectionId: userFormSection.id,
                                groupId: group.id,
                                userFormFieldNameHash: field.name
                              })
                            )
                          : navigate(
                              generateCreateUserSectionUrl({
                                sectionId: userFormSection.id,
                                groupId: group.id,
                                // @TODO: check if this is the one?
                                userFormFieldNameHash: field.name
                              })
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
      }
    )

    return sections
  }

  const getName = (fields: IFormField[]) => {
    const firstNamesEngField = fields.find(
      (field) => field.name === 'firstNamesEng'
    ) as IFormField
    const familyNameEngField = fields.find(
      (field) => field.name === 'familyName'
    ) as IFormField

    return `${getValue(firstNamesEngField)} ${getValue(familyNameEngField)}`
  }

  const handleSubmit = () => {
    const variables = draftToGqlTransformer(
      { sections: [userFormSection] },
      { user: formData },
      '',
      userDetails,
      offlineCountryConfiguration
    )
    if (variables.user._fhirID) {
      variables.user.id = variables.user._fhirID
      delete variables.user._fhirID
    }

    if (variables.user.signature) {
      delete variables.user.signature.name
      delete variables.user.signature.__typename //to fix updating registrar bug
    }

    createOrUpdateUser({
      variables: variables as CreateOrUpdateUserMutationVariables
    })
  }

  let title: string | undefined
  let actionComponent: JSX.Element

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
          (formData.systemRole === 'LOCAL_REGISTRAR' ||
            formData.systemRole === 'NATIONAL_REGISTRAR') &&
          !formData.signature
        }
        onClick={handleSubmit}
        icon={() => <Check />}
        align={ICON_ALIGNMENT.LEFT}
      >
        {intl.formatMessage(buttonMessages.confirm)}
      </SuccessButton>
    )
  } else {
    title = section.title && intl.formatMessage(section.title)
    actionComponent = (
      <Button
        id="submit_user_form"
        type="positive"
        size="large"
        fullWidth
        disabled={
          (formData.systemRole === 'LOCAL_REGISTRAR' ||
            formData.systemRole === 'NATIONAL_REGISTRAR') &&
          !formData.signature
        }
        onClick={handleSubmit}
      >
        {intl.formatMessage(messages.createUser)}
      </Button>
    )
  }
  return (
    <ActionPageLight
      title={title}
      goBack={() => navigate(-1)}
      goHome={() => {
        if (locationDetails.id) {
          navigate({
            pathname: routes.TEAM_USER_LIST,
            search: stringify({
              locationId: locationDetails.id
            })
          })

          return
        }

        if (userDetails?.primaryOffice?.id) {
          navigate({
            pathname: routes.TEAM_USER_LIST,
            search: stringify({
              locationId: userDetails.primaryOffice.id
            })
          })
        }
      }}
      hideBackground={true}
    >
      <Content title={intl.formatMessage(section.name)} showTitleOnMobile>
        <Container>
          {transformSectionData().map((sec, index) => {
            return (
              <React.Fragment key={index}>
                <ListViewSimplified bottomBorder>
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

const mapDispatchToProps = (dispatch: Dispatch, props: IFullProps) => {
  return {
    modify: (values: IFormSectionData) => dispatch(modifyUserFormData(values))
  }
}
export const UserReviewForm = withRouter(
  connect((store: IStoreState) => {
    return {
      userFormSection: store.userForm.userForm!.sections[0],
      offlineCountryConfiguration: getOfflineData(store),
      userDetails: getUserDetails(store)
    }
  }, mapDispatchToProps)(injectIntl(UserReviewFormComponent))
)
