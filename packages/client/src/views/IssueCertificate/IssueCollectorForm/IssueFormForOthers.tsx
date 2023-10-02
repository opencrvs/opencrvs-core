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
import { Content } from '@opencrvs/components/lib'
import {
  ICertificate,
  IPrintableDeclaration,
  modifyDeclaration
} from '@client/declarations'
import { IFormField } from '@client/forms'
import React from 'react'
import { buttonMessages } from '@client/i18n/messages'
import { useIntl } from 'react-intl'
import { PrimaryButton } from '@opencrvs/components/lib/buttons/PrimaryButton'
import { groupHasError } from '@client/views/CorrectionForm/utils'
import { FormFieldGenerator } from '@client/components/form'
import { useDispatch } from 'react-redux'
import { goToIssueCertificatePayment } from '@client/navigation'
import { replaceInitialValues } from '@client/views/RegisterForm/RegisterForm'
import { issueMessages } from '@client/i18n/messages/issueCertificate'
import {
  collectBirthCertificateFormSection,
  collectDeathCertificateFormSection,
  collectMarriageCertificateFormSection
} from '@client/forms/certificate/fieldDefinitions/collectorSection'
import { Event } from '@client/utils/gateway'

function collectorFormFieldsForOthers(event: Event) {
  const collectCertFormSection =
    event === Event.Birth
      ? collectBirthCertificateFormSection
      : event === Event.Death
      ? collectDeathCertificateFormSection
      : collectMarriageCertificateFormSection

  return collectCertFormSection.groups.find(
    (group) => group.id === 'otherCertCollector'
  )!.fields
}

export const IssueCollectorFormForOthers = ({
  declaration
}: {
  declaration: IPrintableDeclaration
}) => {
  const intl = useIntl()
  const dispatch = useDispatch()

  const fields: IFormField[] = collectorFormFieldsForOthers(declaration.event)
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
    const event = declaration.event
    dispatch(goToIssueCertificatePayment(declaration.id, event))
  }

  return (
    <Content
      title={intl.formatMessage(issueMessages.collectorDetails)}
      bottomActionButtons={[
        <PrimaryButton
          key="continue-button"
          id="continue-button"
          onClick={continueButtonHandler}
          disabled={groupHasError(
            { id: 'otherCollector', fields },
            declaration.data.registration.certificates?.[0]?.collector ?? {}
          )}
        >
          {intl.formatMessage(buttonMessages.continueButton)}
        </PrimaryButton>
      ]}
      showTitleOnMobile
    >
      <FormFieldGenerator
        id="otherCollector"
        key="otherCollector"
        onChange={(values) => {
          handleChange(values, declaration)
        }}
        setAllFieldsDirty={false}
        fields={replaceInitialValues(
          fields,
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
