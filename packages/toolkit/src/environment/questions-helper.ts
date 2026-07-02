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

import { Choice } from 'prompts';

async function input(options: any): Promise<string> {
  const inquirer = await import('@inquirer/prompts')
  return inquirer.input(options)
}

async function select<Value = string>(options: any): Promise<Value> {
  const inquirer = await import('@inquirer/prompts')
  return inquirer.select(options)
}


export function getIndexFromChoices(choices: Choice[], value: string) {
  let idx = 0
  for (const choice of choices as Choice[]) {
    if (choice.value === value) {
      return idx
    }
    idx++
  }
  return 0
}

type SelectWithCustomOptions = {
    message: string;
    choices: readonly { name: string; value: string }[];
    customLabel?: string;
    customInputMessage?: string;
    initial?: string;
};

export async function selectWithCustom(
    config: SelectWithCustomOptions
): Promise<string> {
    const {
        message,
        choices,
        initial = undefined,
        customLabel = 'Other...',
        customInputMessage = 'Enter custom value:',
    } = config;

    const CUSTOM = '__custom__' as const;

    const selected = await select<string>({
        message,
        choices: [
            ...choices,
            {
                value: CUSTOM,
                name: customLabel,
            },
        ],
        default: initial,
    });

    if (selected === CUSTOM) {
        const customValue = await input({
            message: customInputMessage,
            validate: (value: string) =>
                value.trim().length > 0 ? true : 'Value cannot be empty',
        });

        return customValue;
    }

    return selected;
}
