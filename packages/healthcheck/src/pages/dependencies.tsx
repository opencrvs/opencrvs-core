import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { SearchTool } from '@opencrvs/components/lib/SearchTool'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { Button } from '@opencrvs/components/lib/Button'
import { Table } from '@opencrvs/components/lib/Table'
import { Pill } from '@opencrvs/components/lib/Pill'
import { Offline, Success, TrackingID } from '@opencrvs/components/lib/icons'
import { useRouter } from 'next/router'
import DynamicModal from '@/components/DynamicModal'
import { Service, Status } from '@/lib/check-health'
import { LoadingGrey, Spinner } from '@opencrvs/components'

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

export default function dependencies() {
  type ButtonType = 'primary' | 'secondary'

  const router = useRouter()
  const pingUrl = 'http://localhost:7070/ping?service'
  const columns = [
    { label: 'Service', width: 25, key: 'service' },
    { label: 'Port', width: 20, key: 'port' },
    { label: 'Status', width: 20, key: 'status' },
    { label: 'Timespan', width: 20, key: 'span' },
    { label: 'Action', width: 15, key: 'action' }
  ]
  const [modalState, setModalState] = useState(false)
  const [Running, setRunning] = useState<ButtonType>('secondary')
  const [services, setServices] = useState({
    CountryConfig: {
      name: 'CountryConfig',
      url: `${pingUrl}=countryconfig`,
      status: 'LOADING',
      type: 'dependency',
      icon: <LoadingGrey />
    },
    Openhim: {
      name: 'Openhim',
      acceptedStatusCodes: [200, 404],
      url: `${pingUrl}=openhim`,
      status: 'LOADING',
      type: 'dependency',
      icon: <LoadingGrey />
    },
    MongoDB: {
      name: 'MongoDB',
      url: 'https://stackoverflow.com/questions/37839365/simple-http-tcp-health-check-for-mongodb/37852368#37852368',
      status: 'LOADING',
      type: 'dependency',
      icon: <LoadingGrey />
    },
    Influx: {
      name: 'Influx',
      url: `${pingUrl}=influx`,
      status: 'LOADING',
      type: 'dependency',
      icon: <LoadingGrey />
    },
    Minio: {
      name: 'Minio',
      url: 'http://localhost:3535/minio/health/cluster',
      status: 'LOADING',
      type: 'dependency',
      icon: <LoadingGrey />
    },
    Kibana: {
      name: 'Kibana',
      url: 'https://kibana.farajaland.opencrvs.org/api/status',
      status: 'LOADING',
      type: 'dependency',
      icon: <LoadingGrey />
    },
    Elasticsearch: {
      name: 'Elasticsearch',
      url: 'http://localhost:9200/_cluster/health',
      status: 'LOADING',
      type: 'dependency',
      icon: <LoadingGrey />
    }
  })

  const handleView = () => {
    setModalState(true)
  }
  const handleClose = () => {
    setModalState(false)
  }

  useEffect(() => {
    function setHealthy(service: Service) {
      setServices((services) => ({
        ...services,
        [service.name]: {
          ...service,
          status: 'OK',
          icon: (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Pill label="Running" type="active" size="small" />
              <Success />
            </div>
          )
        }
      }))
    }
    function setFailing(service: Service) {
      setServices((services) => ({
        ...services,
        [service.name]: {
          ...service,
          status: 'FAIL',
          icon: (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Pill label="Down" type="inactive" size="small" />
              <div style={{ marginLeft: 10, marginTop: 15 }}>
                <Offline />
              </div>
            </div>
          )
        }
      }))
    }

    Object.values(services).forEach((service) => {
      fetch(service.url)
        .then((res) => {
          if (res.status === 200) {
            return setHealthy(service)
          }

          setFailing(service)
        })
        .catch((err) => {
          setFailing(service)
        })
    })
  }, [])

  return (
    <ServiceContent size={ContentSize.LARGE} title="Dependencies">
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
            type={Running}
            size="small"
            style={{ marginRight: 5 }}
            onClick={() => setRunning('primary')}
          >
            {' '}
            Running{' '}
          </Button>
          <Button type="secondary" size="small" style={{ marginRight: 5 }}>
            {' '}
            Down{' '}
          </Button>
        </div>

        <div
          style={{
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Search
            language="english"
            onClearText={() => {}}
            searchHandler={function noRefCheck() {}}
            // searchParam="String"
            searchTypeList={[
              {
                icon: <TrackingID />,
                invertIcon: <TrackingID />,
                label: '',
                placeHolderText: 'Search for a service',
                value: 'Tracking ID'
              }
            ]}
          />

          <Button type="primary" size="small" style={{ marginRight: 5 }}>
            {' '}
            Search{' '}
          </Button>
        </div>
      </div>

      <Table
        pageSize={5}
        columns={columns}
        content={Object.values(services).map((service) => ({
          service: service.name,
          port: '3002',
          status: service.icon,
          span: '3 min',
          action:
            service.status === 'OK' ? (
              <Button type="primary" size="small" onClick={handleView} disabled>
                view
              </Button>
            ) : (
              <Button type="primary" size="small" onClick={handleView}>
                view
              </Button>
            )
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
