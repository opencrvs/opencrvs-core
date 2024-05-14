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
import { Content, ContentSize } from '@opencrvs/components/lib'
import { buttonMessages } from '@client/i18n/messages'
import { useIntl } from 'react-intl'
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
  formatUrl,
  goToIssueCertificate,
  goToVerifyIssueCollector
} from '@client/navigation'
import { replaceInitialValues } from '@client/views/RegisterForm/RegisterForm'
import { issueMessages } from '@client/i18n/messages/issueCertificate'
import { getIssueCertCollectorGroupForEvent } from '@client/forms/certificate/fieldDefinitions/collectorSection'
import { Redirect } from 'react-router'
import { REGISTRAR_HOME_TAB } from '@client/navigation/routes'
import { WORKQUEUE_TABS } from '@client/components/interface/Navigation'

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
  const fields = getIssueCertCollectorGroupForEvent(declaration)

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

  if (!declaration) {
    return (
      <Redirect
        to={formatUrl(REGISTRAR_HOME_TAB, {
          tabId: WORKQUEUE_TABS.readyToIssue,
          selectorId: ''
        })}
      />
    )
  }

  return (
    <Content
      title={intl.formatMessage(issueMessages.issueCertificate)}
      size={ContentSize.SMALL}
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
