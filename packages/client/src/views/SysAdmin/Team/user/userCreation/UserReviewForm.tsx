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
  getConditionalActionsForField
} from '@client/forms/utils'
import {
  buttonMessages as messages,
  userMessages,
  buttonMessages,
  constantsMessages
} from '@client/i18n/messages'
import { ILocation, IOfflineData } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import {
  modifyUserFormData,
  submitUserFormData
} from '@client/user/userReducer'
import { Action } from '@client/views/SysAdmin/Team/user/userCreation/UserForm'
import { SuccessButton, ICON_ALIGNMENT } from '@opencrvs/components/lib/buttons'
import { Button } from '@opencrvs/components/lib/Button'
import { IDynamicValues } from '@opencrvs/components/lib/common-types'
import { ActionPageLight } from '@opencrvs/components/lib/ActionPageLight'
import { ApolloClient } from '@apollo/client'
import * as React from 'react'
import {
  injectIntl,
  IntlShape,
  WrappedComponentProps as IntlShapeProps
} from 'react-intl'
import { connect } from 'react-redux'
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
import { Link } from '@opencrvs/components'
import { draftToGqlTransformer } from '@client/transformer'
import {
  RouteComponentProps,
  withRouter
} from '@client/components/WithRouterProps'
import { useNavigate } from 'react-router-dom'
import * as routes from '@client/navigation/routes'
import { stringify } from 'qs'
import {
  generateCreateUserSectionUrl,
  generateUserReviewFormUrl
} from '@client/navigation'
import { getListOfLocations } from '@client/utils/validate'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import { UUID, Role, FullNameV1 } from '@opencrvs/commons/client'
import { formatUserRole, useRoles } from '@client/v2-events/hooks/useRoles'
import { useUsers } from '@client/v2-events/hooks/useUsers'

interface IUserReviewFormProps {
  userId?: string
  section: IFormSection
  formData: IFormSectionData
  client: ApolloClient<unknown>
}

