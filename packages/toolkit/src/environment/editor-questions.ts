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

import { findExistingValue } from './utils';
import { Secret, Variable } from './github';
import { AnswerWithNullValue, Answers, QuestionDescriptor } from './custom-types';
import kleur from 'kleur'
import prompts from 'prompts'


function editorQuestion(question: string): Promise<string> {
    return import('@inquirer/prompts').then(({ editor }) =>
        editor({ message: question })
    )
}

export async function askQuestionWithEditor(
    questions: Array<QuestionDescriptor<any>>,
    existingValues: Array<Secret | Variable>
): Promise<AnswerWithNullValue[]> {
    let answers: AnswerWithNullValue[] = [];
    for (const question of questions) {
        const questionWithVariableLabel = {
            ...question,
            message: `${kleur.cyan(question.valueLabel || '')}: ${question.message}`
        }
        if (!questionWithVariableLabel.valueLabel) {
            throw Error("Undefined Label")
        }
        const existingSecret = findExistingValue(
            questionWithVariableLabel.valueLabel,
            'SECRET',
            questionWithVariableLabel.scope,
            existingValues
        )
        let updateSecret = true;
        if (existingSecret) {
            updateSecret = (await prompts([{
                name: 'overWrite',
                type: 'confirm' as const,
                message: `${kleur.yellow(
                    `${existingSecret.scope === 'REPOSITORY'
                        ? 'Repository secret'
                        : 'Secret'
                    } ${kleur.cyan(
                        existingSecret.name
                    )} already exists in Github. Do you want to update it?`
                )}`
            }])).overWrite
        }

        if (!existingSecret || updateSecret === true) {
            const question_answer = await editorQuestion(questionWithVariableLabel.message);
            const answer: AnswerWithNullValue = {
                type: 'SECRET',
                scope: 'ENVIRONMENT',
                name: questionWithVariableLabel.valueLabel,
                value: question_answer,
                didExist: existingSecret
            }
            answers.push(answer);
        }
    }
    return answers;
}
