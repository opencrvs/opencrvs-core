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
import styled from '@client/styledComponents'
import { NavigationSubItem } from '@opencrvs/components/lib/interface/Navigation/NavigationSubItem'
import { IForm } from '@client/forms'
import { EventType } from '@client/views/SysAdmin/Config/FormConfigWizard'
import { IntlShape } from 'react-intl'
import { configMessage } from '@client/components/config/Config'
import { goToPageNavigation } from '@client/navigation'

const Container = styled.div`
  top: 56px;
  width: 250px;
  position: fixed;
  height: 100%;
  border-right: 1px solid ${({ theme }) => theme.colors.grey300};
  background-color: ${({ theme }) => theme.colors.white};
`

const Title = styled.div`
  margin-top: 16px;
  margin-bottom: 16px;
  margin-left: 24px;
  color: ${({ theme }) => theme.colors.grey600};
  ${({ theme }) => theme.fonts.subtitleStyle}
`

interface IPageNavigation {
  intl: IntlShape
  registerForm: { [key: string]: IForm }
  section?: string
  event?: EventType
  goToPageNavigation: typeof goToPageNavigation
}

export const TAB_BIRTH = {
  INTRODUCTION: 'introduction',
  CHILD_DETAILS: 'childDetails',
  MOTHERS_DETAILS: 'mothersDetails',
  FATHERS_DETATILS: 'fathersDetails',
  INFORMANT_DETAILS: 'informantDetails',
  DOCUMENTS_UPLOAD: 'documentsUpload'
}

export const PageNavigation = (props: IPageNavigation) => {
  const { event, intl, section, goToPageNavigation } = props
  const sectionTab = section || 'introduction'
  console.log(props)
  return (
    <Container>
      <Title>Pages</Title>

      {event === 'birth' &&
        Object.keys(TAB_BIRTH).map((tab, idx) => (
          <NavigationSubItem
            key={idx}
            label={`${idx + 1}. ${intl.formatMessage(
              configMessage[TAB_BIRTH[tab as keyof typeof TAB_BIRTH]]
            )}`}
            leftPadding={29}
            isSelected={sectionTab === TAB_BIRTH[tab as keyof typeof TAB_BIRTH]}
            onClick={() =>
              goToPageNavigation(
                event!,
                TAB_BIRTH[tab as keyof typeof TAB_BIRTH]
              )
            }
          />
        ))}
    </Container>
  )
}