interface IStateProps {
  userFormSection: IFormSection
  offlineCountryConfiguration: IOfflineData
  userDetails: UserDetails | null
}
interface IDispatchProps {
  modify: (values: IFormSectionData) => void
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

interface ICommonProps {
  offlineCountryConfiguration: IOfflineData
  formData: IFormSectionData
  userRoles: Role[]
  userDetails: UserDetails | null
  intl: IntlShape
}
interface ISectionDataProps {
  userFormSection: IFormSection
  userId: string | undefined
  canChangeLocation: boolean
  navigate: ReturnType<typeof useNavigate>
}

const transformSectionData = ({
  userFormSection,
  userId,
  canChangeLocation,
  navigate,
  ...props
}: ISectionDataProps & ICommonProps) => {
  const { formData, intl } = props
  let nameJoined = false,
    fieldValue
  const sections: ISectionData[] = []
  getVisibleSectionGroupsBasedOnConditions(userFormSection, formData).forEach(
    (group) => {
      group.fields.forEach((field: IFormField, idx) => {
        if (field.hideValueInPreview) {
          return
        } else if (field.type === SUBSECTION_HEADER || field.type === DIVIDER) {
          return
        } else if (field && field.type === FIELD_GROUP_TITLE) {
          sections.push({ title: intl.formatMessage(field.label), items: [] })
        } else if (field && sections.length > 0) {
          if (field.name === 'username' && !getValue({ ...props, field }))
            return
          let label = intl.formatMessage(field.label)
          if (
            !getConditionalActionsForField(
              field,
              props.formData,
              props.offlineCountryConfiguration,
              { user: props.formData },
              props.userDetails
            ).includes('hide')
          ) {
            fieldValue = getValue({ ...props, field })

            if (['firstNamesEng', 'familyNameEng'].includes(field.name)) {
              if (nameJoined) return
              label = intl.formatMessage(constantsMessages.name)
              fieldValue = getName({ ...props, fields: group.fields })
              nameJoined = true
            }

            if (field.type === SIMPLE_DOCUMENT_UPLOADER) {
              fieldValue = (
                <SignatureImage
                  src={
                    (formData[field.name] as IAttachmentValue | undefined)?.data
                  }
                />
              )
            }

            sections[sections.length - 1].items.push({
              label: <Label>{label}</Label>,
              value: <Value id={`value_${idx}`}>{fieldValue}</Value>,
              actions:
                !(field.name === 'registrationOffice' && !canChangeLocation) &&
                !field.readonly ? (
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

const getValue = ({
  offlineCountryConfiguration,
  formData,
  userRoles,
  intl,
  field
}: ICommonProps & { field: IFormField }) => {
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

  const role = userRoles.find(({ id }) => id === formData.role)

  return formData[field.name]
    ? typeof formData[field.name] !== 'object'
      ? field.name === 'systemRole'
        ? intl.formatMessage(userMessages[formData.systemRole as string])
        : field.name === 'role' && role
          ? formatUserRole(role.id, intl)
          : String(formData[field.name])
      : (formData[field.name] as IDynamicValues).label
    : ''
}

const getName = ({
  fields,
  ...props
}: ICommonProps & { fields: IFormField[] }) => {
  const firstNamesEngField = fields.find(
    (field) => field.name === 'firstNamesEng'
  ) as IFormField
  const familyNameEngField = fields.find(
    (field) => field.name === 'familyNameEng'
  ) as IFormField

  return `${getValue({
    ...props,
    field: firstNamesEngField
  })} ${getValue({
    ...props,
    field: familyNameEngField
  })}`
}

const UserReviewFormComponent = ({
  intl,
  section,
  userId,
  userFormSection,
  formData,
  userDetails,
  offlineCountryConfiguration
}: IFullProps & IDispatchProps & IStateProps) => {
  const navigate = useNavigate()

  const { createUser } = useUsers()
  const createUserMutation = createUser({
    onSuccess: () => {
      navigate({
        pathname: routes.TEAM_USER_LIST,
        search: stringify({
          locationId: formData.registrationOffice as string
        })
      })
    }
  })

  const { getLocations } = useLocations()
  const locations = getLocations.useSuspenseQuery()

  let title: string | undefined
  let actionComponent: JSX.Element
  const locationId = formData['registrationOffice'] as string

  const parsedLocationId = UUID.safeParse(locationId)

  const { listRoles } = useRoles()
  const [userRoles] = listRoles.useSuspenseQuery()
  const userRole = userRoles.find(({ id }) => id === formData.role)

  const parsedPrimaryOfficeId = UUID.safeParse(userDetails?.primaryOfficeId)
  const administrativeAreaId = parsedPrimaryOfficeId.success
    ? (locations.get(parsedPrimaryOfficeId.data)?.administrativeAreaId ?? null)
    : null

  // stop early since there are a lot of locations.
  const isMultipleOfficeUnderJurisdiction = [...locations.values()].some(
    (location) =>
      location.administrativeAreaId === administrativeAreaId &&
      location.id !== parsedPrimaryOfficeId.data
  )

  // @TODO: This should be refactored separately from the API replacement work.
  // It works now but the whole flow is sus.
  const handleSubmit = () => {
    const {
      phoneNumber,
      familyName,
      firstName,
      seperator,
      registrationOffice,
      ...rest
    } = formData

    // @ts-ignore
    createUserMutation.mutate({
      ...rest,
      primaryOfficeId: registrationOffice as string,
      mobile: phoneNumber as string,
      name: [
        {
          use: 'en',
          family: familyName as string,
          given: [firstName] as string[]
        }
      ]
    })
  }

  if (userId) {
    title = intl.formatMessage(sysAdminMessages.editUserDetailsTitle)

    actionComponent = (
      <SuccessButton
        id="submit-edit-user-form"
        disabled={
          userRole?.scopes?.includes('profile.electronic-signature') &&
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
          userRole?.scopes?.includes('profile.electronic-signature') &&
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
        if (parsedLocationId.success && locations.get(parsedLocationId.data)) {
          navigate({
            pathname: routes.TEAM_USER_LIST,
            search: stringify({
              locationId
            })
          })
        } else if (userDetails?.primaryOfficeId) {
          navigate({
            pathname: routes.TEAM_USER_LIST,
            search: stringify({
              locationId: userDetails.primaryOfficeId
            })
          })
        }
      }}
      hideBackground={true}
    >
      <Content title={intl.formatMessage(section.name)} showTitleOnMobile>
        <Container>
          {transformSectionData({
            userFormSection,
            formData,
            intl,
            userId,
            canChangeLocation: isMultipleOfficeUnderJurisdiction,
            userRoles,
            userDetails,
            offlineCountryConfiguration,
            navigate
          }).map((sec, index) => {
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
  const navigateToUserList = () =>
    props.router.navigate({
      pathname: routes.TEAM_USER_LIST,
      search: stringify({
        locationId: props.formData.registrationOffice as string
      })
    })

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
