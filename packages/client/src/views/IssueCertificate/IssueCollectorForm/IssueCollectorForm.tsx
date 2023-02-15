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
import React from 'react'
import { Content, RadioSize } from '@opencrvs/components/lib'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { useIntl } from 'react-intl'
import { IFormField, RADIO_GROUP } from '@client/forms'
import { FormFieldGenerator } from '@client/components/form'
import {
  modifyDeclaration,
  IPrintableDeclaration,
  ICertificate
} from '@client/declarations'
import { useDispatch } from 'react-redux'
import { PrimaryButton } from '@client/../../components/lib/buttons'
import { groupHasError } from '@client/views/CorrectionForm/utils'
import { goToIssueCertificate } from '@client/navigation'

const fields: IFormField[] = [
  {
    name: 'type',
    type: RADIO_GROUP,
    size: RadioSize.LARGE,
    label: constantsMessages.issueCertificate,
    hideHeader: true,
    required: true,
    initialValue: '',
    validate: [],
    options: [
      { value: 'MOTHER', label: constantsMessages.issueToMother },
      { value: 'FATHER', label: constantsMessages.issueToFather },
      { value: 'OTHER', label: constantsMessages.issueToSomeoneElse }
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

  function continueButtonHandler() {
    const relationship =
      declaration.data.registration.certificates[0].collector?.type
    if (!relationship) return
    if (relationship === 'OTHER') {
      dispatch(goToIssueCertificate(declaration.id, 'otherCollector'))
    } else {
      //go to verify collector
    }
  }

  return (
    <Content
      title="Issue"
      bottomActionButtons={[
        <PrimaryButton
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
    >
      <FormFieldGenerator
        id="collector"
        onChange={(values) => {
          handleChange(values, declaration)
        }}
        setAllFieldsDirty={false}
        fields={fields}
        draftData={declaration.data}
      />
    </Content>
  )
}
