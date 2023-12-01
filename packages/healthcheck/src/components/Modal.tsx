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
import { Button } from '@opencrvs/components/lib/Button'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { Warning } from '@opencrvs/components/lib/icons'
import React, { useState } from 'react'

export default function Modal(props: {
  title: string
  show: boolean
  closeModal: () => void
}) {
  const [showModal, setShowModal] = useState(props.show)

  return (
    <ResponsiveModal
      id={'modalID'}
      actions={[
        <Button
          key={null}
          onClick={props.closeModal}
          type="secondary"
          style={{
            marginRight: 20
          }}
        >
          OK
        </Button>
      ]}
      handleClose={props.closeModal}
      title={props.title}
      show={showModal}
      width={800}
      autoHeight={true}
      contentHeight={200}
    >
      <div
        style={{
          marginLeft: 70,
          marginTop: 10,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Warning />
        <p style={{ marginLeft: 5 }}>
          Failed to login as{' '}
          <span style={{ fontStyle: 'italic', fontWeight: 'bold' }}>
            kennedy.mweene
          </span>
        </p>
      </div>

      <div
        style={{
          width: 580,
          height: 100,
          backgroundColor: '#F5F5F5',
          // marginTop: 5,
          marginLeft: 80,
          // border: 'solid',
          borderLeft: 'solid',
          borderColor: '#1470FF',
          paddingLeft: 20
        }}
      >
        <p style={{}}>
          Try running{' '}
          <span style={{ fontWeight: 'bold' }}>`yarn db:backup:restore`</span>{' '}
          in your country config <br />
          repository. This command loads a previous backup <br />
          of the database.
        </p>
      </div>
    </ResponsiveModal>
  )
}
