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
  position: static;
  margin-right: 10px;
  width: 350px;
  border: 2px solid #93acd7;
  background: white;
  &:focus-within {
    outline: 2px solid #93acd7;
    background: white;
  }
  &:hover {
    background: white;
  }
`
const ServiceContent = styled(Content)`
  size: 'large';
  width: 200%;
`

export default function Dependencies() {
  type ButtonType = 'primary' | 'secondary'
  interface ButtonTypeState {
    All: ButtonType
    Running: ButtonType
    Down: ButtonType
  }

  const router = useRouter()
  const pingUrl = 'http://localhost:7070/ping?'
  const columns = [
    { label: 'Dependency', width: 25, key: 'dependency' },
    { label: 'Port', width: 20, key: 'port' },
    { label: 'Status', width: 20, key: 'status' },
    { label: 'Timespan', width: 20, key: 'span' },
    { label: 'Action', width: 15, key: 'action' }
  ]
  const [modalState, setModalState] = useState(false)
  const [Running, setRunning] = useState<ButtonType>('secondary')
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState('All')
  const [searchString, setSearchString] = useState('')
  const [buttonType, setButtonType] = useState<ButtonTypeState>({
    All: 'secondary',
    Running: 'secondary',
    Down: 'secondary'
  })
  const [dependencies, setDependencies] = useState({
    CountryConfig: {
      name: 'CountryConfig',
      url: `${pingUrl}service=countryconfig`,
      port: 27017,
      status: 'LOADING',
      type: 'dependency',
      icon: <LoadingGrey />
    },
    Openhim: {
      name: 'Openhim',
      url: `${pingUrl}service=openhim`,
      port: 4040,
      status: 'LOADING',
      type: 'dependency',
      icon: <LoadingGrey />
    },
    MongoDB: {
      name: 'MongoDB',
      url: `${pingUrl}dependency=mongodb`,
      port: 27017,
      status: 'LOADING',
      type: 'dependency',
      icon: <LoadingGrey />
    },
    Influx: {
      name: 'Influx',
      url: `${pingUrl}dependency=influxdb`,
      port: 27017,
      status: 'LOADING',
      type: 'dependency',
      icon: <LoadingGrey />
    },
    Minio: {
      name: 'Minio',
      url: `${pingUrl}dependency=minio`,
      port: 27017,
      status: 'LOADING',
      type: 'dependency',
      icon: <LoadingGrey />
    },
    Kibana: {
      name: 'Kibana',
      url: `${pingUrl}dependency=kibana`,
      port: 27017,
      status: 'LOADING',
      type: 'dependency',
      icon: <LoadingGrey />
    },
    Elasticsearch: {
      name: 'Elasticsearch',
      url: `${pingUrl}dependency=elasticsearch`,
      port: 27017,
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

  const handleClearText = (): void => {
    setFilter('All')
  }

  const handleSearch = (searchValue: string): void => {
    if (searchValue.trim() === '' || searchValue == undefined) {
      setFilter('All')
    } else {
      setFilter(searchValue.toLowerCase())
    }
  }

  useEffect(() => {
    handleSearch(searchString)
  }, [searchString])

  const filteredDependencies = Object.values(dependencies).filter(
    (dependency) => {
      if (filter === 'All') {
        return true
      } else if (filter === 'Running' && dependency.status === 'OK') {
        return true
      } else if (filter === 'Down' && dependency.status === 'FAIL') {
        return true
      }
      const searchValue = filter.toLowerCase()
      return dependency.name.toLowerCase().includes(searchValue)
    }
  )

  useEffect(() => {
    function setHealthy(service: Service) {
      setDependencies((dependencies) => ({
        ...dependencies,
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
      setDependencies((dependencies) => ({
        ...dependencies,
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

    Object.values(dependencies).forEach((dependency) => {
      fetch(dependency.url)
        .then(async (res) => {
          const responseBody = await res.json()
          if (responseBody.status === 'ok') {
            return setHealthy(dependency)
          }

          setFailing(dependency)
        })
        .catch((err) => {
          setFailing(dependency)
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
            type={buttonType.All}
            size="small"
            style={{ marginRight: 5, marginLeft: 5 }}
            onClick={() => {
              setFilter('All')
              setButtonType({
                All: 'primary',
                Running: 'secondary',
                Down: 'secondary'
              })
            }}
          >
            {' '}
            All{' '}
          </Button>
          <Button
            type={buttonType.Running}
            size="small"
            style={{ marginRight: 5 }}
            onClick={() => {
              setFilter('Running')
              setButtonType({
                All: 'secondary',
                Running: 'primary',
                Down: 'secondary'
              })
            }}
          >
            {' '}
            Running{' '}
          </Button>
          <Button
            type={buttonType.Down}
            size="small"
            style={{ marginRight: 5 }}
            onClick={() => {
              setFilter('Down')
              setButtonType({
                All: 'secondary',
                Running: 'secondary',
                Down: 'primary'
              })
            }}
          >
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
            onClearText={handleClearText}
            searchHandler={(searchValue: string) => {
              if (searchValue == '') setFilter('All')
              else setSearchString(searchValue)
            }}
            searchTypeList={[
              {
                icon: <TrackingID />,
                invertIcon: <TrackingID />,
                label: '',
                placeHolderText: 'Search for a dependency',
                value: ''
              }
            ]}
          />

          {/* <Button type="primary" size="small" style={{ marginRight: 5 }}>
            {' '}
            Search{' '}
          </Button> */}
        </div>
      </div>

      <Table
        totalItems={Object.keys(filteredDependencies).length}
        pageSize={5}
        columns={columns}
        currentPage={currentPage}
        isFullPage={true}
        onPageChange={(page) => setCurrentPage(page)}
        content={Object.values(filteredDependencies).map((dependency) => ({
          dependency: dependency.name,
          port: dependency.port,
          status: dependency.icon,
          span: '0 min',
          action:
            dependency.status === 'OK' ? (
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
