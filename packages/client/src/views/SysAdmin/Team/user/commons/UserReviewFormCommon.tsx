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
import {
  getVisibleSectionGroupsBasedOnConditions,
  getConditionalActionsForField
} from '@client/forms/utils'
import {
  buttonMessages as messages,
  userMessages,
  constantsMessages
} from '@client/i18n/messages'
import { ILocation, IOfflineData } from '@client/offline/reducer'
import { Action } from '@client/views/SysAdmin/Team/user/userCreation/UserForm'
import { IDynamicValues } from '@opencrvs/components/lib/common-types'
import { ActionPageLight } from '@opencrvs/components/lib/ActionPageLight'
import * as React from 'react'
import { IntlShape, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { UserDetails } from '@client/utils/userUtils'
import {
  ListViewSimplified,
  ListViewItemSimplified,
  IListViewItemSimplifiedProps
} from '@opencrvs/components/lib/ListViewSimplified'
import styled from 'styled-components'
import { Content } from '@opencrvs/components/lib/Content'
import { Link } from '@opencrvs/components'
import { UserRole } from '@client/utils/gateway'
import { usePermissions } from '@client/hooks/useAuthorization'
import { useNavigate } from 'react-router-dom'
import * as routes from '@client/navigation/routes'
import { stringify } from 'query-string'
import {
  generateCreateUserSectionUrl,
  generateUserReviewFormUrl
} from '@client/navigation'
import { getListOfLocations } from '@client/utils/validate'

interface IUserReviewFormProps {
  userId?: string
  section: IFormSection
  formData: IFormSectionData
  actionComponent: JSX.Element
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  submitForm: (variables: Record<string, any>) => void
  userFormSection: IFormSection
  offlineCountryConfiguration: IOfflineData
  userRoles: UserRole[]
  userDetails: UserDetails | null
  title: string
}

interface ISectionData {
  title: string
  items: IListViewItemSimplifiedProps[]
}

type IFullProps = IUserReviewFormProps & IntlShapeProps

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
  userRoles: UserRole[]
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
          ? intl.formatMessage(role.label)
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

export const UserReviewFormCommon = ({
  intl,
  title,
  section,
  userId,
  userFormSection,
  formData,
  userDetails,
  offlineCountryConfiguration,
  userRoles,
  actionComponent
}: IFullProps) => {
  const navigate = useNavigate()

  const { canAccessOffice } = usePermissions()

  const locationId = formData['registrationOffice'] as string
  const locationDetails =
    offlineCountryConfiguration['locations'][locationId] ||
    offlineCountryConfiguration['facilities'][locationId] ||
    offlineCountryConfiguration['offices'][locationId]

  const offlineOffices = Object.values(offlineCountryConfiguration['offices'])
  const isMultipleOfficeUnderJurisdiction =
    offlineOffices.filter(canAccessOffice).length > 1

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
        } else if (userDetails?.primaryOffice?.id) {
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
