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

import { execSync } from "child_process";

export function getRepoInfo() {
  try {
    const remoteUrl = execSync("git config --get remote.origin.url", {
      stdio: ["ignore", "pipe", "ignore"]
    })
      .toString()
      .trim();

    // Handle both SSH and HTTPS formats
    const match = remoteUrl.match(/github\.com[:/](.+?)\/(.+?)(\.git)?$/);

    if (!match) {
      return { organization: "", repository: "" };
    }

    return {
      organization: match[1],
      repository: match[2]
    };
  } catch {
    return {
      organization: "",
      repository: ""
    };
  }
}