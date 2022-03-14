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
const http = require('http')
const alertRules = require('./alert-rules.json')

const KIBANA_HOST = process.env.KIBANA_HOST || 'localhost'
const KIBANA_PORT = process.env.KIBANA_PORT || 5601

function makeRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = ''

      if (res.statusCode.toString().charAt(0) !== '2') {
        reject(
          new Error(
            `${options.method} ${options.path} returned status ${res.statusCode}`
          )
        )
        return
      }

      res.on('data', (d) => {
        data += d.toString()
      })

      res.on('end', () => (data === '' ? resolve() : resolve(JSON.parse(data))))
    })

    req.on('error', reject)
    if (body) {
      req.write(body)
    }
    req.end()
  })
}

function deleteRule(id) {
  return makeRequest({
    hostname: KIBANA_HOST,
    port: KIBANA_PORT,
    path: `/api/alerting/rule/${id}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'kbn-xsrf': true
    }
  })
}

function getCurrentRules() {
  return makeRequest({
    hostname: KIBANA_HOST,
    port: KIBANA_PORT,
    path: '/api/alerting/rules/_find?per_page=1000',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'kbn-xsrf': true
    }
  }).then(({ data }) => data)
}

function createRule(rule) {
  const body = JSON.stringify(rule)

  return makeRequest(
    {
      hostname: KIBANA_HOST,
      port: KIBANA_PORT,
      path: '/api/alerting/rule',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
        'kbn-xsrf': true
      }
    },
    body
  )
}

function updateRule(id, rule) {
  const { consumer, rule_type_id, ...allowedKeys } = rule
  const body = JSON.stringify(allowedKeys)

  return makeRequest(
    {
      hostname: KIBANA_HOST,
      port: KIBANA_PORT,
      path: '/api/alerting/rule/' + id,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
        'kbn-xsrf': true
      }
    },
    body
  )
}

async function main() {
  console.log('Fetching current rules...')
  const allRules = await getCurrentRules()
  const currentRules = allRules.filter(({ tags }) =>
    tags.includes('opencrvs-builtin')
  )

  console.log('Deleting outdated rules')
  const outdatedRules = currentRules.filter(
    ({ name }) => !alertRules.find((currentRule) => currentRule.name === name)
  )
  await Promise.all(
    outdatedRules.map(({ id, name }) => {
      console.log('Deleting rule:', name)
      return deleteRule(id)
    })
  )

  const missingRules = alertRules.filter(
    (rule) =>
      !currentRules.find((currentRule) => currentRule.name === rule.name)
  )
  const existingRules = alertRules.filter((rule) =>
    currentRules.find((currentRule) => currentRule.name === rule.name)
  )

  console.log('Adding missing rules')
  await Promise.all(
    missingRules.map((rule) => {
      console.log('Creating rule:', rule.name)

      return createRule(rule)
    })
  )

  console.log('Updating existing rules')
  await Promise.all(
    existingRules.map((rule) => {
      const existing = currentRules.find(
        (currentRule) => currentRule.name === rule.name
      )

      console.log('Updating rule:', existing.name)
      return updateRule(existing.id, rule)
    })
  )

  console.log('All alert rules in place, quitting.')
}
main()
