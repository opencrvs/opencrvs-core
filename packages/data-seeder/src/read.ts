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

export type Read<Contents, Problem> =
  | { readable: false; problem: Problem }
  | ({ readable: true; problems: Problem[] } & Contents)

export function problemsOf<Contents, Problem>(
  read: Read<Contents, Problem>
): Problem[] {
  return read.readable ? read.problems : [read.problem]
}

/**
 * What a module read, once validation has passed. An unreadable document is a
 * problem, so reaching here with one is a hole in the checks rather than
 * anything an operator could act on — which is why this throws rather than
 * reporting. `subject` names the document in that failure.
 */
export function validatedContents<Contents, Problem>(
  read: Read<Contents, Problem>,
  subject: string
): Contents & { problems: Problem[] } {
  if (!read.readable) {
    throw new Error(`${subject} passed validation but did not parse`)
  }

  return read
}
