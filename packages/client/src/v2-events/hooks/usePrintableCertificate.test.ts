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
  ActionStatus,
  ActionType,
  EventDocument,
  generateActionDocuments,
  generateEventDocument,
  getUUID,
  PrintCertificateAction,
  TokenUserType,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { countPrintsOfTemplate } from './usePrintableCertificate'

const TEMPLATE_ID = 'tennis-club-membership-certificate'

function print(
  confirmation?: Parameters<typeof generateActionDocuments>[0]['confirmation']
) {
  return generateActionDocuments({
    configuration: tennisClubMembershipEvent,
    action: ActionType.PRINT_CERTIFICATE,
    defaults: { content: { templateId: TEMPLATE_ID } },
    confirmation
  })
}

function eventWithPrints(...prints: EventDocument['actions'][]) {
  const event = generateEventDocument({
    configuration: tennisClubMembershipEvent,
    actions: [{ type: ActionType.CREATE }]
  })
  return { ...event, actions: [...event.actions, ...prints.flat()] }
}

describe('countPrintsOfTemplate', () => {
  it('counts a print confirmed synchronously once', () => {
    expect(countPrintsOfTemplate(eventWithPrints(print()), TEMPLATE_ID)).toBe(1)
  })

  it('counts a print accepted asynchronously, whose Accepted action carries no content', () => {
    const [requested, accepted] = print({
      defaults: {
        transactionId: getUUID(),
        createdByUserType: TokenUserType.enum.system
      }
    })
    const { content: _content, ...acceptedWithoutContent } =
      accepted as PrintCertificateAction

    expect(
      countPrintsOfTemplate(
        eventWithPrints([requested, acceptedWithoutContent]),
        TEMPLATE_ID
      )
    ).toBe(1)
  })

  it('does not count pending or rejected prints', () => {
    const event = eventWithPrints(
      print({ status: ActionStatus.Requested }),
      print({ status: ActionStatus.Rejected })
    )

    expect(countPrintsOfTemplate(event, TEMPLATE_ID)).toBe(0)
  })

  it('does not count prints of another template', () => {
    expect(countPrintsOfTemplate(eventWithPrints(print()), 'other')).toBe(0)
  })
})
