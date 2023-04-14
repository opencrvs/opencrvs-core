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
import { Content } from '@opencrvs/components/lib'
import {
  ICertificate,
  IPrintableDeclaration,
  modifyDeclaration
} from '@client/declarations'
import {
  FIELD_WITH_DYNAMIC_DEFINITIONS,
  IFormField,
  SELECT_WITH_OPTIONS,
  TEXT
} from '@client/forms'
import {
  identityHelperTextMapper,
  identityNameMapper,
  identityOptions,
  identityTypeMapper
} from '@client/forms/identity'
import { fieldValidationDescriptorToValidationFunction } from '@client/forms/mappings/deserializer'
import { conditionals } from '@client/forms/utils'
import { formMessages } from '@client/i18n/messages/form'
import { validIDNumber } from '@client/utils/validate'
import React from 'react'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { useIntl } from 'react-intl'
import { PrimaryButton } from '@opencrvs/components/lib/buttons/PrimaryButton'
import { groupHasError } from '@client/views/CorrectionForm/utils'
import { FormFieldGenerator } from '@client/components/form'
import { useDispatch } from 'react-redux'
import {
  goToIssueCertificatePayment,
  goToVerifyCollector,
  goToVerifyIssueCollector
} from '@client/navigation'
import { replaceInitialValues } from '@client/views/RegisterForm/RegisterForm'
import { issueMessages } from '@client/i18n/messages/issueCertificate'

const fields: IFormField[] = [
  {
    name: 'iDType',
    type: SELECT_WITH_OPTIONS,
    label: formMessages.typeOfId,
    required: true,
    initialValue: '',
    validator: [
      fieldValidationDescriptorToValidationFunction({
        operation: 'requiredBasic'
      })
    ],
    placeholder: formMessages.select,
    options: identityOptions
  },
  {
    name: 'iDTypeOther',
    type: TEXT,
    label: formMessages.iDTypeOtherLabel,
    required: true,
    initialValue: '',
    validator: [
      fieldValidationDescriptorToValidationFunction({
        operation: 'requiredBasic'
      })
    ],
    conditionals: [conditionals.iDType]
  },
  {
    name: 'iD',
    type: FIELD_WITH_DYNAMIC_DEFINITIONS,
    dynamicDefinitions: {
      label: {
        dependency: 'iDType',
        labelMapper: identityNameMapper
      },
      helperText: {
        dependency: 'iDType',
        helperTextMapper: identityHelperTextMapper
      },
      type: {
        kind: 'dynamic',
        dependency: 'iDType',
        typeMapper: identityTypeMapper
      },
      validator: [
        {
          validator: validIDNumber,
          dependencies: ['iDType']
        }
      ]
    },
    label: formMessages.iD,
    required: true,
    initialValue: '',
    validator: [
      fieldValidationDescriptorToValidationFunction({
        operation: 'requiredBasic'
      })
    ],
    conditionals: [conditionals.iDAvailable]
  },
  {
    name: 'firstName',
    type: TEXT,
    label: formMessages.firstName,
    required: true,
    initialValue: '',
    validator: [
      fieldValidationDescriptorToValidationFunction({
        operation: 'requiredBasic'
      })
    ]
  },
  {
    name: 'lastName',
    type: TEXT,
    label: formMessages.lastName,
    required: true,
    initialValue: '',
    validator: [
      fieldValidationDescriptorToValidationFunction({
        operation: 'requiredBasic'
      })
    ]
  },
  {
    name: 'relationship',
    type: TEXT,
    label: formMessages.informantsRelationWithChild,
    required: true,
    initialValue: '',
    validator: [
      fieldValidationDescriptorToValidationFunction({
        operation: 'requiredBasic'
      })
    ]
  }
]

export const IssueCollectorFormForOthers = ({
  declaration
}: {
  declaration: IPrintableDeclaration
}) => {
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
    const event = declaration.event
    dispatch(goToIssueCertificatePayment(declaration.id, event))
  }

  return (
    <Content
      title={intl.formatMessage(issueMessages.collectorDetails)}
      bottomActionButtons={[
        <PrimaryButton
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
    >
      <FormFieldGenerator
        id="otherCollector"
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
