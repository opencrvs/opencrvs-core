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
import React from 'react'
import { Content, RadioSize } from '@opencrvs/components/lib'
import { buttonMessages } from '@client/i18n/messages'
import { useIntl } from 'react-intl'
import { IRadioGroupFormField, RADIO_GROUP } from '@client/forms'
import { FormFieldGenerator } from '@client/components/form'
import {
  modifyDeclaration,
  IPrintableDeclaration,
  ICertificate
} from '@client/declarations'
import { useDispatch } from 'react-redux'
import { PrimaryButton } from '@client/../../components/lib/buttons'
import { groupHasError } from '@client/views/CorrectionForm/utils'
import {
  goToIssueCertificate,
  goToVerifyIssueCollector
} from '@client/navigation'
import { replaceInitialValues } from '@client/views/RegisterForm/RegisterForm'
import { Event } from '@client/utils/gateway'
import { issueMessages } from '@client/i18n/messages/issueCertificate'

const fields: IRadioGroupFormField[] = [
  {
    name: 'type',
    type: RADIO_GROUP,
    size: RadioSize.LARGE,
    label: issueMessages.issueCertificate,
    hideHeader: true,
    required: true,
    initialValue: '',
    validator: [],
    options: [
      { value: 'MOTHER', label: issueMessages.issueToMother },
      { value: 'FATHER', label: issueMessages.issueToFather },
      { value: 'OTHER', label: issueMessages.issueToSomeoneElse }
    ]
  }
]

const commonFieldsForBirthAndDeath: IRadioGroupFormField[] = [
  {
    name: 'type',
    type: RADIO_GROUP,
    size: RadioSize.LARGE,
    label: issueMessages.issueCertificate,
    hideHeader: true,
    required: true,
    initialValue: '',
    validator: [],
    options: [
      { value: 'INFORMANT', label: issueMessages.issueToInformant },
      { value: 'OTHER', label: issueMessages.issueToSomeoneElse }
    ]
  }
]

const fieldsForMarriage: IRadioGroupFormField[] = [
  {
    name: 'type',
    type: RADIO_GROUP,
    size: RadioSize.LARGE,
    label: issueMessages.issueCertificate,
    hideHeader: true,
    required: true,
    initialValue: '',
    validator: [],
    options: [
      { value: 'GROOM', label: issueMessages.issueToGroom },
      { value: 'BRIDE', label: issueMessages.issueToBride },
      { value: 'OTHER', label: issueMessages.issueToSomeoneElse }
    ]
  }
]

export function IssueCollectorForm({
  declaration
}: {
  declaration: IPrintableDeclaration
}) {
  const intl = useIntl()
  const dispatch = useDispatch()

  const handleChange = (
    sectionData: ICertificate['collector'],
    declaration: IPrintableDeclaration
  ) => {
    const certificates = declaration.data.registration.certificates
    const certificate = (certificates && certificates[0]) || {}
    const collector = { ...(certificate.collector || {}), ...sectionData }

    dispatch(
      modifyDeclaration({
        ...declaration,
        data: {
          ...declaration.data,
          registration: {
            ...declaration.data.registration,
            certificates: [
              {
                collector: collector,
                hasShowedVerifiedDocument: false
              }
            ]
          }
        }
      })
    )
  }

  const finalFields = (): IRadioGroupFormField[] => {
    if (declaration.event === Event.Death) {
      return commonFieldsForBirthAndDeath
    } else if (declaration.event === Event.Marriage) {
      return fieldsForMarriage
    }
    const declarationData = declaration.data
    const filteredData = [{ ...fields[0] }]

    const motherDataExists =
      declarationData &&
      declarationData.mother &&
      declarationData.mother.detailsExist

    const fatherDataExists =
      declarationData &&
      declarationData.father &&
      declarationData.father.detailsExist

    if (!fatherDataExists && !motherDataExists)
      return commonFieldsForBirthAndDeath

    if (!fatherDataExists) {
      filteredData[0].options = filteredData[0].options.filter(
        (option) => option.value !== 'FATHER'
      )
    }

    if (!motherDataExists) {
      filteredData[0].options = filteredData[0].options.filter(
        (option) => option.value !== 'MOTHER'
      )
    }

    return filteredData
  }

  function continueButtonHandler() {
    const relationship =
      declaration.data.registration.certificates[0].collector?.type
    const event = declaration.event
    if (!relationship) return
    if (relationship === 'OTHER') {
      dispatch(goToIssueCertificate(declaration.id, 'otherCollector'))
    } else {
      dispatch(goToVerifyIssueCollector(declaration.id, event, relationship))
    }
  }

  return (
    <Content
      title={intl.formatMessage(issueMessages.issueCertificate)}
      bottomActionButtons={[
        <PrimaryButton
          key="continue-button"
          id="continue-button"
          onClick={continueButtonHandler}
          disabled={groupHasError(
            { id: 'collector', fields },
            declaration.data.registration.certificates?.[0]?.collector ?? {}
          )}
        >
          {intl.formatMessage(buttonMessages.continueButton)}
        </PrimaryButton>
      ]}
      showTitleOnMobile
    >
      <FormFieldGenerator
        id="collector"
        key="collector"
        onChange={(values) => {
          handleChange(values, declaration)
        }}
        setAllFieldsDirty={false}
        fields={replaceInitialValues(
          finalFields(),
          (declaration &&
            declaration.data.registration.certificates &&
            declaration.data.registration.certificates[
              declaration.data.registration.certificates.length - 1
            ].collector) ||
            {},
          declaration && declaration.data
        )}
        draftData={declaration.data}
      />
    </Content>
  )
}
