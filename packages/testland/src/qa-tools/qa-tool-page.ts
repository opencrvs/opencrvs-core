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

/**
 * Everything that differs between the locations and administrative-areas QA
 * pages: the two entities share every create/update/withdraw/search
 * behaviour, and only differ in wording and in the handful of identity
 * fields (`administrativeAreaId` + `locationType` vs `parentId`) that Create
 * accepts and Update rejects.
 */
export interface QaEntityConfig {
  /** Plural, lowercase — e.g. "locations". Used in the title and Search heading. */
  pluralLabel: string
  /** Singular, lowercase — e.g. "location". Used in headings and confirm-modal copy. */
  singularLabel: string
  /** e.g. "Location id" — the id field label in Update/Withdraw. */
  idLabel: string
  /** REST path segment, e.g. "locations" or "administrative-areas". */
  basePath: string
  /** Identity fields Create accepts and Update rejects, e.g. parentId. */
  identityFields: Array<{ name: string; label: string }>
}

const capitalize = (value: string) => value[0].toUpperCase() + value.slice(1)

const renderIdentityFieldInputs = (
  identityFields: QaEntityConfig['identityFields']
) =>
  identityFields
    .map(
      (field) => `
        <label for="create-${field.name}">${field.label}</label>
        <input id="create-${field.name}" name="${field.name}" />`
    )
    .join('')

export const renderQaToolPage = (config: QaEntityConfig) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${capitalize(config.pluralLabel)} QA tool</title>
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
    <h1>${capitalize(config.pluralLabel)} QA tool</h1>
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
      <summary>Search ${config.pluralLabel}</summary>
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
      <summary>Create ${config.singularLabel}</summary>
      <fieldset id="create-block">
        <form id="create-form">
          <label for="create-name">Name</label>
          <input id="create-name" name="name" required />${renderIdentityFieldInputs(
            config.identityFields
          )}
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
      <summary>Update ${config.singularLabel} (append version)</summary>
      <fieldset id="update-block">
        <form id="update-form">
          <label for="update-id">${config.idLabel}</label>
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
          <label for="withdraw-id">${config.idLabel}</label>
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
      var basePath = '/${config.basePath}'
      var entityLabel = '${config.singularLabel}'

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

      // Fan the entity returned by create/update/withdraw/search out to the
      // other forms, so the id / lastVersionId never has to be hand-copied
      // out of the raw JSON response.
      function applyEntityToForms(entity) {
        if (!entity || !entity.id) return
        var lastVersion = entity.versions[entity.versions.length - 1]
        setField('update-id', entity.id)
        setField('update-lastVersionId', lastVersion.versionId)
        setField('withdraw-id', entity.id)
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
          var query = document
            .getElementById('search-query')
            .value.trim()
            .toLowerCase()
          var resultsEl = document.getElementById('search-results')
          resultsEl.innerHTML = '<li>Loading...</li>'
          try {
            var response = await fetch(basePath + '/search', {
              headers: { Authorization: 'Bearer ' + getToken() }
            })
            var entities = await response.json()
            if (!response.ok) {
              resultsEl.innerHTML =
                '<li>' + response.status + ' ' + JSON.stringify(entities) + '</li>'
              return
            }
            var matches = entities.filter(function (entity) {
              if (!query) return true
              return (
                entity.id.toLowerCase().indexOf(query) !== -1 ||
                entity.versions.some(function (version) {
                  return version.name.toLowerCase().indexOf(query) !== -1
                })
              )
            })
            resultsEl.innerHTML = ''
            if (matches.length === 0) {
              resultsEl.innerHTML = '<li>No matches</li>'
              return
            }
            matches.forEach(function (entity) {
              var currentName = entity.versions[entity.versions.length - 1].name
              var li = document.createElement('li')
              var summary = document.createElement('div')
              summary.style.fontWeight = 'bold'
              summary.textContent = currentName + ' — ' + entity.id
              var details = document.createElement('pre')
              details.textContent = JSON.stringify(entity, null, 2)
              li.appendChild(summary)
              li.appendChild(details)
              li.addEventListener('click', function () {
                applyEntityToForms(entity)
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
              applyEntityToForms(JSON.parse(body))
            } catch (parseError) {
              // response wasn't an entity object — nothing to fan out
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
          var confirmed = await confirmAction(
            'Create this ' + entityLabel + '?',
            payload
          )
          if (!confirmed) {
            unlockAllBlocks()
            return
          }
          await submitRequest(
            basePath,
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
            'Append this version to ' + entityLabel + ' ' + id + '?',
            payload
          )
          if (!confirmed) {
            unlockAllBlocks()
            return
          }
          await submitRequest(
            basePath + '/' + id,
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
              ' from ' +
              entityLabel +
              ' ' +
              payload.id +
              '?',
            payload
          )
          if (!confirmed) {
            unlockAllBlocks()
            return
          }
          await submitRequest(
            basePath + '/' + payload.id + '/versions/' + payload.versionId,
            'DELETE',
            {},
            document.getElementById('withdraw-result'),
            event.target
          )
        })
    </script>
  </body>
</html>`
