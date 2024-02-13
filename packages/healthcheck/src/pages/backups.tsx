// import React, { useEffect, useState } from 'react'
// import styled from 'styled-components'
// import { SearchTool } from '@opencrvs/components/lib/SearchTool'
// import { Content, ContentSize } from '@opencrvs/components/lib/Content'
// import { Button } from '@opencrvs/components/lib/Button'
// import { Table } from '@opencrvs/components/lib/Table'
// import DynamicModal from '@/components/DynamicModal'
// import { DateField } from '@opencrvs/components/lib/DateField'

// const Search = styled(SearchTool)`
//   margin-right: 10px;
//   width: 70%;
//   border: 2px solid #93acd7;
//   background-color: white;
// `
// const ServiceContent = styled(Content)`
//   size: 'large';
//   width: 200%;
// `
// interface Backup {
//   date: string
//   backup: string
//   status: string
//   // Add other backup fields as needed
// }

// export default function Backups() {
//   type ButtonType = 'primary' | 'secondary'

//   const [backups, setBackups] = useState<Backup[]>([
//     {
//       date: '01/01/2024',
//       backup: 'Auth',
//       status: 'Exists'
//     },
//     {
//       date: '02/01/2024',
//       backup: 'Minio',
//       status: 'Not Exist'
//     }
//   ])

//   useEffect(() => {
//     async function fetchBackups() {
//       try {
//         const response = await fetch('/api/backups')
//         const data = await response.json()
//         console.log(
//           `==============================${data.length}===========================`
//         )
//         setBackups(data)
//       } catch (error) {
//         console.error('Error fetching backups:', error)
//       }
//     }

//     fetchBackups()
//   }, [])

//   const columns = [
//     { label: 'Date', width: 30, key: 'date' },
//     { label: 'Backup', width: 40, key: 'backup' },
//     { label: 'Status', width: 30, key: 'status' }
//   ]

//   const [modalState, setModalState] = useState(false)
//   const [currentPage, setCurrentPage] = useState(1)
//   const [Exists, setExists] = useState<ButtonType>('secondary')
//   const [NotExists, setNotExists] = useState<ButtonType>('secondary')

//   const handleClose = () => {
//     setModalState(false)
//   }

//   return (
//     <ServiceContent size={ContentSize.LARGE} title="Backups">
//       <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//         <div
//           style={{
//             marginBottom: 10,
//             display: 'flex',
//             alignItems: 'center'
//           }}
//         >
//           <h4>Filter: </h4>
//           <Button
//             type="primary"
//             size="small"
//             style={{ marginRight: 5, marginLeft: 5 }}
//           >
//             {' '}
//             All{' '}
//           </Button>
//           <Button
//             type={Exists}
//             size="small"
//             style={{ marginRight: 5 }}
//             onClick={() => setExists('primary')}
//           >
//             {' '}
//             Exists{' '}
//           </Button>
//           <Button
//             type={NotExists}
//             size="small"
//             style={{ marginRight: 5 }}
//             onClick={() => setNotExists('primary')}
//           >
//             {' '}
//             NotExists{' '}
//           </Button>
//         </div>

//         <div
//           style={{
//             marginBottom: 10,
//             display: 'flex',
//             alignItems: 'center'
//           }}
//         >
//           {<DateField id="date-field" onChange={() => {}} />}

//           <Button type="primary" size="small" style={{ marginRight: 5 }}>
//             {' '}
//             Search{' '}
//           </Button>
//         </div>
//       </div>

//       <Table
//         // totalItems={Object.keys(services).length}
//         pageSize={5}
//         columns={columns}
//         currentPage={currentPage}
//         isFullPage={true}
//         onPageChange={(page) => setCurrentPage(page)}
//         content={backups.map((backup) => ({
//           date: backup.date,
//           backup: backup.backup,
//           status: 'Exists'
//         }))}
//       />

