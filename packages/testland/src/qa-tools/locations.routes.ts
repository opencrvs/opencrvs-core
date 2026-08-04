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
import * as Hapi from '@hapi/hapi'
import { GATEWAY_URL } from '@countryconfig/constants'

const renderPage = () => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Locations QA tool</title>
    <style>
      body { font-family: sans-serif; max-width: 640px; margin: 2rem auto; }
      details { margin-top: 1rem; border: 1px solid #ddd; border-radius: 4px; padding: 0 0.75rem; }
      details summary { padding: 0.75rem 0; font-weight: bold; cursor: pointer; }
      fieldset { border: none; padding: 0 0 1rem; margin: 0; }
      fieldset:disabled { opacity: 0.5; }
      label { display: block; margin-top: 0.75rem; font-weight: bold; }
      input, select { width: 100%; padding: 0.4rem; box-sizing: border-box; }
      button { margin-top: 1rem; padding: 0.5rem 1rem; }
      pre { background: #f4f4f4; padding: 1rem; overflow-x: auto; white-space: pre-wrap; overflow-wrap: anywhere; }
      .field-error { color: #b00020; font-weight: bold; margin-top: 0.25rem; }
      #search-results { list-style: none; padding: 0; margin-top: 0.5rem; }
      #search-results li { padding: 0.4rem; border: 1px solid #ddd; margin-bottom: 0.25rem; cursor: pointer; }
      #search-results li:hover { background: #f4f4f4; }
      #search-results li pre { margin: 0.5rem 0 0; }
      .token-row { display: flex; gap: 0.5rem; }
      .token-row input { flex: 1; font-size: 1.1rem; padding: 0.7rem; font-family: monospace; }
      .token-row button { margin-top: 0; white-space: nowrap; }
      #confirm-modal-backdrop {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        align-items: center;
        justify-content: center;
      }
      #confirm-modal {
        background: white;
        padding: 1.5rem;
        max-width: 480px;
        width: 90%;
        border-radius: 4px;
      }
      #confirm-modal pre { max-height: 240px; }
      #confirm-modal .actions { display: flex; gap: 0.5rem; }
    </style>
  </head>
  <body>
    <h1>Locations QA tool</h1>
    <label for="token">Bearer token</label>
    <div class="token-row">
      <input
        type="password"
        id="token"
        autocomplete="off"
        placeholder="Paste a Bearer token"
      />
      <button type="button" id="token-toggle">Show</button>
    </div>

    <details open>
      <summary>Search locations</summary>
      <fieldset id="search-block">
        <form id="search-form">
          <label for="search-query">Name or id contains</label>
          <input id="search-query" name="query" placeholder="e.g. Ibombo or a UUID" />
          <button type="submit">Search</button>
        </form>
        <ul id="search-results"></ul>
      </fieldset>
    </details>

    <details>
      <summary>Create location</summary>
      <fieldset id="create-block">
        <form id="create-form">
          <label for="create-name">Name</label>
          <input id="create-name" name="name" required />
          <label for="create-administrativeAreaId">Administrative area id</label>
          <input id="create-administrativeAreaId" name="administrativeAreaId" />
          <label for="create-locationType">Location type</label>
          <input id="create-locationType" name="locationType" />
          <label for="create-externalId">External id</label>
          <input id="create-externalId" name="externalId" />
          <label for="create-effectiveFrom">Effective from (ISO date, optional)</label>
          <input id="create-effectiveFrom" name="effectiveFrom" />
          <div class="field-error" id="create-effectiveFrom-error"></div>
          <label for="create-status">Status</label>
          <select id="create-status" name="status">
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
          <button type="submit">Create</button>
        </form>
        <pre id="create-result"></pre>
      </fieldset>
    </details>

    <details>
      <summary>Update location (append version)</summary>
      <fieldset id="update-block">
        <form id="update-form">
          <label for="update-id">Location id</label>
          <input id="update-id" name="id" required />
          <label for="update-lastVersionId">Last version id</label>
          <input id="update-lastVersionId" name="lastVersionId" required />
          <label for="update-name">Name</label>
          <input id="update-name" name="name" required />
          <label for="update-externalId">External id</label>
          <input id="update-externalId" name="externalId" />
          <label for="update-effectiveFrom">Effective from (ISO date, optional)</label>
          <input id="update-effectiveFrom" name="effectiveFrom" />
          <div class="field-error" id="update-effectiveFrom-error"></div>
          <label for="update-status">Status</label>
          <select id="update-status" name="status">
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
          <button type="submit">Update</button>
        </form>
        <pre id="update-result"></pre>
      </fieldset>
    </details>

    <details>
      <summary>Withdraw pending version</summary>
      <fieldset id="withdraw-block">
        <form id="withdraw-form">
          <label for="withdraw-id">Location id</label>
          <input id="withdraw-id" name="id" required />
          <label for="withdraw-versionId">Version id</label>
          <input id="withdraw-versionId" name="versionId" required />
          <button type="submit">Withdraw</button>
        </form>
        <pre id="withdraw-result"></pre>
      </fieldset>
    </details>

    <div id="confirm-modal-backdrop">
      <div id="confirm-modal">
        <p id="confirm-modal-message"></p>
        <pre id="confirm-modal-payload"></pre>
        <div class="actions">
          <button type="button" id="confirm-modal-confirm">Confirm</button>
          <button type="button" id="confirm-modal-cancel">Cancel</button>
        </div>
      </div>
    </div>

    <script>
      function getToken() {
        return document.getElementById('token').value.trim()
      }

      document
        .getElementById('token-toggle')
        .addEventListener('click', function () {
          var tokenInput = document.getElementById('token')
          var showing = tokenInput.type === 'text'
          tokenInput.type = showing ? 'password' : 'text'
          document.getElementById('token-toggle').textContent = showing
            ? 'Show'
            : 'Hide'
        })

      function formToPayload(form, optionalFields) {
        var payload = {}
        Array.from(form.elements).forEach(function (el) {
          if (!el.name) return
          var value = el.value.trim()
          if (value === '') {
            if ((optionalFields || []).indexOf(el.name) === -1) return
            return
          }
          payload[el.name] = value
        })
        return payload
      }

      function setField(id, value) {
        var el = document.getElementById(id)
        if (el && value !== undefined && value !== null) el.value = value
      }

      // Fan the location returned by create/update/withdraw/search out to
      // the other forms, so the id / lastVersionId never has to be
      // hand-copied out of the raw JSON response.
      function applyLocationToForms(location) {
        if (!location || !location.id) return
        var lastVersion = location.versions[location.versions.length - 1]
        setField('update-id', location.id)
        setField('update-lastVersionId', lastVersion.versionId)
        setField('withdraw-id', location.id)
        setField('withdraw-versionId', lastVersion.versionId)
      }

      // effectiveFrom is a plain calendar date on the wire (z.iso.date()) —
      // no time component, no timezone.
      function validateEffectiveFrom(value) {
        if (!value) return null
        var isoDatePattern = /^\\d{4}-\\d{2}-\\d{2}$/
        if (!isoDatePattern.test(value) || Number.isNaN(Date.parse(value))) {
          var suggestion = new Date().toISOString().slice(0, 10)
          return (
            'Effective from must be a date in YYYY-MM-DD format, e.g. ' +
            suggestion
          )
        }
        return null
      }

      function showFieldError(id, message) {
        var el = document.getElementById(id + '-error')
        if (el) el.textContent = message || ''
      }

      function confirmAction(message, payload) {
        return new Promise(function (resolve) {
          var backdrop = document.getElementById('confirm-modal-backdrop')
          document.getElementById('confirm-modal-message').textContent =
            message
          document.getElementById('confirm-modal-payload').textContent =
            JSON.stringify(payload, null, 2)
          backdrop.style.display = 'flex'

          function cleanup(result) {
            backdrop.style.display = 'none'
            confirmBtn.removeEventListener('click', onConfirm)
            cancelBtn.removeEventListener('click', onCancel)
            resolve(result)
          }
          function onConfirm() {
            cleanup(true)
          }
          function onCancel() {
            cleanup(false)
          }
          var confirmBtn = document.getElementById('confirm-modal-confirm')
          var cancelBtn = document.getElementById('confirm-modal-cancel')
          confirmBtn.addEventListener('click', onConfirm)
          cancelBtn.addEventListener('click', onCancel)
        })
      }

      // Only one of create/update/withdraw may be operated on at a time —
      // starting to fill one fully disables the other two, so a QA tester
      // can't accidentally mix fields between operations.
      var writeBlockIds = ['create-block', 'update-block', 'withdraw-block']

      function setBlockDisabled(blockId, disabled) {
        document.getElementById(blockId).disabled = disabled
      }

      function lockOtherBlocks(activeBlockId) {
        writeBlockIds.forEach(function (blockId) {
          if (blockId !== activeBlockId) setBlockDisabled(blockId, true)
        })
      }

      function unlockAllBlocks() {
        writeBlockIds.forEach(function (blockId) {
          setBlockDisabled(blockId, false)
        })
      }

      function activeElementInsideAnyWriteBlock() {
        return writeBlockIds.some(function (blockId) {
          return document
            .getElementById(blockId)
            .contains(document.activeElement)
        })
      }

      writeBlockIds.forEach(function (blockId) {
        var block = document.getElementById(blockId)
        block.addEventListener('focusin', function () {
          lockOtherBlocks(blockId)
        })
        // Focus leaving this block entirely (clicked away, tabbed out) —
        // not just moved between its own fields — is how a locked-out
        // section gets its escape hatch, since every control inside a
        // disabled sibling fieldset is unclickable.
        block.addEventListener('focusout', function () {
          setTimeout(function () {
            if (!activeElementInsideAnyWriteBlock()) unlockAllBlocks()
          }, 0)
        })
      })

      document
        .getElementById('search-form')
        .addEventListener('submit', async function (event) {
          event.preventDefault()
          var query = document.getElementById('search-query').value.trim().toLowerCase()
          var resultsEl = document.getElementById('search-results')
          resultsEl.innerHTML = '<li>Loading...</li>'
          try {
            var response = await fetch('/locations/search', {
              headers: { Authorization: 'Bearer ' + getToken() }
            })
            var locations = await response.json()
            if (!response.ok) {
              resultsEl.innerHTML =
                '<li>' + response.status + ' ' + JSON.stringify(locations) + '</li>'
              return
            }
            var matches = locations.filter(function (location) {
              if (!query) return true
              return (
                location.id.toLowerCase().indexOf(query) !== -1 ||
                location.versions.some(function (version) {
                  return version.name.toLowerCase().indexOf(query) !== -1
                })
              )
            })
            resultsEl.innerHTML = ''
            if (matches.length === 0) {
              resultsEl.innerHTML = '<li>No matches</li>'
              return
            }
            matches.forEach(function (location) {
              var currentName =
                location.versions[location.versions.length - 1].name
              var li = document.createElement('li')
              var summary = document.createElement('div')
              summary.style.fontWeight = 'bold'
              summary.textContent = currentName + ' — ' + location.id
              var details = document.createElement('pre')
              details.textContent = JSON.stringify(location, null, 2)
              li.appendChild(summary)
              li.appendChild(details)
              li.addEventListener('click', function () {
                applyLocationToForms(location)
              })
              resultsEl.appendChild(li)
            })
          } catch (error) {
            resultsEl.innerHTML = '<li>Search failed: ' + error.message + '</li>'
          }
        })

      async function submitRequest(url, method, payload, resultEl, form) {
        resultEl.textContent = 'Loading...'
        try {
          var response = await fetch(url, {
            method: method,
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + getToken()
            },
            body: method === 'DELETE' ? undefined : JSON.stringify(payload)
          })
          var body = await response.text()
          resultEl.textContent =
            response.status + ' ' + response.statusText + '\\n' + body
          if (response.ok) {
            try {
              applyLocationToForms(JSON.parse(body))
            } catch (parseError) {
              // response wasn't a Location object — nothing to fan out
            }
            form.reset()
          }
        } catch (error) {
          resultEl.textContent = 'Request failed: ' + error.message
        } finally {
          unlockAllBlocks()
        }
      }

      document
        .getElementById('create-form')
        .addEventListener('submit', async function (event) {
          event.preventDefault()
          showFieldError('create-effectiveFrom', null)
          var payload = formToPayload(event.target, [
            'externalId',
            'effectiveFrom'
          ])
          var effectiveFromError = validateEffectiveFrom(payload.effectiveFrom)
          if (effectiveFromError) {
            showFieldError('create-effectiveFrom', effectiveFromError)
            return
          }
          var confirmed = await confirmAction('Create this location?', payload)
          if (!confirmed) {
            unlockAllBlocks()
            return
          }
          await submitRequest(
            '/locations',
            'POST',
            payload,
            document.getElementById('create-result'),
            event.target
          )
        })

      document
        .getElementById('update-form')
        .addEventListener('submit', async function (event) {
          event.preventDefault()
          showFieldError('update-effectiveFrom', null)
          var payload = formToPayload(event.target, [
            'externalId',
            'effectiveFrom'
          ])
          var effectiveFromError = validateEffectiveFrom(payload.effectiveFrom)
          if (effectiveFromError) {
            showFieldError('update-effectiveFrom', effectiveFromError)
            return
          }
          var id = payload.id
          delete payload.id
          var confirmed = await confirmAction(
            'Append this version to location ' + id + '?',
            payload
          )
          if (!confirmed) {
            unlockAllBlocks()
            return
          }
          await submitRequest(
            '/locations/' + id,
            'PUT',
            payload,
            document.getElementById('update-result'),
            event.target
          )
        })

      document
        .getElementById('withdraw-form')
        .addEventListener('submit', async function (event) {
          event.preventDefault()
          var payload = formToPayload(event.target, [])
          var confirmed = await confirmAction(
            'Withdraw version ' +
              payload.versionId +
              ' from location ' +
              payload.id +
              '?',
            payload
          )
          if (!confirmed) {
            unlockAllBlocks()
            return
          }
          await submitRequest(
            '/locations/' + payload.id + '/versions/' + payload.versionId,
            'DELETE',
            {},
            document.getElementById('withdraw-result'),
            event.target
          )
        })
    </script>
  </body>
