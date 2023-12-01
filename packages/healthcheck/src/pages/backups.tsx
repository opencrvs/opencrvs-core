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
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { SearchTool } from '@opencrvs/components/lib/SearchTool'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { Button } from '@opencrvs/components/lib/Button'
import { Table } from '@opencrvs/components/lib/Table'
import DynamicModal from '@/components/DynamicModal'
import { DateField } from '@opencrvs/components/lib/DateField'

const Search = styled(SearchTool)`
  margin-right: 10px;
  width: 70%;
  border: 2px solid #93acd7;
  background-color: white;
`
const ServiceContent = styled(Content)`
  size: 'large';
  width: 200%;
`
interface Backup {
  date: string
  backup: string
  status: string
  // Add other backup fields as needed
}

export default function Backups() {
  type ButtonType = 'primary' | 'secondary'

  const [backups, setBackups] = useState<Backup[]>([
    {
      date: '01/01/2024',
      backup: 'Auth',
      status: 'Exists'
    },
    {
      date: '02/01/2024',
      backup: 'Minio',
      status: 'Not Exist'
    }
  ])

  useEffect(() => {
    async function fetchBackups() {
      try {
        const response = await fetch('/api/backups')
        const data = await response.json()
        console.log(
          `==============================${data.length}===========================`
        )
        setBackups(data)
      } catch (error) {
        console.error('Error fetching backups:', error)
      }
    }

    fetchBackups()
  }, [])

  const columns = [
    { label: 'Date', width: 30, key: 'date' },
    { label: 'Backup', width: 40, key: 'backup' },
    { label: 'Status', width: 30, key: 'status' }
  ]

  const [modalState, setModalState] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [Exists, setExists] = useState<ButtonType>('secondary')
  const [NotExists, setNotExists] = useState<ButtonType>('secondary')

  const handleClose = () => {
    setModalState(false)
  }

  return (
    <ServiceContent size={ContentSize.LARGE} title="Backups">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div
          style={{
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <h4>Filter: </h4>
          <Button
            type="primary"
            size="small"
            style={{ marginRight: 5, marginLeft: 5 }}
          >
            {' '}
            All{' '}
          </Button>
          <Button
            type={Exists}
            size="small"
            style={{ marginRight: 5 }}
            onClick={() => setExists('primary')}
          >
            {' '}
            Exists{' '}
          </Button>
          <Button
            type={NotExists}
            size="small"
            style={{ marginRight: 5 }}
            onClick={() => setNotExists('primary')}
          >
            {' '}
            NotExists{' '}
          </Button>
        </div>

        <div
          style={{
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {<DateField id="date-field" onChange={() => {}} />}

          <Button type="primary" size="small" style={{ marginRight: 5 }}>
            {' '}
            Search{' '}
          </Button>
        </div>
      </div>

      <Table
        // totalItems={Object.keys(services).length}
        pageSize={5}
        columns={columns}
        currentPage={currentPage}
        isFullPage={true}
        onPageChange={(page) => setCurrentPage(page)}
        content={backups.map((backup) => ({
          date: backup.date,
          backup: backup.backup,
          status: 'Exists'
        }))}
      />

      {modalState && (
        <DynamicModal
          title="Notification Checks"
          show={modalState}
          closeModal={handleClose}
        />
      )}
    </ServiceContent>
  )
}
