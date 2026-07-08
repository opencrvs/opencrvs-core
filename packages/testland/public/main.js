/*
 * Check user has an authorization token. If not, redirect to login page.
 */
const token = new URLSearchParams(window.location.search).get('token')

if (!token) {
  window.location.href =
    window.config.LOGIN_URL +
    '?redirectTo=' +
    encodeURIComponent(window.location.href)
}

async function downloadRecords({ startDate, endDate }) {
  const res = await fetch('/graphql', {
    headers: {
      authorization: 'Bearer ' + token,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      operationName: 'searchEvents',
      variables: {
        advancedSearchParameters: {
          registrationStatuses: ['REGISTERED', 'CERTIFIED', 'ISSUED'],
          dateOfRegistrationStart: startDate,
          dateOfRegistrationEnd: endDate
        },
        count: 10,
        skip: 0
      },
      query: `
        query searchEvents($advancedSearchParameters: AdvancedSearchParametersInput!, $sort: String, $count: Int, $skip: Int) {
          searchEvents(
            advancedSearchParameters: $advancedSearchParameters
            sort: $sort
            count: $count
            skip: $skip
          ) {
            totalItems
            results {
              id
              type
              registration {
                status
                contactNumber
                contactEmail
                trackingId
                registrationNumber
                registeredLocationId
                duplicates
                assignment {
                  practitionerId
                  firstName
                  lastName
                  officeName
                  avatarURL
                }
                createdAt
                modifiedAt
              }
              operationHistories {
                operationType
                operatedOn
              }
              ... on BirthEventSearchSet {
                dateOfBirth
                childName {
                  firstNames
                  middleName
                  familyName
                  use
                }
              }
              __typename
            }
          }
        }
        `
    }),
    method: 'POST',
    mode: 'cors',
    credentials: 'include'
  })

  return res.json()
}

/*
 * Initialise date inputs
 */
const $startDate = document.getElementById('start-date')
const $endDate = document.getElementById('end-date')
$startDate.value = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  .toISOString()
  .split('T')[0]
$endDate.value = new Date(
  new Date().getFullYear(),
  new Date().getMonth() + 1,
  0
)
  .toISOString()
  .split('T')[0]

$startDate.addEventListener('change', update)
$endDate.addEventListener('change', update)

/*
 * Views
 */

function update() {
  downloadRecords({ startDate: $startDate.value, endDate: $endDate.value })
    .then((data) => renderTable(data.data.searchEvents.results))
    .catch((err) => console.error(err))
}

const $results = document.getElementById('results')

window.printAll = async function renderPrintout() {
  const data = await downloadRecords({
    startDate: $startDate.value,
    endDate: $endDate.value
  })
  const results = data.data.searchEvents.results
  const pages = results
    .filter((event) => event.__typename === 'BirthEventSearchSet')
    .map((event) => {
      /*
       * Replace this with what ever you want to render for each page
       */
      const page = `
      <div class="page">
        <div class="p-8">
          <h1>${event.childName[0].firstNames} ${event.childName[0].middleName} ${event.childName[0].familyName}</h1>
          <h1>${event.dateOfBirth}</h1>
        </div>
      </div>
    `

      return page
    })
    .join('')

  html2pdf()
    .set({
      pagebreak: { after: '.page' }
    })
    .from(pages)
    .save()
}
function renderTable(results) {
  const rows = results
    .filter((event) => event.__typename === 'BirthEventSearchSet')
    .map((event) => {
      const row = `
      <tr>
        <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">${
          event.registration.trackingId
        }</td>
        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${
          event.registration.registrationNumber
        }</td>
        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${
          new Date(parseInt(event.registration.createdAt, 10))
            .toISOString()
            .split('T')[0]
        }</td>
        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${
          event.dateOfBirth
        }</td>
        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${
          event.childName[0].firstNames
        } ${event.childName[0].middleName} ${event.childName[0].familyName}</td>
      </tr>
    `

      return row
    })
    .join('')

  $results.innerHTML = rows
}

/*
 * First render
 */
update()