</html>`

export function getLocationsQaRoutes(): Hapi.ServerRoute[] {
  return [
    {
      method: 'GET',
      path: '/locations',
      handler: (_request, h) => h.response(renderPage()).type('text/html'),
      options: {
        auth: false,
        tags: ['qa-tool', 'locations'],
        description: 'QA tool page for exercising the location write APIs'
      }
    },
    {
      method: 'GET',
      path: '/locations/search',
      handler: (_request, h) =>
        h.proxy({ uri: `${GATEWAY_URL}/events/locations`, passThrough: true }),
      options: {
        auth: false,
        tags: ['qa-tool', 'locations', 'proxy'],
        description: 'Proxies the location list to the gateway for search'
      }
    },
    {
      method: 'POST',
      path: '/locations',
      handler: (_request, h) =>
        h.proxy({ uri: `${GATEWAY_URL}/events/locations`, passThrough: true }),
      options: {
        auth: false,
        payload: {
          output: 'data',
          parse: false
        },
        tags: ['qa-tool', 'locations', 'proxy'],
        description: 'Proxies location creation to the gateway'
      }
    },
    {
      method: 'PUT',
      path: '/locations/{id}',
      handler: (request, h) =>
        h.proxy({
          uri: `${GATEWAY_URL}/events/locations/${request.params.id}`,
          passThrough: true
        }),
      options: {
        auth: false,
        payload: {
          output: 'data',
          parse: false
        },
        tags: ['qa-tool', 'locations', 'proxy'],
        description: 'Proxies location version updates to the gateway'
      }
    },
    {
      method: 'DELETE',
      path: '/locations/{id}/versions/{versionId}',
      handler: (request, h) =>
        h.proxy({
          uri: `${GATEWAY_URL}/events/locations/${request.params.id}/versions/${request.params.versionId}`,
          passThrough: true
        }),
      options: {
        auth: false,
        payload: {
          output: 'data',
          parse: false
        },
        tags: ['qa-tool', 'locations', 'proxy'],
        description:
          'Proxies withdrawal of a pending location version to the gateway'
      }
    }
  ]
}