//       {modalState && (
//         <DynamicModal
//           title="Notification Checks"
//           show={modalState}
//           closeModal={handleClose}
//         />
//       )}
//     </ServiceContent>
//   )
// }

// Importing necessary modules from React and styled-components
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

// Importing components and icons from the specified paths
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
import { DateField } from '@opencrvs/components/lib/DateField'

// Importing the 'Mongo' component from the specified path
import Mongo from '../components/Mongo'

// Styling for Search component
const Search = styled(SearchTool)`
  margin-right: 10px;
  width: 70%;
  border: 2px solid #93acd7;
  background-color: white;
`

// Styling for ServiceContent component
const ServiceContent = styled(Content)`
  size: 'large';
  width: 200%;
`

// Functional component named 'backups'
export default function backups() {
  // Type definition for button types
  type ButtonType = 'primary' | 'secondary'

  // State hooks for managing data
  const [services, setServices] = useState<any[]>([])
  const [message, setMessage] = useState('')

  // Effect hook to fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/mongo', { method: 'GET' })
        const responseData = await response.json()

        if (responseData && responseData.data) {
          const formattedData = responseData.data.map((item: any) => ({
            date: item.date,
            backup: item.file,
            status: item.exists ? 'Exists' : 'Not Exist'
          }))
          setServices(formattedData)
        }

        setMessage(responseData.message)
        console.log('MongoDB operations completed:', responseData)
      } catch (error) {
        console.error('Error performing MongoDB operations:', error)
      }
    }

    fetchData()
  }, [])

  // Table columns definition
  const columns = [
    { label: 'Date', width: 30, key: 'date' },
    { label: 'Backup', width: 40, key: 'backup' },
    { label: 'Status', width: 30, key: 'status' }
  ]

  // State hooks for modal and filtering
  const [modalState, setModalState] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [All, setAll] = useState<ButtonType>('secondary')
  const [Exists, setExists] = useState<ButtonType>('secondary')
  const [NotExists, setNotExists] = useState<ButtonType>('secondary')

  const [selectedDate, setSelectedDate] = useState('')

  const [filterType, setFilterType] = useState('All')

  // Filtering the services based on selected date and filter type
  const filteredServices = services.filter((item) => {
    const matchesDate = selectedDate ? item.date === selectedDate : true
    const matchesStatus =
      filterType === 'All' ||
      (filterType === 'Exists' && item.status === 'Exists') ||
      (filterType === 'NotExists' && item.status === 'Not Exist')
    return matchesDate && matchesStatus
  })

  // Close modal handler
  const handleClose = () => {
    setModalState(false)
  }

  // Rendered component
  return (
    <ServiceContent size={ContentSize.LARGE} title="Backups">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Filter section */}
        <div
          style={{
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <h4>Filter: </h4>
          {/* Buttons for different filter types */}
          <Button
            type={filterType === 'All' ? 'primary' : All}
            size="small"
            style={{ marginRight: 5, marginLeft: 5 }}
            onClick={() => setFilterType('All')}
          >
            All
          </Button>

          <Button
            type={filterType === 'Exists' ? 'primary' : Exists}
            size="small"
            style={{ marginRight: 5 }}
            onClick={() => setFilterType('Exists')}
          >
            Exists
          </Button>

          <Button
            type={filterType === 'NotExists' ? 'primary' : NotExists}
            size="small"
            style={{ marginRight: 5 }}
            onClick={() => setFilterType('NotExists')}
          >
            NotExists
          </Button>
        </div>

        {/* Date filter */}
        <div
          style={{
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {
            <DateField
              id="date-field"
              onChange={(newDate) => setSelectedDate(newDate)}
            />
          }
        </div>
      </div>

      {/* Table displaying the filtered services */}
      <Table
        totalItems={filteredServices.length}
        pageSize={5}
        columns={columns}
        currentPage={currentPage}
        isFullPage={true}
        onPageChange={(page) => setCurrentPage(page)}
        content={filteredServices}
      />

      {/* Displaying the DynamicModal component when modalState is true */}
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
