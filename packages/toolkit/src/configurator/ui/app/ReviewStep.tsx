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
import { changedLines, lineDiff } from '../plan/diff'
import { writes, type PlanItem } from '../plan/plan'
import { fileStatus, type Review } from '../plan/review'

interface Props {
  review: Review
  onBack: () => void
  onApply: () => void
}

const MASK = '••••••••'

function shown(item: PlanItem): string {
  if (item.kind === 'secret') return item.status === 'keep' ? 'kept as it is' : MASK
  return item.value.length > 60 ? `${item.value.slice(0, 57)}…` : item.value
}

const label = (status: string) => (status === 'keep' ? 'kept' : status)

// Shows everything that would be written before anything is: secrets are masked, files show what changes.
export function ReviewStep({ review, onBack, onApply }: Props) {
  const { plan, files, filesError } = review
  const changedFiles = files.filter((file) => ['new', 'update'].includes(fileStatus(file)))
  const changes = writes(plan).length + (plan.createEnvironment ? 1 : 0) + (changedFiles.length ? 1 : 0)

  return (
    <section className="review" data-testid="review">
      <h2>Review “{plan.environment}”</h2>
      <p className="app__hint">Nothing has been written yet. Secrets are masked and are not shown again.</p>

      <h3>GitHub</h3>
      {plan.github ? (
        <>
          <p>
            {plan.createEnvironment
              ? `The environment “${plan.environment}” will be created.`
              : `The environment “${plan.environment}” exists and will be updated.`}
          </p>
          {plan.items.length === 0 ? (
            <p>No variables or secrets to write.</p>
          ) : (
            <table className="review__table">
              <thead>
                <tr>
                  <th>Where</th>
                  <th>Name</th>
                  <th>Value</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {plan.items.map((item) => (
                  <tr key={item.id} className={`review__row review__row--${item.status}`}>
                    <td>
                      {item.scope === 'repository' ? 'repository' : 'environment'} {item.kind}
                    </td>
                    <td>
                      <code>{item.name}</code>
                    </td>
                    <td>
                      <code>{shown(item)}</code>
                      {item.note && <div className="review__note">{item.note}</div>}
                    </td>
                    <td>
                      <span className={`badge badge--${item.status}`}>{label(item.status)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      ) : (
        <p>GitHub was skipped, so nothing is written there.</p>
      )}

      <h3>Files</h3>
      {filesError && (
        <p className="banner banner--error" role="alert">
          The files cannot be written: {filesError}
        </p>
      )}
      {files.map((file) => {
        const status = fileStatus(file)
        const rows =
          status === 'new'
            ? file.text.split('\n').map((text) => ({ type: 'add' as const, text }))
            : lineDiff(file.existing ?? '', file.text)
        return (
          <details key={file.path} className="review__file">
            <summary>
              <code>{file.target ? `environments/${file.target}` : file.path}</code>{' '}
              <span className={`badge badge--${status.replace(' ', '-')}`}>{status}</span>
              {status === 'update' && <span className="review__note"> {changedLines(rows)} lines change</span>}
            </summary>
            {status === 'not written' ? (
              <p className="review__note">
                environments/ holds one file per environment, so there is no place for {file.path}. Only the file that is written is shown as new, updated or unchanged.
              </p>
            ) : status === 'unchanged' ? (
              <p className="review__note">No changes.</p>
            ) : (
              <pre className="review__diff">
                {rows.map((line, index) => (
                  <div key={index} className={`diff diff--${line.type}`}>
                    {line.type === 'add' ? '+ ' : line.type === 'remove' ? '- ' : '  '}
                    {line.text}
                  </div>
                ))}
              </pre>
            )}
          </details>
        )
      })}

      <div className="review__actions">
        <button type="button" className="secondary" onClick={onBack}>
          Back to the form
        </button>
        <button type="button" disabled={changes === 0} onClick={onApply}>
          {changes === 0 ? 'Nothing to apply' : `Apply ${changes} change${changes === 1 ? '' : 's'}`}
        </button>
      </div>
    </section>
  )
}
