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
  /**
   * Identity fields Create accepts and Update rejects, e.g. parentId.
   * `nullable: true` (e.g. parentId / administrativeAreaId) adds a "no
   * value" checkbox that disables the input and forces the field to
   * `null` on submit — the schema requires the key present, so an empty
   * input alone can't express "no parent".
   */
  identityFields: Array<{ name: string; label: string; nullable?: boolean }>
}

const capitalize = (value: string) => value[0].toUpperCase() + value.slice(1)

const renderIdentityFieldInputs = (
  identityFields: QaEntityConfig['identityFields']
) =>
  identityFields
    .map(
      (field) => `
        <label for="create-${field.name}">${field.label}</label>
        <input id="create-${field.name}" name="${field.name}" />${
          field.nullable
            ? `
        <label class="null-toggle" for="create-${field.name}-null">
          <input type="checkbox" id="create-${field.name}-null" />
          No ${field.label.toLowerCase()} (set to null)
        </label>`
            : ''
        }`
    )
    .join('')

/** Plain-English usage notes shown in the "i" guide, worded for this entity. */
const renderGuideItems = (config: QaEntityConfig): string => {
  const nullableFields = config.identityFields.filter((f) => f.nullable)
  const requiredIdentityFields = config.identityFields.filter(
    (f) => !f.nullable
  )

  const items = [
    `Search is a substring match over every ${config.pluralLabel} name/id — click a result to fill the Update and Withdraw blocks below with that ${config.singularLabel}'s id and version id.`,
    `Leaving the search box empty and searching returns every ${config.singularLabel} there is, active and inactive alike — there's no pagination, so this can be a long list.`,
    `This page only covers ${config.pluralLabel} — locations and administrative areas each have their own page (<code>/locations</code>, <code>/administrative-areas</code>).`,
    `While you're editing Create, Update, or Withdraw, the other two are disabled until you finish or cancel — this stops fields from different operations getting mixed up.`,
    nullableFields.length > 0
      ? `On Create, ${nullableFields.map((f) => f.label.toLowerCase()).join(' and ')} can be left null — check the box next to the field for a top-level ${config.singularLabel}, or leave it unchecked and type another ${config.singularLabel}'s id as the parent.`
      : '',
    requiredIdentityFields.length > 0
      ? `${requiredIdentityFields.map((f) => f.label).join(', ')} ${requiredIdentityFields.length > 1 ? 'are' : 'is'} required on Create — there's no null option for ${requiredIdentityFields.length > 1 ? 'these' : 'it'}.`
      : '',
    `External id is optional — a unique code for the ${config.singularLabel}.`,
    `Every Create/Update/Withdraw shows a confirmation popup with the exact payload before it's sent.`,
    `Effective from must be <code>YYYY-MM-DD</code>; leave it blank to use the server default.`,
    `Update appends a new version rather than editing in place — that's why it needs the last version id, to detect if the ${config.singularLabel} changed since you last looked.`,
    `Withdraw only works on a version that hasn't taken effect yet — not one already active, and not the only version the ${config.singularLabel} has.`,
    `This tool always acts as <code>NATIONAL_SYSTEM_ADMIN</code> — it can't show what happens for a user without the <code>location.edit</code> scope.`
  ].filter(Boolean)

  return items.map((item) => `<li>${item}</li>`).join('')
}

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
      .null-toggle { display: flex; align-items: center; gap: 0.4rem; margin-top: 0.35rem; font-weight: normal; font-size: 0.9em; }
      .null-toggle input { width: auto; }
      input:disabled { background: #eee; }
      #search-results { list-style: none; padding: 0; margin-top: 0.5rem; }
      #search-results li { padding: 0.4rem; border: 1px solid #ddd; margin-bottom: 0.25rem; cursor: pointer; }
      #search-results li:hover { background: #f4f4f4; }
      #search-results li pre { margin: 0.5rem 0 0; }
      .modal-backdrop {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        align-items: center;
        justify-content: center;
      }
      .modal-panel {
        background: white;
        padding: 1.5rem;
        max-width: 480px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        border-radius: 4px;
      }
      .modal-panel pre { max-height: 240px; }
      .modal-panel .actions { display: flex; gap: 0.5rem; }
      .modal-panel li { margin-bottom: 0.6rem; }
      .title-row { display: flex; align-items: center; gap: 0.6rem; }
      #guide-button {
        margin-top: 0;
        width: 1.8rem;
        height: 1.8rem;
        padding: 0;
        border-radius: 50%;
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <div class="title-row">
      <h1>${capitalize(config.pluralLabel)} QA tool</h1>
      <button type="button" id="guide-button" title="How to use this page">i</button>
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
          <label for="create-externalId">External id (optional)</label>
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
          <label for="update-externalId">External id (optional)</label>
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

    <div id="confirm-modal-backdrop" class="modal-backdrop">
      <div class="modal-panel">
        <p id="confirm-modal-message"></p>
        <pre id="confirm-modal-payload"></pre>
        <div class="actions">
          <button type="button" id="confirm-modal-confirm">Confirm</button>
          <button type="button" id="confirm-modal-cancel">Cancel</button>
        </div>
      </div>
    </div>

    <div id="guide-modal-backdrop" class="modal-backdrop">
      <div class="modal-panel">
        <h2>How to use this page</h2>
        <ul>
          ${renderGuideItems(config)}
        </ul>
        <div class="actions">
          <button type="button" id="guide-modal-close">Close</button>
        </div>
      </div>
    </div>

    <script>
      var basePath = '/${config.basePath}'
      var entityLabel = '${config.singularLabel}'
      var nullableIdentityFieldNames = ${JSON.stringify(
        config.identityFields
          .filter((field) => field.nullable)
          .map((field) => field.name)
      )}

      // A checked "no value" toggle disables its paired input and forces
      // that field to null on submit — the schema requires the key present
      // (it's nullable, not optional), so an empty input alone can't say
      // "no parent".
      nullableIdentityFieldNames.forEach(function (name) {
        var checkbox = document.getElementById('create-' + name + '-null')
        var input = document.getElementById('create-' + name)
        if (!checkbox || !input) return
        checkbox.addEventListener('change', function () {
          input.disabled = checkbox.checked
          if (checkbox.checked) input.value = ''
        })
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

      var guideBackdrop = document.getElementById('guide-modal-backdrop')
      document
        .getElementById('guide-button')
        .addEventListener('click', function () {
          guideBackdrop.style.display = 'flex'
        })
      document
        .getElementById('guide-modal-close')
        .addEventListener('click', function () {
          guideBackdrop.style.display = 'none'
        })

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
            var response = await fetch(basePath + '/search')
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
            headers: { 'Content-Type': 'application/json' },
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
          nullableIdentityFieldNames.forEach(function (name) {
            var checkbox = document.getElementById('create-' + name + '-null')
            if (checkbox && checkbox.checked) payload[name] = null
          })
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
